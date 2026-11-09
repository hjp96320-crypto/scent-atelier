import {imageCorrections,brandRegions} from './catalog-enrichment-data.js';
import {regionCorrections} from './catalog-region-corrections.mjs';
const FAMILY_LABELS=['花香','木质','琥珀','馥奇','柑橘','西普','皮革','果香','绿叶','麝香','水生','美食','辛香','醛香','烟草'];
function normalizeFamilies(values){
 return [...new Set(values.flatMap(value=>{
  if(FAMILY_LABELS.includes(value))return [value];
  const normalized=value.replaceAll('绿意','绿叶').replaceAll('芳香','馥奇');
  return FAMILY_LABELS.filter(family=>normalized.includes(family));
 }))];
}
export function enrichCatalog(items){
 return items.map(item=>{
  const correction=imageCorrections[item.sourceRowIndex];
  const p={...item,...correction};
  if(correction)p.originalName=item.name;
  const rule=brandRegions[p.brand];
  p.originalRegion=item.region;
  if(rule&&(item.region==='未提供'||rule.method==='external-source-checked')){
   p.region=rule.region;p.regionEvidence=rule;
  }
  if(regionCorrections[p.brand])p.region=regionCorrections[p.brand];
  p.families=normalizeFamilies(p.families);
  p.family=p.families.join(' · ');
  p.notes=[...new Set(p.notes.map(note=>note.trim()).filter(Boolean))];
  return p;
 });
}
