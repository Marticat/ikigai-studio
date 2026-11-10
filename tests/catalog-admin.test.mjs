import test from 'node:test';
import assert from 'node:assert/strict';
import {validateProduct,mergeCatalog,isAdmin,validateImage} from '../worker/catalog-service.mjs';
import {products} from '../public/catalog.mjs';
test('validated edits preserve source identity and reject unsafe images or prices',()=>{
 const p={...products[0],price:120000,priceUnit:'set',visible:true};
 assert.equal(validateProduct(p).price,120000);
 assert.throws(()=>validateProduct({...p,image:'javascript:alert(1)'}));
 assert.throws(()=>validateProduct({...p,price:-1}));
 assert.throws(()=>validateProduct({...p,category:'bad'}));
 assert.throws(()=>validateProduct({...p,series:'bad'}));
 assert.throws(()=>validateProduct({...p,page:99}));
});
test('overrides persist hidden products without leaking them publicly and recompute series',()=>{
 const hidden={...products[0],visible:false};
 const rows=[{id:hidden.id,payload:JSON.stringify(hidden),revision:2}];
 assert.ok(!mergeCatalog(rows).products.some(p=>p.id===hidden.id));
 assert.equal(mergeCatalog(rows,true).products.find(p=>p.id===hidden.id).revision,2);
 const catalog=mergeCatalog(rows);for(const s of catalog.series)assert.equal(s.count,catalog.products.filter(p=>p.series===s.id).length);
});
test('admin requires verified platform identity and exact allowed email',()=>{
 const env={CATALOG_ADMIN_EMAILS:'owner@example.com'};
 const request=headers=>new Request('https://example.com/api/admin',{headers});
 assert.equal(isAdmin(request({'oai-authenticated-user-email':'owner@example.com'}),env),false);
 assert.equal(isAdmin(request({'oai-authenticated-user-id':'1','oai-authenticated-user-email':'owner@example.com.evil'}),env),false);
 assert.equal(isAdmin(request({'oai-authenticated-user-id':'1','oai-authenticated-user-email':'owner@example.com'}),env),true);
});
test('uploads reject SVG or forged file signatures',()=>{
 assert.throws(()=>validateImage(new Uint8Array([60,115,118,103]),'image/svg+xml'));
 assert.throws(()=>validateImage(new Uint8Array([60,115,118,103]),'image/png'));
 assert.equal(validateImage(new Uint8Array([137,80,78,71,13,10,26,10]),'image/png'),'png');
});
