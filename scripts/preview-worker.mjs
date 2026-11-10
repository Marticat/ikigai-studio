// LOCAL ONLY. Never imported by the production build.
import worker from '../worker/index.mjs';
export default {async fetch(request,env,ctx){
 const url=new URL(request.url);if(!['127.0.0.1','localhost'].includes(url.hostname))return new Response('Local preview only',{status:403});
 if(url.pathname==='/signin-with-chatgpt'||url.pathname==='/signout-with-chatgpt'){
  const signin=url.pathname==='/signin-with-chatgpt';
  return new Response(null,{status:302,headers:{Location:'/admin.html','Set-Cookie':`ikigai_preview=${signin?'1':''}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${signin?3600:0}`,'Cache-Control':'no-store'}});
 }
 const headers=new Headers(request.headers);for(const name of [...headers.keys()])if(name.startsWith('oai-authenticated-user-'))headers.delete(name);
 if((headers.get('cookie')||'').split(';').some(c=>c.trim()==='ikigai_preview=1')){headers.set('oai-authenticated-user-id','local-preview');headers.set('oai-authenticated-user-email','preview@sites.test');}
 return worker.fetch(new Request(request,{headers}),{...env,CATALOG_ADMIN_EMAILS:'preview@sites.test'},ctx);
}};
