import {availabilityText} from './availability.mjs';
import {language} from './i18n.mjs';
import {preferenceStorage,preferencesEnabled} from './privacy-storage.mjs';
import {loadCatalog,catalogUnavailable} from './catalog-client.mjs';
import {priceLabel,fitEnquiry} from './order-model.mjs';
import {kitsSection} from './kits.mjs';
const {products,series,categories,categoryLabels}=await loadCatalog().catch(error=>{catalogUnavailable();throw error;});
import {resolveCatalog,queryCatalog} from './catalog-logic.mjs';
import {restoreSelection,toggleSelection,createEnquiry,escapeHTML as e} from './store.mjs';

const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const route=resolveCatalog(new URLSearchParams(location.search),products,series,categories);
const storageKey='ikigai-wardrobe-selection-v1';
let selection=[],sessionOnly=false;if(!sessionOnly)try{selection=restoreSelection(preferenceStorage.getItem(storageKey),products);}catch{}
let query=new URLSearchParams(location.search).get('q')||'',limit=12,timer;
const url=(key,value)=>`catalog.html?${key}=${encodeURIComponent(value)}`;
const productLink=p=>url('product',p.id);
function card(p){return `<article class="product-card"><div class="card-media"><a class="card-open" href="${productLink(p)}"><img src="${e(p.image)}" alt="${e(p.name)}" loading="lazy" width="800" height="1000"><span class="card-index">${p.page?'MEIDU / '+String(p.page).padStart(2,'0'):'IKIGAI'}</span><span class="card-explore" aria-hidden="true">›</span></a><button class="save-button" data-save="${e(p.id)}" aria-pressed="false" aria-label="Добавить: ${e(p.name)}">+</button></div><p class="card-label">${e(p.model||p.seriesName)}</p><h3 class="card-title"><a href="${productLink(p)}">${e(p.name)}</a></h3><p class="card-price">${e(priceLabel(p))}</p>${stockInfo(p)}</article>`;}
function seriesCard(s){return `<a class="series-card" href="${url('series',s.id)}"><img src="${e(s.image)}" alt="${e(s.name)}" loading="lazy" width="600" height="450"><span><strong>${e(s.name)}</strong><small>Позиций в каталоге: ${s.count}</small></span><b aria-hidden="true">›</b></a>`;}
function crumbs(items=[]){return `<nav class="breadcrumbs" aria-label="Путь по каталогу"><a href="index.html">Главная</a><span>/</span><a href="catalog.html">Каталог</a>${items.map(item=>`<span>/</span>${item.href?`<a href="${item.href}">${e(item.name)}</a>`:`<span aria-current="page">${e(item.name)}</span>`}`).join('')}</nav>`;}
const categoryNav=active=>`<nav class="category-nav" aria-label="Категории"><a href="catalog.html" ${active?'':'aria-current="page"'}>Все изделия <span>${products.length}</span></a>${categories.map(c=>`<a href="${url('category',c.id)}" ${active===c.id?'aria-current="page"':''}>${e(c.name)}<span>${products.filter(p=>p.category===c.id).length}</span></a>`).join('')}</nav>`;
function renderListing(){
 const cat=route.type==='category'?route.category:null,s=route.type==='series'?route.series:null;
 const active=cat?.id||s?.category||'';
 const title=cat?.name||s?.name||({ru:'Каталог <em>решений.</em>',kk:'Шешімдер <em>каталогы.</em>',en:'A catalog of <em>possibilities.</em>'})[language];
 const description=cat?.description|| (s?'Изделия и варианты серии из каталога MEIDU. Рассмотрите детали и сохраните то, что подходит вашему проекту.':'Гардеробные системы, стеклянные фасады и детали хранения. От целого пространства — к каждой линии.');
 let banner=s?`<div class="series-hero"><img src="${e(s.image)}" alt="${e(s.name)}" fetchpriority="high"><div><p class="eyebrow">MEIDU / Серия</p><h1>${e(title)}</h1><p>${e(description)}</p><span>Позиций: ${s.count} · Каталог 2026</span><a class="text-link" href="#items">Рассмотреть изделия ↓</a></div></div>`:`<header class="catalog-heading"><p class="eyebrow">MEIDU / Коллекция 2026</p><h1>${cat?e(title):title}</h1><p>${e(description)}</p></header>`;
 const relevant=series.filter(item=>!active||item.category===active);
 const collections=route.type==='catalog'?kitsSection()+`<section class="category-tiles" aria-label="Разделы каталога">${categories.map((c,i)=>`<a href="${url('category',c.id)}"><img src="${e(c.image)}" alt="" loading="lazy"><div><h2>${e(c.name)}</h2><b aria-hidden="true">›</b></div></a>`).join('')}</section>`:'';
 const groups=cat?`<section class="series-section"><div class="small-heading"><h2>Серии коллекции</h2><span>${relevant.length} серий</span></div><div class="series-grid">${relevant.map(seriesCard).join('')}</div></section>`:'';
 $('#catalog-view').innerHTML=crumbs(cat?[{name:cat.name}]:s?[{name:categoryLabels[s.category],href:url('category',s.category)},{name:s.name}]:[])+banner+collections+`<div class="catalog-layout">${categoryNav(active)}<div class="catalog-results">${groups}<section id="items"><div class="results-toolbar"><div><p class="eyebrow">${s?'Изделия серии':'Найдите своё решение'}</p><h2>${s?'В этой серии':'Все изделия'}</h2></div><label class="catalog-search"><span>Поиск по названию или коду</span><input id="full-search" type="search" placeholder="Например: MD-019 или полки" value="${e(query)}"></label></div><p id="result-count" role="status" class="result-count"></p><div id="full-grid" class="catalog-grid"></div><div id="no-results" class="empty-search" hidden><h3>Ничего не найдено</h3><p>Попробуйте другое название или код изделия.</p><button class="text-link" id="clear-query">Сбросить поиск ›</button><a href="catalog.html" class="text-link">Все категории ›</a></div><button id="load-more" class="outline-button">Показать ещё <span>+</span></button></section></div></div><section class="download-banner"><div><p class="eyebrow">Для вашего проекта</p><h2>Вся коллекция.<br><em>В одном каталоге.</em></h2><p>MEIDU 2026 · 83 страницы · PDF, экранная версия</p></div><a class="light-button" href="downloads/meidu-2026.pdf" download>Скачать каталог <span>↓</span></a></section>`;
 $('#full-search').addEventListener('input',event=>{query=event.target.value;limit=12;const next=new URL(location.href);query?next.searchParams.set('q',query):next.searchParams.delete('q');history.replaceState(null,'',next);renderResults();});
 $('#clear-query').addEventListener('click',()=>{$('#full-search').value='';$('#full-search').dispatchEvent(new Event('input'));$('#full-search').focus();});
 $('#load-more').addEventListener('click',()=>{const previous=limit;limit+=12;renderResults();$('#full-grid .product-card:nth-child('+(previous+1)+') a')?.focus({preventScroll:true});});
 renderResults();
}
function renderResults(){
 const found=queryCatalog(products,{category:route.type==='category'?route.category.id:'all',series:route.type==='series'?route.series.id:'',query});
 const shown=found.slice(0,limit);$('#full-grid').innerHTML=shown.map(card).join('');
 $('#result-count').textContent=`Показано ${shown.length} из ${found.length} позиций`;
 $('#no-results').hidden=found.length>0;$('#load-more').hidden=found.length<=limit;syncButtons();
}
function renderProduct(p){
 const s=series.find(s=>s.id===p.series),siblings=products.filter(x=>x.series===p.series),related=siblings.filter(x=>x.id!==p.id).slice(0,3);
 if(related.length<3)related.push(...products.filter(x=>x.category===p.category&&x.id!==p.id&&!related.includes(x)).slice(0,3-related.length));
 document.title=`${p.name} — IKIGAI / MEIDU`;
 const previous=siblings[siblings.indexOf(p)-1],next=siblings[siblings.indexOf(p)+1];
 $('#catalog-view').innerHTML=crumbs([{name:categoryLabels[p.category],href:url('category',p.category)},{name:s.name,href:url('series',s.id)},{name:p.model||(p.page?'Стр. '+p.page:p.name)}])+`<section class="detail-layout"><div class="detail-gallery"><button class="main-photo" data-zoom aria-label="Увеличить фотографию"><img id="detail-image" src="${e(p.image)}" alt="${e(p.name)}" fetchpriority="high"></button><div class="gallery-thumbs" role="group" aria-label="Фотографии и чертежи"><button data-gallery="photo" aria-pressed="true"><img src="${e(p.image)}" alt=""><span>В интерьере</span></button><button data-gallery="sheet" aria-pressed="false"><img src="${e(p.sheet)}" alt=""><span>${p.page?'Лист каталога':'Фотография'}</span></button><span>Нажмите на фото,<br>чтобы увеличить ›</span></div></div><div class="detail-info"><a class="eyebrow" href="${url('series',s.id)}">${e(s.name)} ›</a><h1>${e(p.name)}</h1><p class="detail-code">${p.model?`Обозначение: <strong>${e(p.model)}</strong> · `:''}${p.page?'MEIDU / стр. '+p.page:'IKIGAI / Каталог'}</p><p class="detail-description">${e(p.description)}</p>${stockInfo(p,true)}<div class="detail-price"><span>${e(priceLabel(p))}</span><small>Размеры и комплектацию согласуем перед заказом</small></div><button class="dark-button" data-save="${e(p.id)}" aria-pressed="false">В мою подборку <span>+</span></button><a class="text-link" href="${e(createEnquiry(products,[p.id]))}" target="_blank" rel="noopener noreferrer">Уточнить стоимость в WhatsApp <span>›</span></a><p class="detail-note">${p.page?'Фотографии и характеристики — из каталога поставщика. ':''}Итоговые материалы, размеры и состав заказа согласуем с вами.</p><a class="sheet-link" href="${e(p.sheet)}" download>${p.page?'Скачать лист с чертежами':'Скачать фотографию'} <span>↓</span></a></div></section>
 <section class="fit-section" aria-labelledby="fit-title"><div><p class="eyebrow">До оформления заказа</p><h2 id="fit-title">Подойдёт ли<br><em>для моего шкафа?</em></h2><p>Укажите внутренние размеры свободного места. Менеджер проверит возможность установки выбранной модели.</p><p class="fit-hint">Измеряйте внутри шкафа, без толщины стенок. Если есть петли, трубы или другие препятствия — напишите ниже.</p></div><form id="fit-form"><p class="fit-product">Вы выбрали: <strong>${e(p.name)}</strong>${p.model?' · '+e(p.model):''}</p><div class="fit-dimensions"><label>Ширина, мм<input name="width" type="number" min="1" max="10000" step="1" required inputmode="numeric" placeholder="600"></label><label>Высота, мм<input name="height" type="number" min="1" max="10000" step="1" required inputmode="numeric" placeholder="720"></label><label>Глубина, мм<input name="depth" type="number" min="1" max="10000" step="1" required inputmode="numeric" placeholder="550"></label></div><label>Что ещё нужно учесть?<textarea name="comment" maxlength="1000" rows="2" placeholder="Например: слева петли, нужен выдвижной ящик"></textarea></label><p id="fit-error" role="alert"></p><button class="dark-button" type="submit">Проверить с менеджером <span>›</span></button><p class="form-note">Откроется текст в WhatsApp. Вы проверяете и отправляете его сами. Совместимость подтвердим после проверки размеров и креплений.</p></form></section><section class="technical-section"><div><p class="eyebrow">В деталях</p><h2>Характеристики<br><em>и материалы.</em></h2><p>${p.page?'Данные производителя для показанного варианта. Полный лист с чертежами можно открыть в галерее.':'Характеристики выбранного изделия. Детали и комплектацию уточним при обсуждении заказа.'}</p></div><dl>${p.details.map(spec=>`<div><dt>${e(spec.includes(':')?spec.slice(0,spec.indexOf(':')):'Особенность')}</dt><dd>${e(spec.includes(':')?spec.slice(spec.indexOf(':')+1).trim():spec)}</dd></div>`).join('')}<div><dt>Источник</dt><dd>${e(p.source)}</dd></div></dl></section>
 <nav class="product-pager" aria-label="Изделия серии">${previous?`<a href="${productLink(previous)}">← Предыдущее изделие</a>`:'<span></span>'}<a href="${url('series',s.id)}">Вся серия</a>${next?`<a href="${productLink(next)}">Следующее изделие →</a>`:'<span></span>'}</nav>
 <section class="related-section"><div class="small-heading"><h2>Рядом по характеру.</h2><a href="${url('category',p.category)}">Вся категория ›</a></div><div class="catalog-grid">${related.map(card).join('')}</div></section>`;
 $('#fit-form').addEventListener('submit',event=>{event.preventDefault();try{const href=fitEnquiry(p,Object.fromEntries(new FormData(event.currentTarget)));$('#fit-error').textContent='';window.open(href,'_blank','noopener,noreferrer');}catch(error){$('#fit-error').textContent=error.message;}});
 $$('[data-gallery]').forEach(button=>button.addEventListener('click',()=>{const sheet=button.dataset.gallery==='sheet';$('#detail-image').src=sheet?p.sheet:p.image;$('#detail-image').alt=sheet?(p.page?`Лист каталога MEIDU, страница ${p.page}`:p.name):p.name;$('#detail-image').classList.toggle('technical',sheet);$$('[data-gallery]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));}));
 $('[data-zoom]').addEventListener('click',()=>{$('#sheet-zoom').src=$('#detail-image').src;$('#sheet-zoom').alt=$('#detail-image').alt;openDialog('#sheet-dialog');});
 syncButtons();
}
function syncButtons(){
 $$('[data-count]').forEach(el=>el.textContent=selection.length);
 $$('[data-save]').forEach(button=>{const p=products.find(p=>p.id===button.dataset.save),saved=selection.includes(p.id);button.setAttribute('aria-pressed',String(saved));button.setAttribute('aria-label',`${saved?'Убрать из подборки':'Добавить в подборку'}: ${p.name}`);button.innerHTML=button.classList.contains('save-button')?(saved?'✓':'+'):(saved?'В подборке <span>✓</span>':'В мою подборку <span>+</span>');});
}
function announce(message){clearTimeout(timer);$('#toast').textContent=message;$('#toast').classList.add('visible');timer=setTimeout(()=>$('#toast').classList.remove('visible'),2600);}
function toggle(id){if(!products.some(p=>p.id===id))return;if(!sessionOnly)try{selection=restoreSelection(preferenceStorage.getItem(storageKey),products);}catch{}selection=toggleSelection(selection,id);let persisted=true;try{preferenceStorage.setItem(storageKey,JSON.stringify(selection));}catch{persisted=false;sessionOnly=true;}syncButtons();renderSelection();announce(persisted?(selection.includes(id)?'Изделие добавлено в подборку':'Изделие убрано из подборки'):'Подборка доступна до закрытия вкладки');}
function renderSelection(){const found=products.filter(p=>selection.includes(p.id));$('#selected-products').innerHTML=found.length?found.map(p=>`<article class="selected-product"><a href="${productLink(p)}"><img src="${e(p.image)}" alt="${e(p.name)}" width="75" height="85"></a><div><h3><a href="${productLink(p)}">${e(p.name)}</a></h3><p>${e(p.model||p.seriesName)}${p.page?' · стр. '+p.page:''}</p></div><button class="remove-product" data-remove="${e(p.id)}" aria-label="Удалить: ${e(p.name)}">×</button></article>`).join(''):'<div class="selection-empty">Здесь появятся понравившиеся изделия.<a class="text-link" href="catalog.html">Посмотреть каталог ›</a></div>';}
function openDialog(id){const dlg=$(id);if(!dlg.open)dlg.showModal();document.body.classList.add('modal-open');}
$$('dialog').forEach(dlg=>{
 $('.dialog-close',dlg).addEventListener('click',()=>dlg.close());
 dlg.addEventListener('close',()=>document.body.classList.toggle('modal-open',!!$('dialog[open]')));
 dlg.addEventListener('click',event=>{if(event.target!==dlg)return;const r=dlg.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dlg.close();});
});
document.addEventListener('click',event=>{const button=event.target.closest('button');if(!button)return;
 if(button.hasAttribute('data-save'))toggle(button.dataset.save);
 if(button.hasAttribute('data-remove')){const at=$$('[data-remove]').indexOf(button);toggle(button.dataset.remove);const remaining=$$('[data-remove]');(remaining[Math.min(at,remaining.length-1)]||$('#selection-form input')).focus();}
 if(button.hasAttribute('data-open-collection')){renderSelection();openDialog('#collection-dialog');}
 if(button.hasAttribute('data-open-payment'))openDialog('#payment-dialog');
});
$('#selection-form').addEventListener('submit',event=>{event.preventDefault();window.open(createEnquiry(products,selection,Object.fromEntries(new FormData(event.currentTarget))),'_blank','noopener,noreferrer');});
$('#payment-to-selection').addEventListener('click',()=>{$('#payment-dialog').close();renderSelection();openDialog('#collection-dialog');});
const menu=$('.mobile-menu'),nav=$('#main-nav');
function closeMenu(){menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Открыть меню');nav.classList.remove('open');}
menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Закрыть меню':'Открыть меню');nav.classList.toggle('open',open);});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&nav.classList.contains('open')){closeMenu();menu.focus();}});
addEventListener('resize',()=>{if(innerWidth>960)closeMenu();},{passive:true});
addEventListener('storage',event=>{if(preferencesEnabled()&&event.key===storageKey){selection=restoreSelection(event.newValue,products);syncButtons();renderSelection();}});
if(route.type==='missing')$('#catalog-view').innerHTML=crumbs()+`<section class="catalog-heading"><p class="eyebrow">Каталог обновляется</p><h1>Изделие <em>не найдено.</em></h1><p>Возможно, ссылка устарела. Выберите изделие в актуальном каталоге.</p><a href="catalog.html" class="light-button">Открыть каталог ›</a></section>`;
else if(route.type==='product')renderProduct(route.product);else renderListing();
if(route.type==='category')document.title=route.category.name+' — IKIGAI';
if(route.type==='series')document.title=route.series.name+' — IKIGAI';
syncButtons();renderSelection();

addEventListener('pageshow',()=>{if(!sessionOnly)try{selection=restoreSelection(preferenceStorage.getItem(storageKey),products);}catch{}syncButtons();renderSelection();});

function stockInfo(product,detail=false){const info=availabilityText(product,language);return `<div class="product-availability" data-status="${info.status}" data-no-translate><span><i aria-hidden="true"></i>${e(info.label)}</span><small>${e(info.timing)}</small>${detail&&info.note?`<small class="lead-time-note">${e(info.note)}</small>`:''}</div>`;}
