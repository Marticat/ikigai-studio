const section=document.querySelector('#wardrobe-assembly');
const stage=section.querySelector('.assembly-stage');
const motion=matchMedia('(prefers-reduced-motion: reduce)');
const strokes=[...section.querySelectorAll('[data-assembly-stroke]')];
const parts=[...section.querySelectorAll('[data-assembly-part]')];
const doors=[...section.querySelectorAll('[data-assembly-door]')];
const progressLine=section.querySelector('.assembly-progress i');
const clamp=value=>Math.max(0,Math.min(1,value));
const ease=value=>{const v=clamp(value);return v*v*(3-2*v);};
const phase=(p,start,end)=>ease((p-start)/(end-start));
let frame=0,inView=false,last=-1;
for(const stroke of strokes){stroke.style.strokeDasharray='1';stroke.setAttribute('pathLength','1');}
function render(p){
 if(Math.abs(last-p)<.0002)return;last=p;section.dataset.progress=p.toFixed(3);
 strokes.forEach((stroke,i)=>{const amount=phase(p,.015+i*.012,.31+i*.012);stroke.style.strokeDashoffset=String(1-amount);stroke.style.opacity=String(.12+.88*amount);});
 parts.forEach((part,i)=>{const amount=phase(p,.22+i*.012,.49+i*.012);part.style.opacity=String(amount);part.setAttribute('transform',`translate(0 ${(1-amount)*(part.dataset.assemblyPart==='drawer'?28:-25)})`);});
 const glass=phase(p,.62,.79),opening=phase(p,.84,.99);
 doors.forEach((door,i)=>{
  const left=240+i*180,right=left+169,top=133,bottom=592,hinge=i===2?right:left;
  const angle=opening*(i===1?.12:.56),width=169*Math.cos(angle),sweep=169*Math.sin(angle)*.24;
  const tip=i===2?hinge-width:hinge+width;
  const points=i===2?`${hinge},${top} ${tip},${top+sweep} ${tip},${bottom+sweep} ${hinge},${bottom}`:`${hinge},${top} ${tip},${top+sweep} ${tip},${bottom+sweep} ${hinge},${bottom}`;
  door.querySelector('polygon').setAttribute('points',points);
  const handleX=i===2?tip+11:tip-11;
  door.querySelector('.assembly-handle').setAttribute('d',`M${handleX} ${330+sweep}v48`);
  const glintX=hinge+(tip-hinge)*.28;
  door.querySelector('.assembly-reflection').setAttribute('d',`M${glintX} ${top+25+sweep*.28}l${(tip-hinge)*.16} ${bottom-top-50}`);
  door.style.opacity=String(glass);door.setAttribute('transform',`translate(${(i-1)*55*(1-glass)} ${-18*(1-glass)})`);
 });
 progressLine.style.transform=`scaleX(${p})`;
}
function update(){
 frame=0;
 if(motion.matches){render(1);return;}
 if(!inView||document.hidden)return;
 const rect=section.getBoundingClientRect(),top=parseFloat(getComputedStyle(stage).top)||0;
 render(clamp((top-rect.top)/Math.max(1,section.offsetHeight-stage.offsetHeight)));
}
function schedule(){if(!frame&&!document.hidden)frame=requestAnimationFrame(update);}
function configure(){section.classList.toggle('is-scroll-assembly',!motion.matches);last=-1;motion.matches?render(1):schedule();}
if('IntersectionObserver' in window){
 new IntersectionObserver(([entry])=>{inView=entry.isIntersecting;if(inView)schedule();},{rootMargin:'120px 0px'}).observe(section);
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule,{passive:true});
 addEventListener('pageshow',schedule);document.addEventListener('visibilitychange',schedule);motion.addEventListener('change',configure);
 configure();
}else render(1);
