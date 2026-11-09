import {makeBlend,baseById,cleanAppearance} from './blend-model.mjs';
import {dateKey,moveDate} from './scent-calendar.mjs';
const fail=message=>{throw new Error(message);};
const str=(v,max)=>typeof v==='string'&&v.length<=max;
export function restoreEditor(raw){
 if(!raw||![1,2].includes(raw.step)||!raw.editor)return null;
 const e=raw.editor;
 if(![10,30,50,100].includes(e.capacity)||!Array.isArray(e.ids)||e.ids.length>4||new Set(e.ids).size!==e.ids.length||e.ids.some(id=>!baseById(id)))return null;
 if(!Array.isArray(e.entries)||e.entries.length>4||e.entries.some(r=>!Array.isArray(r)||r.length!==2||!baseById(r[0])||!Number.isFinite(r[1])||r[1]<0||r[1]>100))return null;
 if(raw.step===2&&(e.entries.length!==e.ids.length||new Set(e.entries.map(r=>r[0])).size!==e.ids.length||e.entries.some(r=>!e.ids.includes(r[0]))))return null;
 return {step:raw.step===2&&e.ids.length<3?1:raw.step,editor:{capacity:e.capacity,ids:[...e.ids],entries:structuredClone(e.entries),appearance:cleanAppearance(e.appearance),forceNew:!!e.forceNew}};
}
export function validateBackup(raw,perfumeIds){
 if(!raw||raw.app!=='Scent Atelier design prototype'||![1,2].includes(raw.version))fail('不是支持的气味手记备份文件。');
 for(const key of ['works','diary','owned'])if(!Array.isArray(raw[key])||raw[key].length>100000)fail('备份记录格式不正确。');
 for(const key of ['works','diary'])if(new Set(raw[key].map(r=>r?.id)).size!==raw[key].length)fail('备份中存在重复记录编号。');
 function checkBlend(b){if(!b||!Array.isArray(b.rows))fail('配方格式不正确。');const expected=makeBlend(b.capacity,b.rows.map(r=>[r.id,r.percent]));if(b.rows.some((r,i)=>!Number.isInteger(r.added)||r.added<0||r.added>expected.rows[i].target||r.target!==expected.rows[i].target))fail('配方用量不正确。');if(b.sealed&&b.rows.some(r=>r.added!==r.target))fail('封瓶进度不完整。');}
 for(const w of raw.works){if(!w||!str(w.id,120)||!w.id||!str(w.name,24)||!w.name.trim()||!str(w.date,40)||!Number.isFinite(Date.parse(w.date)))fail('作品信息不正确。');checkBlend(w);if(w.rows.some(r=>r.added!==r.target))fail('作品尚未完成注入。');}
 for(const d of raw.diary){if(!d||!str(d.id,120)||!d.id||!perfumeIds.has(d.perfumeId)||!/^\d{4}-\d{2}-\d{2}$/.test(d.date)||moveDate(d.date,0)!==d.date||d.date>dateKey()||!str(d.note,500)||!d.note.trim()||!str(d.weather,40)||!str(d.occasion,40))fail('日记包含无效日期、香水或内容。');}
 if(raw.owned.some(id=>!perfumeIds.has(id)))fail('香柜包含当前图鉴中不存在的香水。');
 for(const k of ['draft','previousDraft'])if(raw[k]!=null)checkBlend(raw[k]);
 if(raw.editorDraft!=null&&!restoreEditor(raw.editorDraft))fail('编辑草稿格式不正确。');
 return structuredClone(raw);
}
const canonical=v=>JSON.stringify(v,(_,x)=>x&&typeof x==='object'&&!Array.isArray(x)?Object.fromEntries(Object.keys(x).sort().map(k=>[k,x[k]])):x);
export function backupConflicts(current,incoming){return ['works','diary'].flatMap(type=>incoming[type].filter(row=>current[type].some(old=>old.id===row.id&&canonical(old)!==canonical(row))).map(row=>({type,id:row.id,label:row.name||row.date})));}
export function mergeBackup(current,incoming,choices={}){
 const next=structuredClone(current);
 for(const type of ['works','diary']){const rows=new Map(current[type].map(r=>[r.id,r]));for(const row of incoming[type]){const old=rows.get(row.id);if(old&&canonical(old)!==canonical(row)){const choice=choices[type+':'+row.id];if(!['current','incoming'].includes(choice))fail('请处理每一项冲突。');if(choice==='current')continue;}rows.set(row.id,row);}next[type]=[...rows.values()];}
 next.owned=[...new Set([...current.owned,...incoming.owned])];
 return next;
}
