export function resolveCatalog(params,products,series,categories){
 if(params.has('product')){const product=products.find(p=>p.id===params.get('product'));return product?{type:'product',product}:{type:'missing'};}
 if(params.has('series')){const item=series.find(s=>s.id===params.get('series'));return item?{type:'series',series:item}:{type:'missing'};}
 if(params.has('category')){const category=categories.find(c=>c.id===params.get('category'));return category?{type:'category',category}:{type:'missing'};}
 return {type:'catalog'};
}
const normalize=value=>String(value||'').toLocaleLowerCase('ru').replace(/[\s‐‑–—-]+/g,'');
export function queryCatalog(products,{category='all',series='',query=''}={}){
 const needle=normalize(query);
 return products.filter(p=>(category==='all'||p.category===category)&&(!series||p.series===series)&&normalize([p.name,p.model,p.seriesName,p.tag,p.description,...(p.details||[])].join(' ')).includes(needle));
}
