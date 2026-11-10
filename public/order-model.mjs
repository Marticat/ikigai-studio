import {language,t,localeCode} from './i18n.mjs';
import {normalizeConfig} from './configurator-model.mjs';
import {createEnquiry} from './store.mjs';
export const kits=[
 {id:'small',name:'Небольшая гардеробная',caption:'Каждой вещи — своё место.',description:'Компактный вариант с полками, ящиками и местом для одежды.',image:'assets/configurator/shelves-real.png',config:{width:180,height:240,preset:'shelves',profile:'graphite',glass:'open',light:'warm'}},
 {id:'family',name:'Семейная гардеробная',caption:'Пространство для двоих.',description:'Больше места для одежды на плечиках. Ширину и наполнение можно изменить.',image:'assets/configurator/clothes-real.png',config:{width:360,height:260,preset:'clothes',profile:'graphite',glass:'open',light:'warm'}},
 {id:'glass',name:'Гардеробная со стеклом',caption:'Хранение становится интерьером.',description:'Дымчатое стекло, бронзовый профиль и тёплый свет.',image:'assets/configurator/mixed-real.png',config:{width:300,height:260,preset:'mixed',profile:'bronze',glass:'smoked',light:'warm'}}
];
export function initialKitConfig(id,saved){return normalizeConfig(kits.find(k=>k.id===id)?.config||saved);}
export function fitEnquiry(product,{width,height,depth,comment=''}={}){
 const values=[width,height,depth].map(v=>Number(String(v??'').trim().replace(',','.')));
 if(values.some(v=>!Number.isFinite(v)||v<1||v>10000))throw new Error('Укажите три размера от 1 до 10 000 мм.');
 return createEnquiry([product],[product.id],{dimensions:({ru:'Внутренние размеры шкафа (Ш × В × Г)',kk:'Шкафтың ішкі өлшемдері (Е × Б × Т)',en:'Internal wardrobe dimensions (W × H × D)'})[language]+': '+values.join(' × ')+(language==='en'?' mm':' мм'),comment:({ru:'Подскажите, подойдёт ли выбранное изделие для моего шкафа.',kk:'Таңдалған бұйым менің шкафыма сәйкес келе ме?',en:'Please check whether the selected item will fit my wardrobe.'})[language]+(comment.trim()?' '+comment.trim().slice(0,1000):'')});
}
export function priceLabel(p){
 if(p.price==null||!Number.isFinite(Number(p.price))||Number(p.price)<=0)return t('Цена по запросу');
 const units={piece:'шт.',set:'комплект',meter:'пог. м'};
 return `${p.priceFrom?({ru:'от ',kk:'бастап ',en:'from '})[language]:''}${new Intl.NumberFormat(localeCode()).format(Number(p.price))} ₸ / ${t(units[p.priceUnit]||'шт.')}`;
}
