export function availabilityText(product,language='ru'){
 const labels={ru:{unknown:'Наличие уточняется',in_stock:'В наличии',on_order:'Под заказ',pending:'Срок поставки уточняется'},kk:{unknown:'Қолжетімділігін нақтылаңыз',in_stock:'Қоймада бар',on_order:'Тапсырыспен',pending:'Жеткізу мерзімі нақтыланады'},en:{unknown:'Check availability',in_stock:'In stock',on_order:'To order',pending:'Confirm lead time'}};
 const lang=Object.hasOwn(labels,language)?language:'ru',words=labels[lang],status=['in_stock','on_order'].includes(product.availability)?product.availability:'unknown';
 const min=product.leadTimeMin,max=product.leadTimeMax,valid=Number.isInteger(min)&&Number.isInteger(max)&&min>=1&&max>=min&&max<=365;
 let timing=words.pending;
 if(valid){const value=min===max?String(min):`${min}–${max}`;let unit='дней';if(max%100<11||max%100>14)unit=max%10===1?'день':max%10>=2&&max%10<=4?'дня':'дней';timing=lang==='en'?`Estimated ${value} ${max===1?'day':'days'}`:lang==='kk'?`Шамамен ${value} күн`:`Ориентировочно ${value} ${unit}`;}
 const note=valid?({ru:'Календарные дни после подтверждения заказа. Точные даты согласуем при оформлении.',kk:'Тапсырыс расталғаннан кейінгі күнтізбелік күндер. Нақты күндерді тапсырыс кезінде келісеміз.',en:'Calendar days after order confirmation. Exact dates are agreed when placing the order.'})[lang]:'';
 return {status,label:words[status],timing,note};
}
