import {language} from './i18n.mjs';
import {legalContent} from './legal-content.mjs';
const copy=legalContent[language],key=document.body.dataset.legalPage,page=copy.pages[key];
const e=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
document.title=page.title+' — IKIGAI';document.querySelector('meta[name="description"]').content=page.intro;
document.querySelector('#legal-content').innerHTML=`<a class="legal-back" href="index.html?lang=${language}">← ${copy.back}</a><p class="eyebrow">IKIGAI / INFORMATION</p><h1>${page.title}</h1><p class="legal-intro">${page.intro}</p><p class="legal-updated">${copy.updated}</p>${page.sections.map(([title,text])=>`<section><h2>${e(title)}</h2><p>${e(text)}</p></section>`).join('')}${page.source?`<a class="text-link" href="${page.source}" target="_blank" rel="noopener noreferrer">${page.sourceLabel} ›</a>`:''}<a class="light-button" href="tel:+77019996799">${copy.contact}<span>›</span></a>`;
