import {language} from './i18n.mjs';
import {availabilityText} from './availability.mjs';
import {preferenceStorage,preferencesEnabled} from './privacy-storage.mjs';
import {loadCatalog,catalogUnavailable} from './catalog-client.mjs';
import {priceLabel,fitEnquiry} from './order-model.mjs';
import {kitsSection} from './kits.mjs';
const {products,series,categories,categoryLabels}=await loadCatalog().catch(error=>{catalogUnavailable();throw error;});
import {filterProducts,restoreSelection,toggleSelection,createEnquiry,escapeHTML,featuredState} from './store.mjs';

const $=(s,root=document)=>root.querySelector(s);
const $$=(s,root=document)=>[...root.querySelectorAll(s)];
const displayProduct=p=>Object.fromEntries(Object.entries(p).map(([key,value])=>[key,Array.isArray(value)?value.map(escapeHTML):escapeHTML(value)]));
const storageKey='ikigai-wardrobe-selection-v1';
let selection=[],sessionOnly=false;
if(!sessionOnly)try{selection=restoreSelection(preferenceStorage.getItem(storageKey),products);}catch{}
let filter='all',query='',insideId='accessories',materialIndex=0,openProductId=null;
let toastTimer;
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
const grid=$('#catalog-grid');
function announce(text){clearTimeout(toastTimer);$('#toast').textContent=text;$('#toast').classList.add('visible');toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),2600);}
function syncCounts(){$$('[data-count]').forEach(el=>{el.textContent=selection.length;});}
function saveSelection(){let persisted=true;try{preferenceStorage.setItem(storageKey,JSON.stringify(selection));}catch{persisted=false;sessionOnly=true;}syncCounts();return persisted;}
function syncSaveButtons(){
 $$('[data-save]').forEach(button=>{const saved=selection.includes(button.dataset.save),p=products.find(p=>p.id===button.dataset.save);button.setAttribute('aria-pressed',String(saved));if(button.classList.contains('save-button')){button.textContent=saved?'✓':'+';button.setAttribute('aria-label',`${saved?'Убрать из подборки':'Добавить в подборку'}: ${p.name}`);}else{button.innerHTML=saved?'В подборке <span>✓</span>':'В мою подборку <span>+</span>';}});
 const state=featuredState(products,selection,palettes[materialIndex].product);$('#material-save').disabled=!state.available;if(!state.available){$('#material-save').textContent='Решение обновляется';return;}$('#material-save').innerHTML=state.selected?'Решение в подборке <span>✓</span>':'Добавить решение в подборку <span>+</span>';
}
function toggleProduct(id){if(!products.some(p=>p.id===id))return;if(!sessionOnly)try{selection=restoreSelection(preferenceStorage.getItem(storageKey),products);}catch{}selection=toggleSelection(selection,id);const persisted=saveSelection();syncSaveButtons();renderSelection();announce(!persisted?'Подборка доступна до закрытия этой вкладки.':selection.includes(id)?'Решение добавлено в вашу подборку':'Решение убрано из подборки');}
function renderCatalog(){
 const preferred=['glass-dark','meidu-062','accessories','shelves','meidu-044','meidu-067'];
 const ordered=[...preferred.map(id=>products.find(p=>p.id===id)).filter(Boolean),...products.filter(p=>!preferred.includes(p.id))];
 const matching=filterProducts(ordered,filter,query),found=matching.slice(0,6);
 grid.innerHTML=found.map(raw=>{const p=displayProduct(raw);return `<article class="product-card"><div class="card-media"><a class="card-open" href="catalog.html?product=${p.id}" aria-label="Рассмотреть: ${p.name}"><img src="${p.image}" alt="${p.name}" loading="lazy" width="800" height="1000"><span class="card-explore" aria-hidden="true">›</span></a><button class="save-button" data-save="${p.id}" aria-pressed="${selection.includes(p.id)}" aria-label="Добавить в подборку: ${p.name}">+</button></div><div class="card-label"><span>${p.tag}</span></div><h3 class="card-title"><a href="catalog.html?product=${p.id}">${p.name}</a></h3><p class="card-price">${escapeHTML(priceLabel(raw))}</p>${stockInfo(raw)}</article>`;}).join('');
 $('#empty-search').hidden=found.length>0;
 $('#catalog-count').textContent=`Показано ${found.length} из ${matching.length} решений`;
 syncSaveButtons();
}
function renderSelection(){
 const found=products.filter(p=>selection.includes(p.id));
 $('#selected-products').innerHTML=found.length?found.map(raw=>{const p=displayProduct(raw);return `<article class="selected-product"><img src="${p.image}" alt="${p.name}" width="75" height="85"><div><h3>${p.name}</h3><p>${categoryLabels[p.category]}</p></div><button class="remove-product" data-remove="${p.id}" aria-label="Удалить из подборки: ${p.name}">×</button></article>`;}).join(''):'<div class="selection-empty">Здесь появятся решения, которые вам понравились.<button class="text-link" id="browse-catalog">Посмотреть коллекцию <span>›</span></button></div>';
}
function updateModalState(){document.body.classList.toggle('modal-open',!!$('dialog[open]'));}
function openDialog(id){const dlg=$(id);if(dlg.open)return;dlg.showModal();updateModalState();}
function openProduct(id){
 const raw=products.find(p=>p.id===id);if(!raw)return;const p=displayProduct(raw);openProductId=id;
 $('#product-content').innerHTML=`<div class="product-layout"><img class="product-image" src="${p.image}" alt="${p.name}"><div class="product-detail"><p class="eyebrow">${categoryLabels[p.category]}</p><h2 id="product-title">${p.name}</h2><p class="product-description">${p.description}</p>${stockInfo(raw,true)}<ul class="product-specs">${p.details.map(d=>`<li>${d}</li>`).join('')}</ul><p class="product-source">${p.source}</p><button class="dark-button" data-save="${p.id}" aria-pressed="false">В мою подборку <span>+</span></button><p class="product-disclaimer"><a class="text-link" href="catalog.html?product=${p.id}">Страница изделия и чертежи ›</a><br>Изображение показывает вариант решения. Наличие, размеры, состав и стоимость уточняются при обсуждении проекта.</p></div></div>`;
 syncSaveButtons();openDialog('#product-dialog');
}
$$('dialog').forEach(dlg=>{
 $('.dialog-close',dlg).addEventListener('click',()=>dlg.close());
 dlg.addEventListener('close',()=>{updateModalState();if(dlg.id==='product-dialog')openProductId=null;});
 dlg.addEventListener('click',e=>{if(e.target!==dlg)return;const r=dlg.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dlg.close();});
});
document.addEventListener('click',e=>{
 const target=e.target.closest('button');if(!target)return;
 if(target.hasAttribute('data-product'))openProduct(target.dataset.product);
 if(target.hasAttribute('data-save'))toggleProduct(target.dataset.save);
 if(target.hasAttribute('data-remove')){const items=$$('.remove-product'),index=items.indexOf(target);toggleProduct(target.dataset.remove);const next=$$('.remove-product');(next[Math.min(index,next.length-1)]||$('#selection-form input')).focus();}
 if(target.hasAttribute('data-open-collection')){renderSelection();openDialog('#collection-dialog');}
 if(target.hasAttribute('data-open-payment'))openDialog('#payment-dialog');
 if(target.id==='browse-catalog'){$('#collection-dialog').close();$('#collection').scrollIntoView({behavior:reduced.matches?'instant':'smooth'});$('[data-filter="all"]').focus({preventScroll:true});}
});
$$('[data-filter]').forEach(button=>button.addEventListener('click',()=>{filter=button.dataset.filter;$$('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));renderCatalog();}));
$('#catalog-search').addEventListener('input',e=>{query=e.target.value;renderCatalog();});
$('#reset-search').addEventListener('click',()=>{query='';filter='all';$('#catalog-search').value='';$$('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.filter==='all')));renderCatalog();$('#catalog-search').focus();});

let imageJobs=new WeakMap();
function changeImage(el,src,alt){
 const token={};imageJobs.set(el,token);const loader=new Image();loader.src=src;
 const ready=()=>{if(imageJobs.get(el)!==token)return;el.style.opacity='0';setTimeout(()=>{if(imageJobs.get(el)!==token)return;el.src=src;el.alt=alt;el.style.opacity='1';},reduced.matches?0:180);};
 if(loader.complete)ready();else{loader.onload=ready;loader.onerror=()=>{el.style.opacity='1';};}
}
$$('[data-inside]').forEach(button=>button.addEventListener('click',()=>{insideId=button.dataset.inside;const p=products.find(p=>p.id===insideId);$('#inside-details').disabled=!p;if(!p)return;changeImage($('#inside-photo'),p.image,p.name);$('#inside-photo-note').textContent=p.source;$$('[data-inside]').forEach(b=>{b.classList.toggle('selected',b===button);b.setAttribute('aria-pressed',String(b===button));});}));
$('#inside-details').addEventListener('click',()=>openProduct(insideId));
const palettes=[{title:'Графит<br><em>и стекло.</em>',description:'Чёткая линия профиля, глубина тёмных оттенков и прозрачность стекла. Выразительно, но спокойно.',product:'glass-dark'},{title:'Тёплая<br><em>бронза.</em>',description:'Тёплые оттенки профиля, мягкий свет и стеклянные фасады. Гардеробная, которая продолжает палитру вашего дома.',product:'glass-bronze'},{title:'Мягкий<br><em>свет.</em>',description:'Светлая палитра и деликатная фактура стекла. Воздушное решение с ощущением спокойствия и простора.',product:'glass-soft'}];
$$('[data-material]').forEach(button=>button.addEventListener('click',()=>{materialIndex=Number(button.dataset.material);const palette=palettes[materialIndex],p=products.find(p=>p.id===palette.product);$('#material-title').innerHTML=palette.title;$('#material-description').textContent=palette.description;if(p)changeImage($('#material-photo'),p.image,p.name);$$('[data-material]').forEach(b=>{b.classList.toggle('selected',b===button);b.setAttribute('aria-pressed',String(b===button));});syncSaveButtons();}));
$('#material-save').addEventListener('click',()=>toggleProduct(palettes[materialIndex].product));

$('#payment-to-selection').addEventListener('click',()=>{$('#payment-dialog').close();renderSelection();openDialog('#collection-dialog');});
for(const id of ['#contact-form','#selection-form'])$(id).addEventListener('submit',e=>{e.preventDefault();const data=Object.fromEntries(new FormData(e.currentTarget));window.open(createEnquiry(products,selection,data),'_blank','noopener,noreferrer');});

const menu=$('.mobile-menu'),nav=$('#main-nav');
function closeMenu(){menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Открыть меню');nav.classList.remove('open');}
menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Закрыть меню':'Открыть меню');nav.classList.toggle('open',open);});
$$('#main-nav a').forEach(a=>a.addEventListener('click',closeMenu));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav.classList.contains('open')){closeMenu();menu.focus();}});
window.addEventListener('resize',()=>{if(window.innerWidth>960)closeMenu();},{passive:true});

let pending=false;
const sections=$$('#home,#collection,#inside,#materials,#process,#contact');
function onScroll(){
 if(pending)return;pending=true;requestAnimationFrame(()=>{const max=document.documentElement.scrollHeight-innerHeight;$('.progress i').style.transform=`scaleX(${max>0?scrollY/max:0})`;let active=sections[0];for(const s of sections)if(s.getBoundingClientRect().top<innerHeight*.4)active=s;$$('#main-nav a').forEach(a=>{const current=a.getAttribute('href')==='#'+active.id;a.classList.toggle('active',current);if(current)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});pending=false;});
}
addEventListener('scroll',onScroll,{passive:true});
addEventListener('storage',event=>{if(preferencesEnabled()&&event.key===storageKey){selection=restoreSelection(event.newValue,products);syncCounts();syncSaveButtons();renderSelection();}});
addEventListener('pageshow',()=>{if(!sessionOnly)try{selection=restoreSelection(preferenceStorage.getItem(storageKey),products);}catch{}syncCounts();syncSaveButtons();renderSelection();});
$$('[data-inside]').forEach(b=>{b.disabled=!products.some(p=>p.id===b.dataset.inside);});
$('#inside-details').disabled=!products.some(p=>p.id===insideId);
if($('#inside-details').disabled)$$('[data-inside]').find(button=>!button.disabled)?.click();
$('[data-filter="all"] sup').textContent=String(products.length).padStart(2,'0');
syncCounts();renderCatalog();renderSelection();onScroll();

function stockInfo(product,detail=false){const info=availabilityText(product,language);return `<div class="product-availability" data-status="${info.status}" data-no-translate><span><i aria-hidden="true"></i>${escapeHTML(info.label)}</span><small>${escapeHTML(info.timing)}</small>${detail&&info.note?`<small class="lead-time-note">${escapeHTML(info.note)}</small>`:''}</div>`;}
