export const CONSENT_VERSION=1,CONSENT_TTL=180*24*60*60*1000;
export const CONSENT_KEY='ikigai-consent-v1';
export const PREFERENCE_KEYS=['ikigai-wardrobe-selection-v1','ikigai-configurator-v1'];
export function parseConsent(raw,now=Date.now()){
 try{const value=JSON.parse(raw);return value&&value.version===CONSENT_VERSION&&typeof value.preferences==='boolean'&&Number.isFinite(value.at)&&value.at<=now&&now-value.at<CONSENT_TTL?value:null;}catch{return null;}
}
export function consent(){try{return parseConsent(localStorage.getItem(CONSENT_KEY));}catch{return null;}}
export const preferencesEnabled=()=>consent()?.preferences===true;
export const preferenceStorage={
 getItem(key){return (preferencesEnabled()?localStorage:sessionStorage).getItem(key);},
 setItem(key,value){(preferencesEnabled()?localStorage:sessionStorage).setItem(key,value);}
};
export function saveConsent(preferences){
 const previous=preferencesEnabled();
 const choice={version:CONSENT_VERSION,preferences:preferences===true,at:Date.now()};
 localStorage.setItem(CONSENT_KEY,JSON.stringify(choice));
 for(const key of PREFERENCE_KEYS){
  if(choice.preferences&&!previous){const current=sessionStorage.getItem(key);if(current!==null)localStorage.setItem(key,current);}
  else if(!choice.preferences){const current=localStorage.getItem(key);if(current!==null&&(previous||sessionStorage.getItem(key)===null))sessionStorage.setItem(key,current);localStorage.removeItem(key);}
 }
 return choice;
}
