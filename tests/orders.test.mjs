import test from 'node:test';
import assert from 'node:assert/strict';
import {fitEnquiry,initialKitConfig,kits,priceLabel} from '../public/order-model.mjs';
test('fit enquiry includes product identity, all inside dimensions and comment without claiming compatibility',()=>{
 const link=fitEnquiry({id:'test',name:'Ящик',model:'MD-019',page:19},{width:'600',height:'400',depth:'500',comment:'Слева петли'});
 const text=new URL(link).searchParams.get('text');
 for(const value of ['Ящик','MD-019','19','600','400','500','мм','Слева петли'])assert.ok(text.includes(value));
 assert.throws(()=>fitEnquiry({id:'x'},{width:'-1',height:'400',depth:'500'}));
 assert.throws(()=>fitEnquiry({id:'x'},{width:'',height:'400',depth:'500'}));
});
test('explicit kit overrides saved settings, invalid kit preserves saved settings',()=>{
 const saved={width:410,height:290,preset:'shelves',glass:'bronze',profile:'silver',light:'off'};
 assert.equal(kits.length,3);
 assert.equal(initialKitConfig('small',saved).width,180);
 assert.equal(initialKitConfig('family',saved).preset,'clothes');
 assert.equal(initialKitConfig('glass',saved).glass,'smoked');
 assert.deepEqual(initialKitConfig('unknown',saved),saved);
});
test('unconfirmed prices stay on request, published prices include units',()=>{
 assert.equal(priceLabel({price:null}),'Цена по запросу');
 assert.match(priceLabel({price:120000,priceUnit:'set',priceFrom:true}),/^от .*₸ \/ комплект$/);
});
