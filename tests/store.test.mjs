import test from 'node:test';
import assert from 'node:assert/strict';
import { filterProducts, restoreSelection, toggleSelection, createEnquiry, escapeHTML, featuredState } from '../public/store.mjs';
const products = [{id:'a',category:'systems',name:'Стекло и профиль'},{id:'b',category:'filling',name:'Ящик для аксессуаров'}];
test('filter and search work together and ignore whitespace/case',()=>{
  assert.deepEqual(filterProducts(products,'systems',' стекло ').map(p=>p.id),['a']);
  assert.deepEqual(filterProducts(products,'filling','стекло'),[]);
  assert.equal(filterProducts(products,'all','').length,2);
});
test('invalid stored state cannot break collection or retain removed products',()=>{
  assert.deepEqual(restoreSelection('{bad',products),[]);
  assert.deepEqual(restoreSelection('{}',products),[]);
  assert.deepEqual(restoreSelection('["a","missing","a",null]',products),['a']);
});
test('selection toggles without duplicates and leaves input unchanged',()=>{
  const original=['a'];assert.deepEqual(toggleSelection(original,'b'),['a','b']);
  assert.deepEqual(toggleSelection(original,'a'),[]);assert.deepEqual(original,['a']);
});
test('enquiry preserves supplied text, selected names and never invents price',()=>{
  const url=createEnquiry(products,['b'],{name:'Алия & Дана',dimensions:'300 × 240',comment:'Без стекла?'});
  const parsed=new URL(url);assert.equal(parsed.hostname,'wa.me');assert.equal(parsed.pathname,'/77019996799');
  const t=parsed.searchParams.get('text');assert.match(t,/Ящик для аксессуаров/);assert.match(t,/Алия & Дана/);
  assert.match(t,/300 × 240/);assert.match(t,/Без стекла\?/);assert.doesNotMatch(t,/undefined|120000|Стекло и профиль/);
});
test('catalog names with quotes and markup remain literal when rendered',()=>{
 assert.equal(escapeHTML('Шкаф "Графит" & <img src=x onerror=alert(1)>'), 'Шкаф &quot;Графит&quot; &amp; &lt;img src=x onerror=alert(1)&gt;');
 assert.equal(escapeHTML("O'Neil"),'O&#39;Neil');
});
test('removed featured product disables selection without breaking other products',()=>{
 assert.deepEqual(featuredState(products,['a'],'removed'),{available:false,selected:false});
 assert.deepEqual(featuredState(products,['a'],'a'),{available:true,selected:true});
 assert.deepEqual(featuredState(products,['a'],'b'),{available:true,selected:false});
});
