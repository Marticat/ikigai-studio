export const defaultConfig=Object.freeze({width:300,height:260,preset:'mixed',profile:'graphite',glass:'smoked',light:'warm'});
export const profiles={graphite:{name:'Графит',color:'#373b38',edge:'#777d72'},bronze:{name:'Бронза',color:'#9a7752',edge:'#d3b58a'},silver:{name:'Серебро',color:'#a7ada7',edge:'#e2e5df'}};
export const glasses={open:{name:'Без стекла',color:'none',opacity:0},clear:{name:'Прозрачное',color:'#dce8e2',opacity:.09},smoked:{name:'Дымчатое',color:'#34453e',opacity:.3},bronze:{name:'Бронзовое',color:'#a87942',opacity:.26}};
export const lights={off:{name:'Без подсветки',color:'#efe8db'},warm:{name:'Тёплый · 3000 K',color:'#ffcf83'},neutral:{name:'Нейтральный · 4000 K',color:'#f3f5e8'}};
export const presets={
 clothes:{name:'Больше одежды',description:'Три секции со штангами для рубашек, жакетов и длинных вещей.',bays:[{type:'hang',shelves:1,drawers:0,long:true},{type:'hang',shelves:1,drawers:0,long:false},{type:'hang',shelves:1,drawers:2,long:false}],shelves:3,drawers:2,rails:3},
 shelves:{name:'Больше полок',description:'Полки для сложенных вещей, четыре ящика и отдельная секция для одежды.',bays:[{type:'stack',shelves:5,drawers:2},{type:'stack',shelves:5,drawers:2},{type:'hang',shelves:2,drawers:0,long:false}],shelves:12,drawers:4,rails:1},
 mixed:{name:'Смешанный',description:'Две секции для одежды, открытые полки и четыре выдвижных ящика.',bays:[{type:'hang',shelves:1,drawers:2,long:false},{type:'stack',shelves:4,drawers:2},{type:'hang',shelves:2,drawers:0,long:true}],shelves:7,drawers:4,rails:2}
};
const dimension=(value,fallback,min,max)=>{if(!['number','string'].includes(typeof value)||String(value).trim()==='')return fallback;const n=Number(value);return Number.isFinite(n)?Math.max(min,Math.min(max,Math.round(n/10)*10)):fallback;};
const choice=(value,options,fallback)=>typeof value==='string'&&Object.hasOwn(options,value)?value:fallback;
export function normalizeConfig(input){const c=input&&typeof input==='object'&&!Array.isArray(input)?input:{};return {width:dimension(c.width,300,180,420),height:dimension(c.height,260,220,300),preset:choice(c.preset,presets,'mixed'),profile:choice(c.profile,profiles,'graphite'),glass:choice(c.glass,glasses,'smoked'),light:choice(c.light,lights,'warm')};}
// DEMO rates only. Replace after IKIGAI confirms a real pricing model.
export const demoRates=Object.freeze({basePerM:165000,drawer:18000,glassPerM:110000,lightingPerM:15000,range:.15});
export function estimateConfig(input){
 const c=normalizeConfig(input),m=c.width/100,h=c.height/260,base=Math.round(m*h*demoRates.basePerM);
 const lines=[{label:'Каркас, полки и штанги',amount:base},{label:`Ящики · ${presets[c.preset].drawers} шт.`,amount:presets[c.preset].drawers*demoRates.drawer}];
 if(c.profile!=='graphite')lines.push({label:`Профиль · ${profiles[c.profile].name}`,amount:Math.round(base*(c.profile==='bronze'?.08:.03))});
 if(c.glass!=='open')lines.push({label:`Стекло · ${glasses[c.glass].name}`,amount:Math.round(m*h*demoRates.glassPerM*(c.glass==='bronze'?1.12:c.glass==='smoked'?1.08:1))});
 if(c.light!=='off')lines.push({label:'Подсветка',amount:Math.round(m*demoRates.lightingPerM)});
 const total=lines.reduce((sum,l)=>sum+l.amount,0);
 return {lines,total,low:Math.floor(total*(1-demoRates.range)/10000)*10000,high:Math.ceil(total*(1+demoRates.range)/10000)*10000};
}
export const formatMoney=n=>new Intl.NumberFormat('ru-RU').format(n)+' ₸';
export function configEnquiry(input){const c=normalizeConfig(input),p=presets[c.preset],estimate=estimateConfig(c);return 'https://wa.me/77019996799?text='+encodeURIComponent(['Здравствуйте! Собрал эскиз гардеробной на сайте IKIGAI.','Размеры (Ш × В × Г): '+c.width+' × '+c.height+' × 60 см.',`Наполнение: ${p.name}.`,`Профиль: ${profiles[c.profile].name}.`,`Стекло: ${glasses[c.glass].name}.`,`Подсветка: ${lights[c.light].name}.`,`На сайте показан демонстрационный ориентир ${formatMoney(estimate.low)} – ${formatMoney(estimate.high)}; он не подтверждён IKIGAI. Доставка и монтаж не включены.`,'Прошу уточнить возможность изготовления, комплектацию и реальную стоимость.'].join('\n'));}
