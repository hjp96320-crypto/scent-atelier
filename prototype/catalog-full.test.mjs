import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {perfumes,curatedPerfumes,brandNames} from './data.js';
import rows from './catalog-full-rows.js';
import {catalogPage,filterCatalog,catalogSearchText} from './catalog-model.mjs';
assert.equal(rows.length,26319);
assert.equal(perfumes.filter(p=>!p.image).length,0);
assert.equal(filterCatalog(perfumes,{image:'available'}).length,26335);
assert.equal(new Set(perfumes.map(p=>p.id)).size,perfumes.length);
assert.equal(new Set(perfumes.filter(p=>p.sourceRowIndex!==undefined).map(p=>p.sourceRowIndex)).size,26319,'every source row has a destination');
assert.equal(perfumes.filter(p=>p.reviewStatus!=='dataset-imported').length,135);
for(const p of perfumes){if(p.image)assert.ok(existsSync(new URL(p.image,import.meta.url)),p.id);else assert.equal(p.reviewStatus,'dataset-imported');assert.ok(p.region&&p.families.length);}
for(const p of curatedPerfumes){const loaded=perfumes.find(x=>x.id===p.id);assert.equal(loaded.image,p.image);assert.equal(loaded.description,p.description);}
const texts=perfumes.map(p=>catalogSearchText(p,brandNames));
const selected=perfumes.find(p=>p.reviewStatus==='dataset-imported'&&p.region!=='未提供');
const combined=filterCatalog(perfumes,{brand:selected.brand,region:selected.region,family:selected.families[0],review:'imported'},texts);
assert.ok(combined.some(p=>p.id===selected.id));assert.ok(combined.every(p=>p.brand===selected.brand&&p.region===selected.region&&p.families.includes(selected.families[0])));
assert.ok(filterCatalog(perfumes,{query:'香奈儿'},texts).length>0);
assert.equal(filterCatalog(perfumes,{query:'__nonexistent__'},texts).length,0);
assert.equal(catalogPage([],99).page,1);assert.equal(catalogPage(perfumes,1).items.length,24);
const last=catalogPage(perfumes,999999);assert.equal(last.page,last.pages);assert.ok(last.items.length<=24&&last.items.length>0);
assert.equal(filterCatalog(perfumes,{region:'未提供'},texts).length,0);
assert.equal(new Set(perfumes.flatMap(p=>p.families)).size,15);
for(const p of perfumes){assert.ok(p.notes.length);assert.equal(new Set(p.families).size,p.families.length);}
const repaired=perfumes.filter(p=>p.reviewStatus==='source-checked');
assert.equal(repaired.length,35);
for(const p of repaired){assert.match(p.image,/^assets\/enriched\//);assert.ok(p.imageOriginalUrl&&p.sourceUrl&&p.verifiedAt);assert.notEqual(p.concentration,'浓度未单独标注');}
const byRow=i=>perfumes.find(p=>p.sourceRowIndex===i);
assert.equal(byRow(4865).concentration,'Eau de Toilette','Cologne in a name is not a concentration');
assert.equal(byRow(10744).concentration,'Parfum','Sauvage Parfum must not inherit the EDP image');
assert.notEqual(byRow(10744).image,byRow(23174).image);
assert.equal(byRow(21678).concentration,'Eau de Toilette','historical Cherry Blossom must not become a body mist');
assert.equal(byRow(500).name,'Rose Extase');assert.equal(byRow(4791).name,'Some Velvet Morning');
assert.ok(filterCatalog(perfumes,{query:"L'Extase Rose"},texts).some(p=>p.sourceRowIndex===500),'corrected names retain their source alias');
assert.ok(perfumes.filter(p=>p.brand==='BENCH.').every(p=>p.region==='英国'));
assert.ok(perfumes.filter(p=>p.brand==='REPHASE').every(p=>p.region==='圣马力诺'));
assert.ok(perfumes.filter(p=>p.brand==='RICHOULI').every(p=>p.region==='奥地利'));
assert.ok(perfumes.some(p=>p.regionEvidence?.method==='same-brand-source-consensus'));
assert.equal(filterCatalog(perfumes,{review:'reviewed',image:'available',region:'法国',family:'花香'},texts).every(p=>p.families.includes('花香')&&p.region==='法国'&&p.image&&p.reviewStatus!=='dataset-imported'),true);
console.log(JSON.stringify({status:'PASS',sourceRows:rows.length,catalogEntries:perfumes.length,brandLabels:new Set(perfumes.map(p=>p.brand)).size,regions:new Set(perfumes.map(p=>p.region)).size,families:new Set(perfumes.flatMap(p=>p.families)).size,pages:last.pages}));
