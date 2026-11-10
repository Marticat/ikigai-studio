import {mkdir,cp,writeFile,readFile} from 'node:fs/promises';
import {build} from 'esbuild';
await mkdir('dist/server',{recursive:true});await mkdir('dist/.openai',{recursive:true});
await cp('public','dist/client',{recursive:true});
await build({entryPoints:['worker/index.mjs'],bundle:true,format:'esm',platform:'browser',target:'es2022',outfile:'dist/server/index.js'});
const hosting=JSON.parse(await readFile('.openai/hosting.json','utf8'));
await writeFile('dist/.openai/hosting.json',JSON.stringify(hosting,null,2));
await writeFile('dist/server/wrangler.json',JSON.stringify({name:'ikigai-wardrobes',main:'index.js',compatibility_date:'2025-10-01',assets:{directory:'../client',binding:'ASSETS',run_worker_first:true},d1_databases:[{binding:'DB',database_name:'ikigai-catalog',database_id:'00000000-0000-4000-8000-000000000000'}],r2_buckets:[{binding:'BUCKET',bucket_name:'ikigai-photos'}]},null,2));
console.log('Built website, catalog API and admin.');
