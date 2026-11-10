import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {products,series,categories} from '../public/catalog.mjs';
import {resolveLanguage,translate,localizeCatalog} from '../public/i18n.mjs';
import {parseConsent,CONSENT_VERSION,CONSENT_TTL,CONSENT_KEY,PREFERENCE_KEYS,preferenceStorage,saveConsent,preferencesEnabled} from '../public/privacy-storage.mjs';
import {validateProduct} from '../worker/catalog-service.mjs';
test('locale is allowlisted and explicit URL choice wins',()=>{
 assert.equal(resolveLanguage('kk','en'),'kk');assert.equal(resolveLanguage('bad','en'),'en');assert.equal(resolveLanguage('bad','<script>'),'ru');
 assert.equal(translate('Главная','en'),'Home');assert.notEqual(translate('Главная','kk'),'Главная');
});
test('all supplier products and categories have complete translations without changing identifiers or numbers',()=>{
 for(const language of ['kk','en']){
  const localized=localizeCatalog({products,series,categories,categoryLabels:{}},language);
  assert.equal(localized.products.length,79);
  for(let i=0;i<79;i++){
   const before=products[i],after=localized.products[i];assert.equal(after.id,before.id);assert.equal(after.model,before.model);assert.equal(after.page,before.page);
   assert.notEqual(after.name,before.name);assert.notEqual(after.description,before.description);assert.equal(after.details.length,before.details.length);
   assert.deepEqual(after.details.join(' ').match(/\d+/g),before.details.join(' ').match(/\d+/g));
  }
  assert.ok(localized.categories.every((c,i)=>c.name!==categories[i].name));
 }
});
test('consent rejects malformed, future, old-version and expired choices',()=>{
 const now=1800000000000,choice={version:CONSENT_VERSION,preferences:true,at:now};
 assert.equal(parseConsent(JSON.stringify(choice),now).preferences,true);
 for(const value of ['broken','null',JSON.stringify({...choice,version:0}),JSON.stringify({...choice,at:now+1000}),JSON.stringify({...choice,at:now-CONSENT_TTL-1}),JSON.stringify({...choice,preferences:'true'})])assert.equal(parseConsent(value,now),null);
});
test('no third-party tracking or remotely loaded fonts in authored pages',async()=>{
 for(const name of ['index','catalog','configurator','admin','privacy','terms','refund','cookies','business']){
  const html=await readFile(new URL('../public/'+name+'.html',import.meta.url),'utf8');
  assert.doesNotMatch(html,/fonts\.googleapis\.com|fonts\.gstatic\.com|googletagmanager|connect\.facebook\.net/);
 }
});
test('optional data stays in the tab until acceptance and current data survives revocation',()=>{
 const memory=()=>{const data=new Map();return {getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,String(v)),removeItem:k=>data.delete(k)};};
 const beforeLocal=globalThis.localStorage,beforeSession=globalThis.sessionStorage;
 globalThis.localStorage=memory();globalThis.sessionStorage=memory();
 try{
  const key=PREFERENCE_KEYS[0];preferenceStorage.setItem(key,'first');assert.equal(localStorage.getItem(key),null);assert.equal(sessionStorage.getItem(key),'first');
  saveConsent(true);assert.equal(preferencesEnabled(),true);assert.equal(localStorage.getItem(key),'first');
  preferenceStorage.setItem(key,'newest');saveConsent(true);assert.equal(localStorage.getItem(key),'newest');
  saveConsent(false);assert.equal(preferencesEnabled(),false);assert.equal(localStorage.getItem(key),null);assert.equal(preferenceStorage.getItem(key),'newest');
  const choice=JSON.parse(localStorage.getItem(CONSENT_KEY));choice.at=Date.now()-CONSENT_TTL-1;localStorage.setItem(CONSENT_KEY,JSON.stringify(choice));assert.equal(preferencesEnabled(),false);
 }finally{globalThis.localStorage=beforeLocal;globalThis.sessionStorage=beforeSession;}
});
test('admin translations are bounded and survive catalog edits without replacing changed text with stale copy',()=>{
 const base={...products[0],price:null,priceUnit:'piece'},translations={en:{name:'Edited item',details:['Width: 200 mm']},kk:{name:'Жаңа бұйым'}};
 const saved=validateProduct({...base,translations});assert.deepEqual(saved.translations,translations);
 const data={products:[{...saved,name:'Новое название',description:'Новое описание'}],series,categories};
 assert.equal(localizeCatalog(data,'en').products[0].name,'Edited item');assert.equal(localizeCatalog(data,'en').products[0].description,'Новое описание');
 assert.throws(()=>validateProduct({...base,translations:{en:{name:'x'.repeat(151)}}}));
 assert.throws(()=>validateProduct({...base,translations:{en:{details:Array(21).fill('x')}}}));
 assert.throws(()=>validateProduct({...base,translations:{en:['bad']}}));
 assert.equal(translate('Рассмотреть: 36', 'en'),'Explore: 36');
});
