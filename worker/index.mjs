import {isAdmin,mergeCatalog,validateProduct,validateImage} from './catalog-service.mjs';
const json=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
async function readLimited(request,limit){
 if(Number(request.headers.get('content-length'))>limit)throw Object.assign(new Error('Файл или данные слишком большие.'),{status:413});
 const reader=request.body?.getReader();if(!reader)return new Uint8Array();
 const parts=[];let size=0;while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>limit){await reader.cancel();throw Object.assign(new Error('Файл или данные слишком большие.'),{status:413});}parts.push(value);}
 const result=new Uint8Array(size);let offset=0;for(const p of parts){result.set(p,offset);offset+=p.length;}return result;
}
async function rows(env){if(!env.DB)throw new Error('Каталог временно недоступен.');return (await env.DB.prepare('SELECT id, payload, revision FROM catalog_edits').all()).results;}
export default {async fetch(request,env){
 const url=new URL(request.url),path=url.pathname;
 try{
  if(path==='/api/catalog'&&request.method==='GET')return json(mergeCatalog(await rows(env)));
  if(path.startsWith('/api/admin')){
   if(!isAdmin(request,env))return json({error:'Войдите с аккаунтом, которому открыт доступ к каталогу.'},request.headers.get('oai-authenticated-user-id')?403:401);
   if(request.method!=='GET'&&(request.headers.get('origin')!==url.origin||request.headers.get('x-ikigai-admin')!=='1'))return json({error:'Обновите страницу и повторите действие.'},403);
   if(path==='/api/admin/catalog'&&request.method==='GET')return json({...mergeCatalog(await rows(env),true),email:request.headers.get('oai-authenticated-user-email')});
   if(path==='/api/admin/product'&&request.method==='PUT'){
    if(!request.headers.get('content-type')?.startsWith('application/json'))return json({error:'Нужен JSON.'},415);
    let body;try{body=JSON.parse(new TextDecoder().decode(await readLimited(request,24000)));}catch(error){if(error.status)throw error;return json({error:'Не удалось прочитать карточку.'},400);}
    const p=validateProduct(body.product),revision=body.revision;
    if(!Number.isInteger(revision)||revision<0)return json({error:'Обновите карточку перед сохранением.'},400);
    const timestamp=new Date().toISOString();
    // First edits start at 0. Conditional writes also protect simultaneous first saves.
    const statement=revision===0?env.DB.prepare('INSERT OR IGNORE INTO catalog_edits (id,payload,revision,updated_at) VALUES (?,?,1,?)').bind(p.id,JSON.stringify(p),timestamp):env.DB.prepare('UPDATE catalog_edits SET payload=?, revision=revision+1, updated_at=? WHERE id=? AND revision=?').bind(JSON.stringify(p),timestamp,p.id,revision);
    const result=await statement.run();if(result.meta.changes!==1)return json({error:'Эту карточку уже изменили в другой вкладке. Скопируйте ваши правки и откройте карточку заново.'},409);
    return json({product:{...p,revision:revision+1}});
   }
   if(path==='/api/admin/upload'&&request.method==='POST'){
    const bytes=await readLimited(request,5*1024*1024),type=request.headers.get('content-type'),extension=validateImage(bytes,type);
    const key=crypto.randomUUID()+'.'+extension;await env.BUCKET.put(key,bytes,{httpMetadata:{contentType:type}});return json({url:'/media/'+key},201);
   }
   return json({error:'Действие не найдено.'},404);
  }
  if(path.startsWith('/media/')&&(request.method==='GET'||request.method==='HEAD')){
   const key=path.slice(7);if(!/^[a-f0-9-]+\.(png|jpg|webp)$/.test(key))return new Response('Not found',{status:404});
   const object=await env.BUCKET.get(key);if(!object)return new Response('Not found',{status:404});
   return new Response(request.method==='HEAD'?null:object.body,{headers:{'Content-Type':object.httpMetadata.contentType,'Cache-Control':'public,max-age=31536000,immutable','X-Content-Type-Options':'nosniff'}});
  }
  if(path.startsWith('/api/'))return json({error:'Не найдено.'},404);
  return env.ASSETS.fetch(request);
 }catch(error){console.error('Catalog request failed',path,error.name);return json({error:error.status===413?error.message:path==='/api/admin/product'||path==='/api/admin/upload'?'Проверьте поля: '+error.message:'Не удалось загрузить каталог. Попробуйте ещё раз.'},error.status||((path==='/api/admin/product'||path==='/api/admin/upload')?400:503));}
}};
