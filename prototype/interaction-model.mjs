export const formatMl=units=>(units/100).toFixed(1);
export const nextHalfDose=(added,target)=>Math.max(0,Math.min(50,target-added));
export function remainingMl(units){return units>0&&units<10?'不足 0.1':formatMl(units);}
export function ratioFeedback(capacity,entries){
 const sum=entries.reduce((n,[,p])=>n+p,0),difference=100-sum;
 if(entries.some(([,p])=>!Number.isFinite(p)||p<0.1||p>100||Math.abs(p*10-Math.round(p*10))>0.000001))return '每种香气至少 0.1%，比例最多一位小数。';
 if(Math.abs(difference)<0.001)return '配比正好，可以开始注入。';
 return `${difference>0?'还差':'超出'} ${Math.abs(difference).toFixed(1)}%（约 ${formatMl(capacity*Math.abs(difference))} mL），请${difference>0?'增加':'减少'}一些用量。`;
}
export function restoreCatalogView(raw){return {query:typeof raw?.query==='string'?raw.query:'',brand:typeof raw?.brand==='string'?raw.brand:'',region:typeof raw?.region==='string'?raw.region:'',family:typeof raw?.family==='string'?raw.family:'',page:Number.isSafeInteger(raw?.page)&&raw.page>0?raw.page:1,scroll:Number.isFinite(raw?.scroll)&&raw.scroll>=0?raw.scroll:0};}
