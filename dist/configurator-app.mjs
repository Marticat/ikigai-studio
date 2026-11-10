import {defaultConfig,normalizeConfig,presets,estimateConfig,formatMoney,configEnquiry} from './configurator-model.mjs';
import {wardrobeScene} from './configurator-scene.mjs';
import {realisticScene,photoAssets} from './configurator-realistic.mjs';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const key='ikigai-configurator-v1';
let config={...defaultConfig},doorsOpen=false,view='realistic',sceneRequest=0;
const photoCache=new Map();
function loadPhoto(src){
 if(!photoCache.has(src))photoCache.set(src,new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>{photoCache.delete(src);reject(new Error('photo unavailable'));};img.src=src;}));
 return photoCache.get(src);
}
function syncView(){
 $$('[data-scene-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.sceneView===view)));
 $('#scene-label').textContent=view==='realistic'?'ВАША ГАРДЕРОБНАЯ':'СХЕМА С РАЗМЕРАМИ';
 $('#scene-note').textContent=view==='realistic'?'Концепт визуализации, не фото готового изделия.':'Условная схема. Конструкцию согласуем отдельно.';
}
async function renderScene(){
 const token=++sceneRequest,snapshot={...config},previewOpen=doorsOpen;
 syncView();
 if(view==='schematic'){$('#wardrobe-scene').innerHTML=wardrobeScene(snapshot,{doorsOpen:previewOpen});$('#wardrobe-scene').setAttribute('aria-busy','false');$('#photo-status').textContent='';return;}
 $('#wardrobe-scene').setAttribute('aria-busy','true');$('#photo-status').textContent='Загружаем материалы…';
 try{
  await loadPhoto(photoAssets[snapshot.preset]);
  if(token!==sceneRequest)return;
  $('#wardrobe-scene').innerHTML=realisticScene(snapshot,{doorsOpen:previewOpen});$('#wardrobe-scene').setAttribute('aria-busy','false');$('#photo-status').textContent='';
 }catch{
  if(token!==sceneRequest)return;
  view='schematic';syncView();$('#wardrobe-scene').innerHTML=wardrobeScene(snapshot,{doorsOpen:previewOpen});$('#wardrobe-scene').setAttribute('aria-busy','false');$('#photo-status').textContent='Фото не загрузилось — доступна схема.';
 }
}
try{config=normalizeConfig(JSON.parse(localStorage.getItem(key)));}catch{}
function save(){try{localStorage.setItem(key,JSON.stringify(config));$('#config-save-status').textContent='Эскиз сохранён в этом браузере.';}catch{$('#config-save-status').textContent='Эскиз доступен до закрытия вкладки.';}}
function render(){
 const preset=presets[config.preset],estimate=estimateConfig(config);
 renderScene();
 $$('[data-key]').forEach(b=>b.setAttribute('aria-pressed',String(config[b.dataset.key]===b.dataset.value)));
 $('#config-width').value=config.width;$('#config-height').value=config.height;
 $('#config-width').setAttribute('aria-label','Ширина');$('#config-height').setAttribute('aria-label','Высота');
 $('#config-width').setAttribute('aria-valuetext',config.width+' сантиметров');$('#config-height').setAttribute('aria-valuetext',config.height+' сантиметров');
 $('#width-value').textContent=config.width+' см';$('#height-value').textContent=config.height+' см';
 $('#scene-size').textContent=`${config.width} × ${config.height} × 60 см`;
 $('#preset-description').textContent=preset.description;
 $('#storage-counts').textContent=`Полки: ${preset.shelves} · Штанги: ${preset.rails} · Ящики: ${preset.drawers}`;
 $('#estimate-range').textContent=formatMoney(estimate.low)+' – '+formatMoney(estimate.high);
 $('#estimate-lines').innerHTML=estimate.lines.map(line=>`<div><span>${line.label}</span><span>${formatMoney(line.amount)}</span></div>`).join('')+`<div class="estimate-subtotal"><span>Условный расчёт</span><span>${formatMoney(estimate.total)}</span></div>`;
 $('#config-enquiry').href=configEnquiry(config);
 const button=$('#toggle-doors');button.disabled=config.glass==='open';button.setAttribute('aria-pressed',String(doorsOpen&&config.glass!=='open'));button.innerHTML=config.glass==='open'?'Открытая система <span>✓</span>':doorsOpen?'Закрыть фасады <span>↙</span>':'Рассмотреть внутри <span>↗</span>';
}
$$('[data-key]').forEach(button=>button.addEventListener('click',()=>{config=normalizeConfig({...config,[button.dataset.key]:button.dataset.value});if(button.dataset.key==='glass')doorsOpen=false;save();render();}));
for(const dimension of ['width','height'])$('#config-'+dimension).addEventListener('input',event=>{config=normalizeConfig({...config,[dimension]:event.target.value});save();render();});
$('#toggle-doors').addEventListener('click',()=>{doorsOpen=!doorsOpen;render();});
$$('[data-scene-view]').forEach(button=>button.addEventListener('click',()=>{view=button.dataset.sceneView==='schematic'?'schematic':'realistic';renderScene();}));
$('#reset-config').addEventListener('click',()=>{config={...defaultConfig};doorsOpen=false;save();render();$('#config-save-status').textContent='Эскиз возвращён к исходному варианту.';});
const menu=$('.mobile-menu'),nav=$('#main-nav');
function closeMenu(){menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Открыть меню');nav.classList.remove('open');}
menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Закрыть меню':'Открыть меню');nav.classList.toggle('open',open);});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&nav.classList.contains('open')){closeMenu();menu.focus();}});
addEventListener('resize',()=>{if(innerWidth>960)closeMenu();},{passive:true});
addEventListener('storage',event=>{if(event.key===key){try{config=normalizeConfig(JSON.parse(event.newValue));}catch{config={...defaultConfig};}doorsOpen=false;render();}});
render();
// Warm the other two local plates without risking unhandled rejection.
Promise.allSettled(Object.values(photoAssets).map(loadPhoto));
