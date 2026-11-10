import {defaultConfig,normalizeConfig,presets,estimateConfig,formatMoney,configEnquiry} from './configurator-model.mjs';
import {wardrobeScene} from './configurator-scene.mjs';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const key='ikigai-configurator-v1';
let config={...defaultConfig},doorsOpen=false;
try{config=normalizeConfig(JSON.parse(localStorage.getItem(key)));}catch{}
function save(){try{localStorage.setItem(key,JSON.stringify(config));$('#config-save-status').textContent='Эскиз сохранён в этом браузере.';}catch{$('#config-save-status').textContent='Эскиз доступен до закрытия вкладки.';}}
function render(){
 const preset=presets[config.preset],estimate=estimateConfig(config);
 $('#wardrobe-scene').innerHTML=wardrobeScene(config,{doorsOpen});
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
$('#reset-config').addEventListener('click',()=>{config={...defaultConfig};doorsOpen=false;save();render();$('#config-save-status').textContent='Эскиз возвращён к исходному варианту.';});
const menu=$('.mobile-menu'),nav=$('#main-nav');
function closeMenu(){menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Открыть меню');nav.classList.remove('open');}
menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Закрыть меню':'Открыть меню');nav.classList.toggle('open',open);});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&nav.classList.contains('open')){closeMenu();menu.focus();}});
addEventListener('resize',()=>{if(innerWidth>960)closeMenu();},{passive:true});
addEventListener('storage',event=>{if(event.key===key){try{config=normalizeConfig(JSON.parse(event.newValue));}catch{config={...defaultConfig};}doorsOpen=false;render();}});
render();
