// Progressive enhancement: content stays visible if JS or animation support fails.
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const active=new Set(),seen=new WeakSet(),media=new Set();
const selectors='.reveal,.section-head h2,.intro-main h2,.inside h2,.material-copy h3,.kits-heading h2,.catalog-heading h1,.config-heading h1,.detail-info h1,.fit-section h2,.config-end h2,.contact h2,.product-card,.kit-card,.series-card,.category-tiles>a,.process-grid article,.control-section,.inside-image,.material-visual,.config-teaser-image,.download-banner';
function play(element,frames,options){
 if(reduced.matches||!element.animate)return;
 const animation=element.animate(frames,{duration:850,easing:'cubic-bezier(.16,1,.3,1)',...options});
 active.add(animation);animation.finished.catch(()=>{}).finally(()=>active.delete(animation));
}
const reveal='IntersectionObserver' in window?new IntersectionObserver(entries=>{
 for(const {target,isIntersecting} of entries){
  if(!isIntersecting)continue;reveal.unobserve(target);
  const card=target.matches('.product-card,.kit-card,.series-card,.category-tiles>a,.process-grid article,.control-section');
  const photo=target.matches('.inside-image,.material-visual,.config-teaser-image');
  const siblings=card?[...target.parentElement.children].filter(el=>el.matches(selectors)):[];
  const delay=card?Math.min(siblings.indexOf(target)%4,3)*85:0;
  if(photo)play(target,[{opacity:.45,clipPath:'inset(9% 0 9% 0)'},{opacity:1,clipPath:'inset(0% 0 0% 0)'}],{duration:1100});
  else play(target,[{opacity:0,transform:`translateY(${card?32:38}px)`},{opacity:1,transform:'translateY(0)'}],{delay,fill:'backwards'});
 }
},{threshold:.08}):null;
const mediaObserver='IntersectionObserver' in window?new IntersectionObserver(entries=>{
 for(const entry of entries){entry.isIntersecting?media.add(entry.target):media.delete(entry.target);entry.target.classList.toggle('motion-in-view',entry.isIntersecting);}schedule();
},{rootMargin:'80px'}):null;
function register(root){
 if(root.nodeType!==1&&root!==document)return;
 const elements=[...(root.matches?.(selectors)?[root]:[]),...root.querySelectorAll(selectors)];
 for(const element of elements){if(seen.has(element))continue;seen.add(element);reveal?.observe(element);}
 const depthSelector='.hero-stage,.inside-image,.material-visual';
 for(const el of [...(root.matches?.(depthSelector)?[root]:[]),...root.querySelectorAll(depthSelector)])if(!el.hasAttribute('data-depth-motion')){el.dataset.depthMotion='';mediaObserver?.observe(el);}
}
let frame=0;
function schedule(){if(frame||reduced.matches||document.hidden)return;frame=requestAnimationFrame(updateDepth);}
function updateDepth(){
 frame=0;
 if(reduced.matches||document.hidden)return;
 for(const el of media){
  const rect=el.getBoundingClientRect(),progress=Math.max(-1,Math.min(1,(innerHeight/2-rect.top-rect.height/2)/innerHeight));
  el.style.setProperty('--photo-shift',`${progress*(innerWidth<740?10:26)}px`);
 }
}
register(document);
new MutationObserver(records=>{
 for(const record of records){
  for(const node of record.removedNodes){
   if(node.nodeType!==1||node.isConnected)continue;
   for(const el of [node,...node.querySelectorAll(selectors)]){reveal?.unobserve(el);seen.delete(el);}
   for(const el of [node,...node.querySelectorAll('[data-depth-motion]')]){mediaObserver?.unobserve(el);media.delete(el);el.removeAttribute('data-depth-motion');}
  }
  for(const node of record.addedNodes)register(node);
 }
}).observe(document.querySelector('main')||document.body,{childList:true,subtree:true});
addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule,{passive:true});
document.addEventListener('visibilitychange',()=>{document.documentElement.classList.toggle('motion-paused',document.hidden);if(!document.hidden)schedule();});
reduced.addEventListener('change',()=>{if(reduced.matches){for(const animation of active)animation.cancel();for(const el of media)el.style.removeProperty('--photo-shift');}else schedule();});
document.addEventListener('click',event=>{
 const button=event.target.closest('button[data-save],button[data-key],button[data-inside],button[data-material],button[data-filter]');
 if(button&&!button.disabled)play(button,[{scale:'1'},{scale:'.96',offset:.35},{scale:'1'}],{duration:280});
});
// Hero copy enters once; there is no timed slide rotation or scroll interception.
for(const [i,element] of [...document.querySelectorAll('.hero-copy>.eyebrow,.hero-copy h1,.hero-description,.hero-copy>.light-button')].entries()){
 play(element,[{opacity:0,transform:'translateY(28px)'},{opacity:1,transform:'translateY(0)'}],{duration:1100,delay:120+i*120,fill:'backwards'});
}
