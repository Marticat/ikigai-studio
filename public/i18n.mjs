import {uiTranslations} from './ui-translations.mjs';
import {extraTranslations} from './extra-translations.mjs';
import {catalogTranslations} from './catalog-translations.mjs';
import {products as seedProducts,series as seedSeries,categories as seedCategories} from './catalog.mjs';
export const languages=['ru','kk','en'];
export const resolveLanguage=(requested,saved)=>languages.includes(requested)?requested:languages.includes(saved)?saved:'ru';
let saved;try{saved=globalThis.localStorage?.getItem('ikigai-language');}catch{}
export const language=resolveLanguage(typeof location!=='undefined'?new URLSearchParams(location.search).get('lang'):null,saved);
const normalize=value=>String(value??'').replace(/\s+/g,' ').trim();
const dictionaries={kk:new Map(),en:new Map()};
for(const [ru,translations] of Object.entries({...uiTranslations,...extraTranslations}))for(const lang of ['kk','en'])if(translations[lang])dictionaries[lang].set(normalize(ru).toLowerCase(),translations[lang]);
for(const lang of ['kk','en']){
 for(const [type,seed] of [['products',seedProducts],['series',seedSeries],['categories',seedCategories]])for(const item of seed){
  const translated=catalogTranslations[lang]?.[type]?.[item.id];if(!translated)continue;
  for(const field of ['name','description','tag','seriesName'])if(item[field]&&translated[field])dictionaries[lang].set(normalize(item[field]).toLowerCase(),translated[field]);
  for(const [i,value] of (item.details||[]).entries())if(translated.details?.[i])dictionaries[lang].set(normalize(value).toLowerCase(),translated.details[i]);
 }
}
const special={en:{'см':'cm','мм':'mm','шт.':'pcs','пог. м':'linear m','комплект':'set','стр.':'p.','страница':'page','страницы':'pages','позиций':'items','решений':'solutions','серий':'series','товаров':'products','на сайте':'visible','Найдено':'Found','Показано':'Showing','из':'of','Отделки':'Finishes','Особенность':'Feature','Источник':'Source'},kk:{'см':'см','мм':'мм','шт.':'дана','пог. м':'қума м','комплект':'жиынтық','стр.':'бет','страница':'бет','страницы':'бет','позиций':'тауар','решений':'шешім','серий':'топтама','товаров':'тауар','на сайте':'сайтта','Найдено':'Табылды','Показано':'Көрсетілді','из':'/','Отделки':'Өңдеу түрлері','Особенность':'Ерекшелік','Источник':'Дереккөз'}};
export function translate(value,lang=language){
 const raw=String(value??'');if(lang==='ru'||!languages.includes(lang))return raw;
 const text=normalize(raw);if(!text)return raw;
 let result=dictionaries[lang].get(text.toLowerCase())??special[lang][text];
 if(result===undefined){
  const count=text.match(/^Показано (\d+) из (\d+) (решений|позиций)$/);
  if(count)result=lang==='en'?`Showing ${count[1]} of ${count[2]} items`:`${count[2]} тауардың ${count[1]} көрсетілді`;
  const total=text.match(/^(\d+) товаров · (\d+) на сайте$/);if(total)result=lang==='en'?`${total[1]} products · ${total[2]} visible`:`${total[1]} тауар · ${total[2]} сайтта`;
  if(result===undefined&&text.includes(' · '))result=text.split(' · ').map(s=>translate(s,lang)).join(' · ');
  if(result===undefined&&text.includes(': ')){const at=text.indexOf(': ');result=translate(text.slice(0,at),lang)+': '+translate(text.slice(at+2),lang);}
  if(result===undefined&&/[↗↙↓↑+✓↻]$/.test(text))result=translate(text.slice(0,-1).trim(),lang)+' '+text.slice(-1);
  if(result===undefined&&/^\d{2} \/ /.test(text))result=text.slice(0,5)+translate(text.slice(5),lang);
  if(result===undefined&&text.startsWith('IKIGAI / '))result='IKIGAI / '+translate(text.slice(9),lang);
  if(result===undefined&&text.endsWith(' — IKIGAI'))result=translate(text.slice(0,-9),lang)+' — IKIGAI';
  if(result===undefined)result=text;
  // Numeric/unit fragments and provenance are not free-form product prose.
  if(/\d|^от |^Стр\./.test(result)){
   result=result.replace(/Показано/g,special[lang]['Показано']).replace(/Найдено/g,special[lang]['Найдено']).replace(/[Сс]траниц(?:а|ы)?|Стр\.|стр\./g,lang==='en'?'p.':'бет').replace(/серий/g,special[lang]['серий']).replace(/позиций/g,special[lang]['позиций']).replace(/решений/g,special[lang]['решений']).replace(/\bMEIDU \/ /g,'MEIDU / ');
   if(lang==='en')result=result.replace(/сантиметров/g,'centimetres').replace(/(?<=\d\s*)см(?=[\s.,]|$)/g,'cm').replace(/(?<=\d\s*)мм(?=[\s.,]|$)/g,'mm').replace(/шт\./g,'pcs').replace(/пог\. м/g,'linear m').replace(/комплект/g,'set').replace(/^от /,'from ');
   else result=result.replace(/сантиметров/g,'сантиметр').replace(/шт\./g,'дана').replace(/пог\. м/g,'қума м').replace(/комплект/g,'жиынтық').replace(/^от /,'бастап ');
  }
 }
 if(text===text.toUpperCase()&&/[А-ЯЁ]/.test(text))result=result.toLocaleUpperCase(lang);
 return raw.match(/^\s*/)[0]+result+raw.match(/\s*$/)[0];
}
export const t=translate;
export const localeCode=()=>({ru:'ru-RU',kk:'kk-KZ',en:'en-GB'}[language]);
export function localizeCatalog(data,lang=language){
 if(lang==='ru')return data;
 const localized=catalogTranslations[lang];
 const products=data.products.map(product=>{
  const authored=product.translations?.[lang],base=localized.products[product.id];
  // Built-in translation only applies to untouched source copy; edited copy is translated field-by-field when explicitly authored.
  const original=seedProducts.find(p=>p.id===product.id);const fields={};
  for(const field of ['name','description','details','tag']){
   const unchanged=original&&JSON.stringify(product[field])===JSON.stringify(original[field]);
   fields[field]=authored?.[field]||(unchanged?base?.[field]:null)||product[field];
  }
  return {...product,...fields,seriesName:localized.series[product.series]?.name||product.seriesName,source:translate(product.source,lang),searchTerms:[product.name,product.description,...(product.details||[])].join(' ')};
 });
 const series=data.series.map(s=>({...s,...localized.series[s.id]})),categories=data.categories.map(c=>({...c,...localized.categories[c.id]}));
 return {...data,products,series,categories,categoryLabels:Object.fromEntries(categories.map(c=>[c.id,c.name]))};
}
