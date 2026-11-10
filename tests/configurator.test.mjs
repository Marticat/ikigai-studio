import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeConfig,estimateConfig,configEnquiry,presets,defaultConfig} from '../public/configurator-model.mjs';
import {wardrobeScene} from '../public/configurator-scene.mjs';

test('corrupt persisted values cannot escape allowed configuration',()=>{
 assert.deepEqual(normalizeConfig(null),defaultConfig);
 assert.deepEqual(normalizeConfig([]),defaultConfig);
 const c=normalizeConfig({width:'<svg>',height:Infinity,glass:'<script>',profile:'no',light:'no',preset:'no'});
 assert.deepEqual(c,defaultConfig);
 assert.equal(normalizeConfig({width:9999,height:-100}).width,420);
 assert.equal(normalizeConfig({width:9999,height:-100}).height,220);
 assert.equal(normalizeConfig({width:'255'}).width,260);
 assert.deepEqual(normalizeConfig({width:{valueOf:null,toString:null},glass:{toString:null},preset:['shelves']}),defaultConfig);
});
test('scene stays safe and changes real geometry for presets and preview doors',()=>{
 const corrupted=wardrobeScene({width:'<script>',glass:'onload=alert(1)'});
 assert.doesNotMatch(corrupted,/NaN|undefined|<script|onload=/);
 const clothes=wardrobeScene({...defaultConfig,preset:'clothes'}),shelves=wardrobeScene({...defaultConfig,preset:'shelves'});
 assert.equal((clothes.match(/data-bay="hang"/g)||[]).length,3);
 assert.equal((shelves.match(/data-bay="stack"/g)||[]).length,2);
 assert.equal((shelves.match(/data-drawer="true"/g)||[]).length,4);
 assert.doesNotMatch(wardrobeScene({...defaultConfig,glass:'open'}),/data-glass=/);
 assert.match(wardrobeScene(defaultConfig,{doorsOpen:true}),/scale\(0.12 1\)/);
});
test('presets provide meaningfully different storage',()=>{
 assert.equal(Object.keys(presets).length,3);
 assert.ok(presets.clothes.bays.filter(b=>b.type==='hang').length>presets.shelves.bays.filter(b=>b.type==='hang').length);
 assert.ok(presets.shelves.shelves>presets.clothes.shelves);
 assert.notEqual(presets.clothes.drawers,presets.mixed.drawers);
});
test('estimate changes with actual choices and includes honest provisional range',()=>{
 const basic={...defaultConfig,glass:'open',light:'off',profile:'graphite'};
 const base=estimateConfig(basic);
 for(const update of [{glass:'clear'},{light:'warm'},{profile:'bronze'},{width:360},{height:290}])assert.ok(estimateConfig({...basic,...update}).total>base.total);
 assert.equal(estimateConfig({...basic,doorsOpen:true}).total,base.total);
 assert.equal(base.total,base.lines.reduce((sum,l)=>sum+l.amount,0));
 assert.ok(base.low<base.total&&base.high>base.total);
 assert.equal(base.low%10000,0);assert.equal(base.high%10000,0);
 assert.ok(estimateConfig({...basic,preset:'mixed'}).total>estimateConfig({...basic,preset:'clothes'}).total);
});
test('all combinations at dimension extremes produce finite positive ranges',()=>{
 for(const preset of Object.keys(presets))for(const glass of ['open','clear','smoked','bronze'])for(const width of [180,420])for(const height of [220,300]){
  const result=estimateConfig({preset,glass,width,height});assert.ok(Number.isFinite(result.total));assert.ok(result.low>0);assert.ok(result.high>result.low);
 }
});
test('enquiry contains settings and explicitly unconfirmed price, never payment instruction',()=>{
 const parsed=new URL(configEnquiry({...defaultConfig,width:320,preset:'shelves'}));
 assert.equal(parsed.hostname,'wa.me');assert.equal(parsed.pathname,'/77019996799');
 const text=parsed.searchParams.get('text');assert.match(text,/320 × 260 × 60/);assert.match(text,/Больше полок/);assert.match(text,/демонстрационный/);assert.match(text,/не подтверждён/);
 assert.doesNotMatch(text,/undefined|NaN|Оплатить/);
});
