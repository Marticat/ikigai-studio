import {t,localizeCatalog} from './i18n.mjs';
import {escapeHTML as e} from './store.mjs';
import {priceLabel} from './order-model.mjs';
const $=s=>document.querySelector(s),form=$('#product-form');
let catalog,current,dirty=false,busy=false;
const field=name=>form.elements.namedItem(name);
async function api(path,options={}){const response=await fetch(path,{...options,cache:'no-store',headers:{'X-IKIGAI-Admin':'1',...options.headers}});let data;try{data=await response.json();}catch{throw new Error('Нет ответа от сервера. Изменения пока не сохранены.');}if(!response.ok)throw Object.assign(new Error(data.error||'Не удалось выполнить действие.'),{status:response.status});return data;}
function status(text,error=false){$('#save-status').textContent=text;$('#save-status').dataset.error=String(error);}
function locked(value){busy=value;$('#product-fields').disabled=value;$('#save-product').disabled=value;$('#new-product').disabled=value;document.querySelectorAll('.admin-item').forEach(b=>b.disabled=value);}
function canLeave(){return !dirty||confirm(t('Есть несохранённые изменения. Перейти без сохранения?'));}
function renderList(){
 const query=$('#admin-search').value.trim().toLowerCase();const localized=localizeCatalog(catalog);const found=catalog.products.filter(p=>{const display=localized.products.find(item=>item.id===p.id);return [p.name,p.model,p.seriesName,display?.name,display?.seriesName,...Object.values(p.translations||{}).map(value=>value.name)].join(' ').toLowerCase().includes(query);});
 $('#admin-summary').textContent=`${catalog.products.length} товаров · ${catalog.products.filter(p=>p.visible!==false).length} на сайте`;
 $('#admin-list-count').textContent=`Найдено: ${found.length}`;
 $('#admin-list').innerHTML=found.length?found.map(p=>`<button type="button" class="admin-item" data-id="${e(p.id)}" aria-current="${current?.id===p.id}"><img src="${e(p.image)}" alt="" loading="lazy"><span><strong>${e(p.name)}</strong><small>${e(p.model||p.seriesName)}</small><small>${e(priceLabel(p))}</small>${p.visible===false?'<em>Скрыт с сайта</em>':''}</span></button>`).join(''):'<p class="admin-list-empty">Изделий не найдено. Измените запрос или добавьте новый товар.</p>';
 document.querySelectorAll('.admin-item').forEach(button=>button.addEventListener('click',async()=>{
  if(busy||!canLeave())return;locked(true);
  try{catalog=await api('/api/admin/catalog');openProduct(catalog.products.find(p=>p.id===button.dataset.id));}
  catch(error){status(error.message,true);$('#admin-list-count').textContent=error.message;}
  finally{locked(false);}
 }));
}
function updateSeries(selected){field('series').innerHTML=catalog.series.filter(s=>s.category===field('category').value).map(s=>`<option value="${e(s.id)}">${e(s.name)}</option>`).join('');if(selected)field('series').value=selected;}
function showPhoto(){const has=Boolean(current.image);$('#photo-preview').hidden=!has;$('#photo-placeholder').hidden=has;if(has)$('#photo-preview').src=current.image;else $('#photo-preview').removeAttribute('src');}
function openProduct(product){
 current=structuredClone(product);dirty=false;form.reset();$('#editor-empty').hidden=true;form.hidden=false;
 $('#editor-title').textContent=product.name||'Новое изделие';$('#editor-source').textContent=product.page?`MEIDU 2026 / Страница ${product.page}`:'IKIGAI / Новое в коллекции';
 $('#product-preview').hidden=product.isNew||product.visible===false;$('#product-preview').href='catalog.html?product='+encodeURIComponent(product.id);
 field('category').innerHTML=catalog.categories.map(c=>`<option value="${e(c.id)}">${e(c.name)}</option>`).join('');field('category').value=product.category;updateSeries(product.series);
 for(const name of ['name','model','tag','description','priceUnit'])field(name).value=product[name]||'';
 field('details').value=(product.details||[]).join('\n');field('price').value=product.price??'';field('priceFrom').checked=product.priceFrom===true;field('visible').checked=product.visible!==false;
 for(const lang of ['kk','en']){const translated=localizeCatalog({...catalog,products:[product]},lang).products[0];for(const name of ['name','tag','description','details']){const value=product.translations?.[lang]?.[name]??(JSON.stringify(translated[name])!==JSON.stringify(product[name])?translated[name]:'');field(lang+'_'+name).value=Array.isArray(value)?value.join('\n'):value||'';}}
 showPhoto();$('#photo-status').textContent='';status('');renderList();
 if(innerWidth<721)form.scrollIntoView({behavior:'smooth',block:'start'});
}
async function load(){
 $('#gate-message').textContent='Проверяем доступ…';$('#admin-signin').hidden=true;$('#admin-retry').hidden=true;
 try{catalog=await api('/api/admin/catalog');$('#admin-gate').hidden=true;$('#admin-workspace').hidden=false;$('#admin-email').textContent=catalog.email;renderList();}
 catch(error){$('#admin-gate').hidden=false;$('#admin-workspace').hidden=true;$('#gate-message').textContent=error.status===401?'Войдите, чтобы управлять коллекцией.':error.status===403?'У этого аккаунта нет доступа к управлению каталогом. Войдите с аккаунтом редактора.':error.message;$('#admin-signin').hidden=![401,403].includes(error.status);$('#admin-retry').hidden=[401,403].includes(error.status);}
}
$('#admin-retry').addEventListener('click',load);$('#admin-search').addEventListener('input',renderList);
$('#new-product').addEventListener('click',()=>{if(busy||!canLeave())return;const s=catalog.series[0];openProduct({id:'custom-'+crypto.randomUUID(),name:'',model:'',tag:'',description:'',category:s.category,series:s.id,details:[],price:null,priceUnit:'piece',priceFrom:false,visible:true,page:null,image:'',sheet:'',revision:0,isNew:true});});
field('category').addEventListener('change',()=>updateSeries());
form.addEventListener('input',()=>{dirty=true;status('Есть несохранённые изменения.');});
$('#photo-file').addEventListener('change',async event=>{
 const file=event.target.files[0];if(!file)return;locked(true);$('#photo-status').dataset.error='false';$('#photo-status').textContent='Загружаем фотографию…';
 try{
  if(file.size>5*1024*1024)throw new Error('Фотография должна быть меньше 5 МБ.');
  if(!['image/jpeg','image/png','image/webp'].includes(file.type))throw new Error('Выберите JPG, PNG или WebP.');
  // Re-encode a decoded image: uploaded media never contains active markup or metadata.
  const bitmap=await createImageBitmap(file);if(!bitmap.width||!bitmap.height||bitmap.width*bitmap.height>60000000){bitmap.close();throw new Error('Изображение слишком большое. Выберите фото до 60 мегапикселей.');}
  const scale=Math.min(1,2000/Math.max(bitmap.width,bitmap.height)),canvas=document.createElement('canvas');canvas.width=Math.round(bitmap.width*scale);canvas.height=Math.round(bitmap.height*scale);const ctx=canvas.getContext('2d');ctx.fillStyle='#e7e4db';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();
  const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',.9));if(!blob)throw new Error('Не удалось обработать фотографию.');
  const data=await api('/api/admin/upload',{method:'POST',headers:{'Content-Type':'image/jpeg'},body:blob});current.image=data.url;if(!current.page)current.sheet=data.url;showPhoto();dirty=true;$('#photo-status').textContent='Фото загружено. Сохраните карточку, чтобы опубликовать.';status('Есть несохранённые изменения.');
 }catch(error){$('#photo-status').dataset.error='true';$('#photo-status').textContent=error.message;}finally{event.target.value='';locked(false);}
});
form.addEventListener('submit',async event=>{
 event.preventDefault();if(busy)return;if(!current.image){status('Сначала загрузите фотографию товара.',true);$('#photo-file').focus();return;}
 const values=Object.fromEntries(new FormData(form)),product={...current,...values,details:values.details.split(/\r?\n/).map(s=>s.trim()).filter(Boolean),price:values.price===''?null:Number(values.price),priceFrom:field('priceFrom').checked,visible:field('visible').checked};
 product.translations={};for(const lang of ['kk','en']){const copy={};for(const name of ['name','tag','description']){const value=values[lang+'_'+name]?.trim();if(value)copy[name]=value;}const details=values[lang+'_details'].split(/\r?\n/).map(v=>v.trim()).filter(Boolean);if(details.length)copy.details=details;if(Object.keys(copy).length)product.translations[lang]=copy;for(const name of ['name','tag','description','details'])delete product[lang+'_'+name];}
 locked(true);status('Сохраняем изменения…');
 try{const {product:saved}=await api('/api/admin/product',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({product,revision:current.revision})});const index=catalog.products.findIndex(p=>p.id===saved.id);if(index<0)catalog.products.unshift(saved);else catalog.products[index]=saved;openProduct(saved);status(saved.visible?'Сохранено. Изменения уже доступны на сайте.':'Сохранено. Товар скрыт с сайта.');}
 catch(error){status(error.message,true);}finally{locked(false);}
});
addEventListener('beforeunload',event=>{if(dirty){event.preventDefault();event.returnValue='';}});
await load();
