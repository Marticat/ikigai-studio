import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,statSync} from 'node:fs';
import {products,series,categories} from '../public/catalog.mjs';
import {resolveCatalog,queryCatalog} from '../public/catalog-logic.mjs';
import {createEnquiry} from '../public/store.mjs';

test('every supplier product page has a unique record and working assets',()=>{
 assert.equal(products.length,79);
 assert.equal(new Set(products.map(p=>p.id)).size,79);
 assert.deepEqual(products.map(p=>p.page).sort((a,b)=>a-b),Array.from({length:79},(_,i)=>i+4));
 for(const p of products){
  assert.ok(categories.some(c=>c.id===p.category));assert.ok(series.some(s=>s.id===p.series));
  assert.ok(existsSync(new URL('../public/'+p.image,import.meta.url)));
  assert.ok(existsSync(new URL('../public/'+p.sheet,import.meta.url)));
 }
 assert.ok(statSync(new URL('../public/downloads/meidu-2026.pdf',import.meta.url)).size<25*1024*1024);
});
test('routes reject unknown records and preserve category/series context',()=>{
 const p=products[0];
 assert.equal(resolveCatalog(new URLSearchParams('product='+p.id),products,series,categories).product.id,p.id);
 assert.equal(resolveCatalog(new URLSearchParams('product=missing'),products,series,categories).type,'missing');
 assert.equal(resolveCatalog(new URLSearchParams('series=missing'),products,series,categories).type,'missing');
 assert.equal(resolveCatalog(new URLSearchParams('category=missing'),products,series,categories).type,'missing');
 assert.equal(resolveCatalog(new URLSearchParams(),products,series,categories).type,'catalog');
});
test('model search supports typed spaces/hyphens and combines with category and series',()=>{
 const fixture=[{id:'a',category:'fronts',series:'doors',name:'Фасад',model:'MD-019'}, {id:'b',category:'systems',series:'pillars',name:'Стойка',model:'MD-019'}];
 assert.deepEqual(queryCatalog(fixture,{query:' md 019 ',category:'fronts'}).map(p=>p.id),['a']);
 assert.deepEqual(queryCatalog(fixture,{query:'MD019',series:'pillars'}).map(p=>p.id),['b']);
 assert.deepEqual(queryCatalog(fixture,{query:'неизвестное'}),[]);
});
test('request distinguishes different catalog pages sharing a printed designation',()=>{
 const pair=products.filter(p=>p.model==='MD-019');assert.ok(pair.length>1);
 const text=new URL(createEnquiry(products,pair.map(p=>p.id))).searchParams.get('text');
 pair.forEach(p=>assert.ok(text.includes('стр. '+p.page)));
});
