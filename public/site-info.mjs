import {language} from './i18n.mjs';
import {business,legalContent} from './legal-content.mjs';
import {consent,saveConsent,CONSENT_KEY,preferencesEnabled} from './privacy-storage.mjs';
const copy=legalContent[language],escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ui={ru:{title:'Ваш выбор хранения',description:'Необходимые данные обеспечивают работу сайта. С вашего разрешения сохраним подборку и эскиз между посещениями. Аналитики и рекламных трекеров нет.',necessary:'Только необходимые',allow:'Разрешить сохранение',manage:'Настроить',close:'Закрыть настройки',label:'Сохранять подборку и эскиз между посещениями',note:'Необходимые данные для входа, языка и выбора cookies остаются включёнными. Дополнительное хранение можно отключить в любой момент.',save:'Сохранить выбор',error:'Не удалось полностью сохранить настройки. Проверьте разрешение браузера на хранение данных и попробуйте ещё раз.',form:'При переходе в WhatsApp данные формы передаются этому сервису для подготовки сообщения. Отправляете его вы.',read:'Подробнее о данных',source:'Исходный каталог поставщика — на китайском языке.'},kk:{title:'Сақтау туралы таңдауыңыз',description:'Қажетті деректер сайттың жұмысын қамтамасыз етеді. Рұқсатыңызбен таңдама мен нобайды келесі кірулерге сақтаймыз. Аналитика мен жарнамалық трекерлер жоқ.',necessary:'Тек қажеттілері',allow:'Сақтауға рұқсат беру',manage:'Баптау',close:'Баптауларды жабу',label:'Таңдама мен нобайды келесі кірулерге сақтау',note:'Кіруге, тілге және cookies таңдауына қажет деректер қосулы қалады. Қосымша сақтауды кез келген уақытта өшіруге болады.',save:'Таңдауды сақтау',error:'Баптаулар толық сақталмады. Браузердің деректерді сақтау рұқсатын тексеріп, қайталап көріңіз.',form:'WhatsApp-қа өткенде форма деректері хабарлама дайындау үшін сол сервиске беріледі. Хабарламаны сіз жібересіз.',read:'Деректер туралы толығырақ',source:'Жеткізушінің бастапқы каталогы қытай тілінде.'},en:{title:'Your storage choice',description:'Necessary data keeps the website working. With your permission, we will remember your selection and design between visits. There are no analytics or advertising trackers.',necessary:'Necessary only',allow:'Allow preferences',manage:'Settings',close:'Close settings',label:'Remember my selection and design between visits',note:'Necessary data for sign-in, language and your cookie choice remains enabled. Optional storage can be disabled at any time.',save:'Save choice',error:'Settings could not be fully saved. Check your browser storage permissions and try again.',form:'Opening WhatsApp passes the form details to that service to prepare a message. You send it yourself.',read:'How your data is used',source:'The original supplier catalog is in Chinese.'}}[language];
const link=key=>`${key}.html?lang=${language}`;
const footer=document.createElement('section');footer.className='site-details';footer.dataset.noTranslate='';
footer.innerHTML=`<div><strong>${escape(business.name)}</strong><span>${({ru:'БИН',kk:'БСН',en:'BIN'})[language]} ${business.bin}</span><span>${escape(business.address[language])}</span><a href="${business.telephone}">${business.phone}</a></div><nav aria-label="${escape(copy.business)}">${['business','privacy','terms','refund','cookies'].map(key=>`<a href="${link(key)}">${copy[key]}</a>`).join('')}<button type="button" data-cookie-settings>${copy.settings}</button></nav>`;
(document.querySelector('main')||document.body).append(footer);
const banner=document.createElement('aside');banner.id='cookie-banner';banner.className='cookie-banner';banner.dataset.noTranslate='';banner.setAttribute('aria-labelledby','cookie-title');banner.hidden=!!consent();
banner.innerHTML=`<div><p class="eyebrow">IKIGAI / PRIVACY</p><h2 id="cookie-title">${ui.title}</h2><p>${ui.description} <a href="${link('cookies')}">${copy.cookies} ›</a></p><p class="cookie-error" role="status"></p></div><div class="cookie-actions"><button type="button" class="consent-choice" data-choice="no">${ui.necessary}</button><button type="button" class="consent-choice" data-choice="yes">${ui.allow}</button><button type="button" class="consent-settings" data-cookie-settings>${ui.manage}</button></div>`;
document.body.append(banner);
const dialog=document.createElement('dialog');dialog.id='cookie-dialog';dialog.className='cookie-dialog';dialog.dataset.noTranslate='';dialog.setAttribute('aria-labelledby','cookie-settings-title');
dialog.innerHTML=`<button type="button" class="dialog-close" aria-label="${ui.close}">×</button><p class="eyebrow">IKIGAI / PRIVACY</p><h2 id="cookie-settings-title">${copy.settings}</h2><p>${ui.note}</p><label><input id="cookie-preferences" type="checkbox"><span>${ui.label}</span></label><a href="${link('cookies')}">${copy.cookies} ›</a><p class="cookie-error" role="status"></p><button type="button" class="dark-button" id="save-cookie-choice">${ui.save}<span>›</span></button>`;
document.body.append(dialog);
function choose(value){
 try{saveConsent(value);banner.hidden=true;dialog.close();location.reload();}
 catch{document.querySelectorAll('.cookie-error').forEach(el=>el.textContent=ui.error);}
}
document.addEventListener('click',event=>{
 if(event.target.closest('[data-cookie-settings]')){document.querySelector('#cookie-preferences').checked=preferencesEnabled();dialog.showModal();}
 const choice=event.target.closest('[data-choice]');if(choice)choose(choice.dataset.choice==='yes');
});
dialog.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());
dialog.querySelector('#save-cookie-choice').addEventListener('click',()=>choose(dialog.querySelector('input').checked));
addEventListener('storage',event=>{if(event.key===CONSENT_KEY)location.reload();});
function formNotes(root){
 for(const form of root.querySelectorAll('form:not(#product-form)')){
  if(!['contact-form','selection-form','fit-form'].includes(form.id)||form.querySelector('.privacy-form-note'))continue;
  const note=document.createElement('p');note.className='privacy-form-note';note.dataset.noTranslate='';note.innerHTML=`${ui.form} <a href="${link('privacy')}">${ui.read} ›</a>`;form.append(note);
 }
 for(const anchor of root.querySelectorAll('a[href*="downloads/meidu-2026.pdf"]'))anchor.title=ui.source;
}
for(const note of document.querySelectorAll('#selection-form .form-note')){note.dataset.noTranslate='';note.textContent=preferencesEnabled()?({ru:'Подборка сохранена в этом браузере. Сообщение отправляете вы.',kk:'Таңдама осы браузерде сақталады. Хабарламаны сіз жібересіз.',en:'Your selection is saved in this browser. You send the message yourself.'})[language]:({ru:'Подборка доступна в текущей вкладке. Сообщение отправляете вы.',kk:'Таңдама осы қойындыда қолжетімді. Хабарламаны сіз жібересіз.',en:'Your selection is available in this tab. You send the message yourself.'})[language];}
formNotes(document);
new MutationObserver(records=>{if(records.some(r=>[...r.addedNodes].some(n=>n.nodeType===1&&(n.matches?.('form')||n.querySelector?.('form')))))formNotes(document);}).observe(document.querySelector('main')||document.body,{childList:true,subtree:true});
