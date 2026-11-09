import fs from 'node:fs';
import assert from 'node:assert/strict';
import {perfumes} from '../prototype/data.js';
import {canonicalConcentration,namedConcentration,concentrationGroup} from '../prototype/catalog-concentration.mjs';
const root=new URL('../',import.meta.url),read=path=>JSON.parse(fs.readFileSync(new URL(path,root),'utf8'));
const evidence=read('research/catalog-pyramids-discovery/bulk-dry-run/approved-evidence.json');
const output={},conflicts=[];
for(const e of evidence){
 const p=perfumes.find(p=>p.sourceRowIndex===e.sourceRowIndex),value=canonicalConcentration(e.candidateSource.Concentration);
 if(!p||!value)continue;
 const known=canonicalConcentration(p.concentration)||namedConcentration(p.name);
 if(known&&known!==value){conflicts.push({id:p.id,existing:known,candidate:value,sourceUrl:e.candidateSource.URL});continue;}
 // Unknown records need the previous all-version uniqueness and strong-note checks.
 if(!known&&e.reason!=='unique-name-year-strong-notes-proposal')continue;
 assert.ok(e.candidateSource.URL.startsWith('https://'));
 output[p.id]={concentration:value,sourceUrl:e.candidateSource.URL};
}
const groups=new Map(),unknown=[];let explicitNames=0;
for(const p of perfumes){
 const named=namedConcentration(p.name),value=canonicalConcentration(p.concentration)||named||output[p.id]?.concentration||p.concentration;
 if(named)explicitNames++;
 const stem=p.name.replace(/\b(?:Extrait de Parfum|Eau de Parfum(?: Intense| Légère| Absolue)?|Eau de Toilette(?: Intense)?|Eau de Cologne|Pure Parfum|Parfum|Cologne Intense|Cologne|Elixir)\s*$/i,'').trim().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 const key=p.brand+'|'+stem;
 if(!groups.has(key))groups.set(key,[]);
 groups.get(key).push({id:p.id,name:p.name,concentration:value,category:concentrationGroup(value)});
 if(concentrationGroup(value)==='unknown')unknown.push({id:p.id,brand:p.brand,name:p.name});
}
const versions=[...groups].filter(([,items])=>new Set(items.filter(p=>p.category!=='unknown').map(p=>p.concentration)).size>1).map(([key,items])=>({key,items}));
fs.writeFileSync(new URL('prototype/catalog-concentration-data.mjs',root),'// Generated from identity-checked source evidence; no percentages inferred.\nexport const concentrationEvidence = '+JSON.stringify(output)+';\n');
fs.mkdirSync(new URL('research/catalog-concentrations/',root),{recursive:true});
fs.writeFileSync(new URL('research/catalog-concentrations/audit.json',root),JSON.stringify({checkedAt:new Date().toISOString(),total:perfumes.length,explicitNames,sourceEvidence:Object.keys(output).length,unknownCount:unknown.length,multipleVersionGroups:versions.length,conflicts,versions,unknown},null,2));
console.log(JSON.stringify({total:perfumes.length,explicitNames,sourceEvidence:Object.keys(output).length,unknown:unknown.length,multipleVersionGroups:versions.length,conflicts:conflicts.length}));
