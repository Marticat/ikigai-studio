import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {realisticScene,photoAssets} from '../public/configurator-realistic.mjs';
import {defaultConfig,estimateConfig} from '../public/configurator-model.mjs';
test('every storage preset uses its own local photorealistic plate',()=>{
 assert.equal(new Set(Object.values(photoAssets)).size,3);
 for(const [preset,path] of Object.entries(photoAssets)){
  assert.ok(existsSync(new URL('../public/'+path,import.meta.url)));
  assert.ok(realisticScene({...defaultConfig,preset}).includes(path));
 }
});
test('materials, glass and light affect actual scene layers',()=>{
 const off=realisticScene({...defaultConfig,glass:'open',light:'off'});
 assert.doesNotMatch(off,/class="real-glass"|class="real-led"/);
 const warm=realisticScene({...defaultConfig,profile:'bronze',glass:'bronze',light:'warm'});
 assert.match(warm,/class="real-glass"/);assert.match(warm,/class="real-led"/);assert.match(warm,/data-profile="bronze"/);
 assert.notEqual(warm,realisticScene({...defaultConfig,light:'neutral'}));
});
test('opening glass keeps chosen glass and estimate, restores safe dimensions',()=>{
 const open=realisticScene(defaultConfig,{doorsOpen:true});
 assert.doesNotMatch(open,/class="real-glass"/);
 assert.equal(estimateConfig({...defaultConfig,doorsOpen:true}).total,estimateConfig(defaultConfig).total);
 const malformed=realisticScene({width:'onload=alert(1)',height:-1,profile:'<script>'});
 assert.doesNotMatch(malformed,/NaN|undefined|onload|<script>/);
 assert.notEqual(realisticScene({...defaultConfig,width:180}),realisticScene({...defaultConfig,width:420}));
});
