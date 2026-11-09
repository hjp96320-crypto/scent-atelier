import {baseById} from './blend-model.mjs?v=20261108-selection-flow';

function validateIds(ids){
 if(!Array.isArray(ids)||ids.length<3||ids.length>4||new Set(ids).size!==ids.length||ids.some(id=>!baseById(id)))throw new Error('请选择 3–4 款不同且有效的基底。');
}

export function equalEntries(ids){
 validateIds(ids);
 const share=Math.floor(1000/ids.length);
 return ids.map((id,index)=>[id,(index===ids.length-1?1000-share*(ids.length-1):share)/10]);
}

export function prepareEntries(ids,entries){
 validateIds(ids);
 const ratios=new Map(entries);
 if(entries.length===ids.length&&ratios.size===ids.length&&ids.every(id=>ratios.has(id)))return ids.map(id=>[id,ratios.get(id)]);
 return equalEntries(ids);
}

export function sameRecipe(capacity,entries,blend){
 if(!blend||capacity!==blend.capacity||entries.length!==blend.rows.length)return false;
 const ratios=new Map(entries);
 return ratios.size===entries.length&&blend.rows.every(row=>ratios.has(row.id)&&ratios.get(row.id)===row.percent);
}
