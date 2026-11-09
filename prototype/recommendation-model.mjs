import {recommendationCatalog,recommendationRelease} from './recommendation-data.mjs';
export const recommendationHistoryKey='scent-recommendation-history-v1';
export const localDay=(date=new Date())=>[date.getFullYear(),String(date.getMonth()+1).padStart(2,'0'),String(date.getDate()).padStart(2,'0')].join('-');
export function releaseCandidates(perfumes,weather,occasion,{date=new Date(),catalog=recommendationCatalog,release=recommendationRelease}={}){
 const day=localDay(date),byId=new Map(perfumes.map(p=>[p.id,p]));
 if(day<release.effectiveFrom||day>release.effectiveUntil||release.catalogVersion!==catalog.version)return [];
 return release.entries.flatMap(row=>{
  const entry=catalog.entries.find(e=>e.id===row.id),perfume=byId.get(row.id);
  if(!entry||!perfume||entry.status!=='eligible'||entry.version!==row.version||entry.reviewDue<day||entry.facts.checkedAt>day||!entry.facts.sourceUrl||!entry.image)return [];
  if(entry.concentration!==perfume.concentration||entry.image!==perfume.image||entry.brand!==perfume.brand||JSON.stringify(entry.facts.notes)!==JSON.stringify(perfume.reviewedProfile?.notes))return [];
  if(!row.weather.includes(weather)||!row.occasions.includes(occasion)||!entry.editorial.weather.includes(weather)||!entry.editorial.occasions.includes(occasion))return [];
  return [{perfume,entry,releaseVersion:release.version}];
 });
}
const hash=value=>[...value].reduce((h,c)=>(Math.imul(h,31)+c.codePointAt(0))>>>0,0);
export function recommendPerfume(perfumes,owned,weather,occasion,{date=new Date(),history=[],manual=false,catalog=recommendationCatalog,release=recommendationRelease}={}){
 const day=localDay(date),cabinet=perfumes.filter(p=>owned.includes(p.id));
 const eligible=releaseCandidates(perfumes,weather,occasion,{date,catalog,release});
 let pool=cabinet.length?eligible.filter(e=>owned.includes(e.perfume.id)):eligible;
 const exploration=cabinet.length>0&&!pool.length;
 if(exploration)pool=cabinet.map(perfume=>({perfume,entry:null,releaseVersion:null}));
 if(!pool.length)return null;
 const validHistory=history.filter(h=>h.day<=day),last=validHistory.at(-1);
 const same=[...validHistory].reverse().find(h=>h.day===day&&h.weather===weather&&h.occasion===occasion&&h.exploration===exploration&&h.releaseVersion===(exploration?null:release.version));
 let chosen=!manual&&same?pool.find(e=>e.perfume.id===same.id):null;
 if(!chosen){
  const recent=validHistory.slice(-20),lastIndex=id=>recent.findLastIndex(h=>h.id===id);
  const ranked=[...pool].sort((a,b)=>Number(a.perfume.id===last?.id)-Number(b.perfume.id===last?.id)||Number(a.perfume.brand===last?.brand)-Number(b.perfume.brand===last?.brand)||lastIndex(a.perfume.id)-lastIndex(b.perfume.id)||hash(day+weather+occasion+a.perfume.id)-hash(day+weather+occasion+b.perfume.id));
  chosen=ranked[0];
 }
 const reason=exploration?'香柜中没有符合本期情境清单的款式。这是香柜探索，尚无当前天气与场景的入选依据。':`「${weather} · ${occasion}」：${chosen.entry.facts.summary} ${chosen.entry.editorial.rationale}`;
 const record={day,weather,occasion,id:chosen.perfume.id,brand:chosen.perfume.brand,reason,releaseVersion:chosen.releaseVersion,catalogVersion:exploration?null:catalog.version,entryVersion:chosen.entry?.version??null,exploration,manual};
 return {...chosen,fromCabinet:cabinet.length>0,exploration,reason,candidateCount:pool.length,record};
}
export function rememberRecommendation(history,record){
 const last=history.at(-1);
 if(last&&['day','weather','occasion','id','releaseVersion','exploration'].every(key=>last[key]===record[key]))return history;
 return [...history,record].slice(-300);
}
