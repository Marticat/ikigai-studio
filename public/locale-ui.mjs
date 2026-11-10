import {language,t} from './i18n.mjs';
const attrs=['alt','aria-label','placeholder','title','aria-valuetext'];
function localLink(el){
 if(el.tagName!=='A'||!el.hasAttribute('href')||el.hasAttribute('download'))return;
 const href=el.getAttribute('href');if(href.startsWith('#'))return;
 let url;try{url=new URL(href,location.href);}catch{return;}
 if(url.origin!==location.origin||/^\/(?:api|media|assets|downloads|signin-with-chatgpt|signout-with-chatgpt|callback)(?:\/|$)/.test(url.pathname)||/\.(?:webp|png|jpg|pdf|css|mjs)$/.test(url.pathname))return;
 if(url.searchParams.get('lang')!==language){url.searchParams.set('lang',language);el.setAttribute('href',url.pathname+url.search+url.hash);}
}
export function translateDOM(root=document){
 if(root.nodeType===3){if(!root.parentElement?.closest('script,style,textarea,[data-no-translate]')){const value=t(root.nodeValue);if(value!==root.nodeValue)root.nodeValue=value;}return;}
 if(root.nodeType!==1&&root!==document)return;
 if(root.nodeType===1&&root.closest('script,style,[data-no-translate]'))return;
 for(const element of [...(root.nodeType===1?[root]:[]),...root.querySelectorAll('*')]){
  if(element.closest('script,style,[data-no-translate]'))continue;
  for(const attr of attrs)if(element.hasAttribute(attr)){const before=element.getAttribute(attr),after=t(before);if(before!==after)element.setAttribute(attr,after);}
  if(element.tagName==='META'&&['description','og:title','og:description'].includes(element.getAttribute('name')||element.getAttribute('property'))){const before=element.content,after=t(before);if(before!==after)element.content=after;}
  localLink(element);
  for(const child of element.childNodes)if(child.nodeType===3)translateDOM(child);
 }
}
document.documentElement.lang=language;
try{localStorage.setItem('ikigai-language',language);}catch{}
const nav=document.createElement('nav');nav.className='language-switch';nav.setAttribute('aria-label',({ru:'Язык сайта',kk:'Сайт тілі',en:'Website language'})[language]);
for(const [code,label] of [['ru','RU'],['kk','ҚАЗ'],['en','EN']]){const url=new URL(location.href);url.searchParams.set('lang',code);const link=document.createElement('a');link.href=url.pathname+url.search+url.hash;link.lang=code;link.hreflang=code;link.textContent=label;link.dataset.noTranslate='';if(code===language)link.setAttribute('aria-current','true');link.addEventListener('click',()=>{const current=new URL(location.href);current.searchParams.set('lang',code);link.href=current.pathname+current.search+current.hash;try{localStorage.setItem('ikigai-language',code);}catch{}});nav.append(link);}
(document.querySelector('.rail')||document.querySelector('.admin-header')||document.querySelector('.legal-header')||document.body).append(nav);
translateDOM();
const observer=new MutationObserver(records=>{
 observer.disconnect();
 const roots=new Set();for(const record of records){if(record.type==='characterData')roots.add(record.target);else if(record.type==='attributes')roots.add(record.target);else for(const node of record.addedNodes)roots.add(node);}
 for(const node of roots)if(node.isConnected)translateDOM(node);
 observe();
});
function observe(){observer.observe(document.documentElement,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:[...attrs,'href','content']});}
observe();
