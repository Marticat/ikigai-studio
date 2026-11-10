import {products as seed,series as seedSeries,categories,categoryLabels} from '../public/catalog.mjs';
export function isAdmin(request,env){
 const id=request.headers.get('oai-authenticated-user-id'),email=request.headers.get('oai-authenticated-user-email')?.trim().toLowerCase();
 return Boolean(id&&email&&String(env.CATALOG_ADMIN_EMAILS||'').split(',').map(s=>s.trim().toLowerCase()).filter(Boolean).includes(email));
}
export function mergeCatalog(rows,admin=false){
 const map=new Map(seed.map(p=>[p.id,{...p,price:null,priceUnit:'piece',priceFrom:false,visible:true,revision:0}]));
 for(const row of rows)map.set(row.id,{...JSON.parse(row.payload),revision:row.revision});
 const products=[...map.values()].filter(p=>admin||p.visible!==false);
 const series=seedSeries.map(s=>({...s,count:products.filter(p=>p.series===s.id).length,image:products.find(p=>p.series===s.id)?.image||s.image})).filter(s=>admin||s.count>0);
 return {products,series,categories,categoryLabels};
}
function string(value,max,required=false){if(typeof value!=='string'||value.length>max||(required&&!value.trim()))throw new Error('Проверьте обязательные поля и длину текста.');return value.trim();}
function asset(value){const s=string(value,200,true);if(!/^(?:assets\/[a-zA-Z0-9_\-/]+\.(?:webp|png|jpg|jpeg)|\/media\/[a-f0-9-]+\.(?:webp|png|jpg))$/.test(s))throw new Error('Загрузите фотографию через форму.');return s;}
export function validateProduct(raw){
 if(!raw||typeof raw!=='object'||Array.isArray(raw))throw new Error('Неверные данные карточки.');
 const id=string(raw.id,80,true);if(!/^[a-z0-9-]+$/.test(id))throw new Error('Неверный код карточки.');
 const original=seed.find(p=>p.id===id);
 if(original&&raw.page!==original.page)throw new Error('Страницу каталога нельзя изменить.');
 if(!original&&raw.page!=null)throw new Error('У нового товара нет страницы исходного каталога.');
 const category=categories.find(c=>c.id===raw.category),series=seedSeries.find(s=>s.id===raw.series&&s.category===raw.category);
 if(!category||!series)throw new Error('Выберите раздел и серию из списка.');
 let price=raw.price;
 if(price===null||price==='')price=null;else if(typeof price!=='number'||!Number.isFinite(price)||price<=0||price>100000000||Math.round(price)!==price)throw new Error('Цена должна быть целым числом от 1 до 100 000 000 ₸.');
 if(!['piece','set','meter'].includes(raw.priceUnit))throw new Error('Выберите единицу цены.');
 if(!Array.isArray(raw.details)||raw.details.length>20)throw new Error('Не более 20 характеристик.');
 const translations={};
 if(raw.translations!=null){
  if(typeof raw.translations!=='object'||Array.isArray(raw.translations))throw new Error('Неверные данные переводов.');
  for(const lang of ['kk','en']){
   const value=raw.translations[lang];if(value==null)continue;
   if(typeof value!=='object'||Array.isArray(value))throw new Error('Неверные данные переводов.');
   const copy={};
   for(const [field,max] of [['name',150],['description',3000],['tag',120]])if(value[field]!=null&&value[field]!=='')copy[field]=string(value[field],max);
   if(value.details!=null){if(!Array.isArray(value.details)||value.details.length>20)throw new Error('Не более 20 характеристик.');if(value.details.length)copy.details=value.details.map(v=>string(v,300,true));}
   if(Object.keys(copy).length)translations[lang]=copy;
  }
 }
 return {id,page:original?.page??null,category:category.id,series:series.id,seriesName:series.name,sourceName:original?.sourceName||'',source:original?.source||'Каталог IKIGAI',name:string(raw.name,150,true),model:raw.model?string(raw.model,80):null,tag:string(raw.tag||series.name,120),description:string(raw.description,3000,true),details:raw.details.map(v=>string(v,300,true)),image:asset(raw.image),sheet:raw.sheet?asset(raw.sheet):asset(raw.image),price,priceUnit:raw.priceUnit,priceFrom:raw.priceFrom===true,visible:raw.visible!==false,translations};
}
export function validateImage(bytes,type){
 if(bytes.byteLength>5*1024*1024)throw new Error('Фотография должна быть меньше 5 МБ.');
 if(type==='image/png'&&[137,80,78,71,13,10,26,10].every((v,i)=>bytes[i]===v))return 'png';
 if(type==='image/jpeg'&&bytes[0]===255&&bytes[1]===216&&bytes[2]===255)return 'jpg';
 if(type==='image/webp'&&new TextDecoder().decode(bytes.slice(0,4))==='RIFF'&&new TextDecoder().decode(bytes.slice(8,12))==='WEBP')return 'webp';
 throw new Error('Нужна фотография в формате JPG, PNG или WebP.');
}
