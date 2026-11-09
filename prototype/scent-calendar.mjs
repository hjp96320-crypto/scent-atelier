export function dateKey(date=new Date()){
 return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}
export function moveDate(key,days){const [y,m,d]=key.split('-').map(Number);return dateKey(new Date(y,m-1,d+days,12));}
export function moveMonth(key,delta){const [y,m]=key.split('-').map(Number);return dateKey(new Date(y,m-1+delta,1,12)).slice(0,7);}
export function calendarMonth(month,entries=[],today=dateKey()){
 const [year,number]=month.split('-').map(Number),first=new Date(year,number-1,1,12);
 const offset=(first.getDay()+6)%7,start=moveDate(month+'-01',-offset);
 const counts=new Map();for(const entry of entries)counts.set(entry.date,(counts.get(entry.date)||0)+1);
 const current=entries.filter(e=>e.date?.slice(0,7)===month);
 return {label:`${year} 年 ${number} 月`,days:Array.from({length:42},(_,i)=>{
  const key=moveDate(start,i);return {key,day:Number(key.slice(-2)),inMonth:key.slice(0,7)===month,today:key===today,future:key>today,count:counts.get(key)||0};
 }),recordDays:new Set(current.map(e=>e.date)).size,perfumeCount:new Set(current.map(e=>e.perfumeId)).size,entries:current.length};
}
