// Doses use integer hundredths of a millilitre. Animation never decides a recipe.
import {galimardBases} from './galimard-bases.mjs';
import {demeterBases} from './demeter-bases.mjs';
export const bases = [...galimardBases,...demeterBases];
export const suppliers={galimard:{name:'Galimard',format:'已稀释基础香水'},demeter:{name:'Demeter 气味图书馆',format:'成品古龙水'}};
export const baseById = id => bases.find(b => b.id === id);
export function cleanAppearance(value={}) {return {shape:['square','round','oval'].includes(value?.shape)?value.shape:'square',nozzle:['gold','silver'].includes(value?.nozzle)?value.nozzle:'gold',cap:['gold','silver','none'].includes(value?.cap)?value.cap:'silver'};}
export function makeBlend(capacity=10, entries=[['bergamot',40],['tea',35],['wood',25]]) {
  if (![10,30,50,100].includes(capacity)) throw new Error('请选择支持的投料总量。');
  if (entries.length<3 || entries.length>4 || new Set(entries.map(e=>e[0])).size!==entries.length || entries.some(([id,p])=>!baseById(id)||!Number.isFinite(p)||p<0.1||p>100||Math.abs(p*10-Math.round(p*10))>0.000001) || Math.abs(entries.reduce((s,e)=>s+e[1],0)-100)>0.001) throw new Error('请选择 3–4 款基底，比例保留一位小数且合计为 100%。');
  let allocated=0;
  const rows=entries.map(([id,percent],i)=>{const target=i===entries.length-1?capacity*100-allocated:Math.round(capacity*percent);allocated+=target;return {id,percent,target,added:0};});
  return {capacity,rows,selected:rows[0].id,sealed:false,name:'',appearance:cleanAppearance()};
}
export const totalUnits = blend => blend.rows.reduce((s,r)=>s+r.added,0);
export const isComplete = blend => blend.rows.every(r=>r.added===r.target);
export function addDose(blend,id,units) {
  if(blend.sealed || !Number.isFinite(units) || units<=0) return 0;
  const row=blend.rows.find(r=>r.id===id);
  if(!row) return 0;
  const delta=Math.min(row.target-row.added,Math.round(units));
  row.added+=delta;
  return delta;
}
export function restoreBlend(raw) {
  try {
    const clean=makeBlend(raw.capacity,raw.rows.map(r=>[r.id,r.percent]));
    clean.rows.forEach((r,i)=>{r.added=Math.min(r.target,Math.max(0,Math.round(Number(raw.rows[i].added)||0)));});
    clean.selected=clean.rows.some(r=>r.id===raw.selected)?raw.selected:clean.selected;
    clean.sealed=!!raw.sealed&&isComplete(clean);
    clean.name=typeof raw.name==='string'?raw.name.slice(0,24):'';
    clean.appearance=cleanAppearance(raw.appearance);
    return clean;
  } catch { return makeBlend(); }
}
