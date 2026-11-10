import {t} from './i18n.mjs';

const stage=document.querySelector('.hero-stage');
const images=[...stage.querySelectorAll('.hero-img')];
const buttons=[...stage.querySelectorAll('[data-slide]')];
const caption=document.querySelector('#slide-caption');
const captions=['Стекло и тонкие линии','Тёплая палитра','Открытая архитектура'];
const motion=matchMedia('(prefers-reduced-motion: reduce)');
const delay=6000;
let index=Math.max(0,images.findIndex(image=>image.classList.contains('active')));
let timer,visible=false,paused=motion.matches,pageActive=true;
const toggle=document.createElement('button');
toggle.type='button';toggle.className='hero-autoplay';
stage.querySelector('.hero-pagination').append(toggle);

function schedule(){
 clearTimeout(timer);
 if(!paused&&visible&&!document.hidden&&pageActive&&images.length>1)timer=setTimeout(()=>{show((index+1)%images.length);schedule();},delay);
}
function show(next){
 index=next;
 images.forEach((image,i)=>{image.classList.toggle('active',i===index);image.setAttribute('aria-hidden',String(i!==index));});
 buttons.forEach((button,i)=>{button.classList.toggle('active',i===index);button.setAttribute('aria-pressed',String(i===index));});
 caption.textContent=t(captions[index]);
}
function syncToggle(){
 const label=t(paused?'Включить смену фотографий':'Приостановить смену фотографий');
 toggle.setAttribute('aria-label',label);toggle.title=label;
 toggle.innerHTML=`<svg width="13" height="13" viewBox="0 0 16 16" aria-hidden="true" focusable="false">${paused?'<path d="M5 3l8 5-8 5Z" fill="currentColor"/>':'<path d="M5 3v10M11 3v10" fill="none" stroke="currentColor" stroke-width="2"/>'}</svg>`;
 schedule();
}
buttons.forEach((button,i)=>button.addEventListener('click',()=>{show(i);schedule();}));
toggle.addEventListener('click',()=>{paused=!paused;syncToggle();});
document.addEventListener('visibilitychange',schedule);
addEventListener('pagehide',()=>{pageActive=false;clearTimeout(timer);});
addEventListener('pageshow',()=>{pageActive=true;schedule();});
motion.addEventListener('change',()=>{if(motion.matches)paused=true;syncToggle();});
new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;schedule();},{threshold:0}).observe(stage);
show(index);syncToggle();
