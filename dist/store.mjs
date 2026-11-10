export function filterProducts(products, category='all', query='') {
 const term=query.trim().toLocaleLowerCase('ru');
 return products.filter(p=>(category==='all'||p.category===category)&&`${p.name} ${p.description||''} ${p.tag||''}`.toLocaleLowerCase('ru').includes(term));
}
export function restoreSelection(raw,products) {
 try {const values=JSON.parse(raw);return Array.isArray(values)?[...new Set(values)].filter(id=>products.some(p=>p.id===id)):[];}catch{return [];}
}
export function toggleSelection(ids,id) {return ids.includes(id)?ids.filter(v=>v!==id):[...ids,id];}
export function escapeHTML(value) {return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
export function featuredState(products,ids,id) {const available=products.some(p=>p.id===id);return {available,selected:available&&ids.includes(id)};}
export function createEnquiry(products,ids,{name='',dimensions='',comment=''}={}) {
 const selected=products.filter(p=>ids.includes(p.id));
 const lines=['Здравствуйте! Хочу обсудить гардеробную с IKIGAI.',name.trim()?`Меня зовут ${name.trim()}.`:'',selected.length?'Моя подборка:\n'+selected.map(p=>`• ${p.name}`).join('\n'):'Хочу подобрать гардеробную и наполнение.',dimensions.trim()?`Размеры / помещение: ${dimensions.trim()}`:'',comment.trim()?`Пожелания: ${comment.trim()}`:'','Подскажите доступные варианты и стоимость.'];
 return 'https://wa.me/77019996799?text='+encodeURIComponent(lines.filter(Boolean).join('\n'));
}
