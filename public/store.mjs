import {language,t} from './i18n.mjs';
export function filterProducts(products, category='all', query='') {
 const term=query.trim().toLocaleLowerCase('ru');
 return products.filter(p=>(category==='all'||p.category===category)&&`${p.searchTerms||''} ${p.name} ${p.description||''} ${p.tag||''} ${p.model||''} ${p.seriesName||''} ${(p.details||[]).join(' ')}`.toLocaleLowerCase('ru').includes(term));
}
export function restoreSelection(raw,products) {
 try {const values=JSON.parse(raw);return Array.isArray(values)?[...new Set(values)].filter(id=>products.some(p=>p.id===id)):[];}catch{return [];}
}
export function toggleSelection(ids,id) {return ids.includes(id)?ids.filter(v=>v!==id):[...ids,id];}
export function escapeHTML(value) {return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
export function featuredState(products,ids,id) {const available=products.some(p=>p.id===id);return {available,selected:available&&ids.includes(id)};}
export function createEnquiry(products,ids,{name='',dimensions='',comment=''}={}) {
 const selected=products.filter(p=>ids.includes(p.id));
 const words={ru:['Здравствуйте! Хочу обсудить проект с IKIGAI.','Меня зовут','Моя подборка:','Хочу подобрать гардеробную и наполнение.','Размеры / помещение','Пожелания','Подскажите доступные варианты и стоимость.','стр.'],kk:['Сәлеметсіз бе! IKIGAI-мен жобаны талқылағым келеді.','Менің атым','Менің таңдамам:','Гардероб пен ішкі жабдықты таңдағым келеді.','Өлшемдер / бөлме','Тілектер','Қолжетімді нұсқалар мен бағасын айтыңызшы.','бет'],en:['Hello! I would like to discuss a project with IKIGAI.','My name is','My selection:','I would like help choosing a wardrobe and interior fittings.','Dimensions / room','Preferences','Please advise on available options and pricing.','p.']}[language];
 const lines=[words[0],name.trim()?words[1]+' '+name.trim()+'.':'',selected.length?words[2]+'\n'+selected.map(p=>'• '+p.name+(p.model?' ('+p.model+')':'')+(p.page?' — MEIDU 2026, '+words[7]+' '+p.page:'')).join('\n'):words[3],dimensions.trim()?words[4]+': '+dimensions.trim():'',comment.trim()?words[5]+': '+comment.trim():'',words[6]];
 return 'https://wa.me/77019996799?text='+encodeURIComponent(lines.filter(Boolean).join('\n'));
}
