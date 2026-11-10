import test from 'node:test';
import assert from 'node:assert/strict';
import {availabilityText} from '../public/availability.mjs';
import {validateProduct,mergeCatalog} from '../worker/catalog-service.mjs';
import {products} from '../public/catalog.mjs';
const base={...products[0],price:null,priceUnit:'piece'};
test('old records do not imply stock or a lead time',()=>{
 const old=validateProduct(base);assert.equal(old.availability,'unknown');assert.equal(old.leadTimeMin,null);assert.equal(old.leadTimeMax,null);
 assert.equal(availabilityText(base).label,'Наличие уточняется');assert.equal(availabilityText(base,'en').label,'Check availability');
});
test('stock and supply windows survive persistence and localization',()=>{
 const saved=validateProduct({...base,availability:'on_order',leadTimeMin:20,leadTimeMax:35});
 const merged=mergeCatalog([{id:saved.id,payload:JSON.stringify(saved),revision:1}]).products.find(p=>p.id===saved.id);
 for(const lang of ['ru','kk','en']){const display=availabilityText(merged,lang);assert.match(display.timing,/20–35/);assert.equal(display.status,'on_order');}
 assert.equal(availabilityText({...saved,availability:'in_stock',leadTimeMin:1,leadTimeMax:1}).timing,'Ориентировочно 1 день');
});
test('availability writes reject unsupported states, incomplete windows and invalid day values',()=>{
 for(const change of [{availability:'sold_out'},{availability:'<img>'},{leadTimeMin:5},{leadTimeMax:9},{leadTimeMin:7,leadTimeMax:2},{leadTimeMin:0,leadTimeMax:4},{leadTimeMin:1.5,leadTimeMax:4},{leadTimeMin:2,leadTimeMax:366},{leadTimeMin:'2',leadTimeMax:'4'}])assert.throws(()=>validateProduct({...base,...change}));
 const cleared=validateProduct({...base,availability:'in_stock',leadTimeMin:null,leadTimeMax:null});assert.equal(cleared.leadTimeMin,null);
});
