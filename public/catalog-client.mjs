export async function loadCatalog(){
 const response=await fetch('/api/catalog',{cache:'no-store'});
 if(!response.ok)throw new Error('Каталог временно недоступен.');
 return response.json();
}
export function catalogUnavailable(){
 const panel=document.createElement('div');panel.className='catalog-load-error';panel.setAttribute('role','alert');
 panel.innerHTML='<p>Не удалось загрузить актуальный каталог.</p><button class="light-button" type="button">Попробовать ещё раз ↻</button>';
 panel.querySelector('button').onclick=()=>location.reload();
 (document.querySelector('#catalog-view')||document.querySelector('#catalog-grid')).replaceChildren(panel);
}
