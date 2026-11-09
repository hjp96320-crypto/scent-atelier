import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {bases,baseById,makeBlend,addDose,isComplete,totalUnits,restoreBlend} from './blend-model.mjs';
import {saveFinishedBlend} from './blend-storage.mjs';

const evidence=JSON.parse(readFileSync(new URL('../research/diy-bases/demeter-72-sources.json',import.meta.url),'utf8'));
const supplierBases=supplier=>bases.filter(base=>base.supplier===supplier);

test('90 distinct selectable bases have complete Chinese display fields and official sources',()=>{
 assert.equal(bases.length,90);
 assert.equal(new Set(bases.map(base=>base.id)).size,90);
 assert.equal(supplierBases('galimard').length,18);
 assert.equal(supplierBases('demeter').length,72);
 for(const base of bases){
  for(const field of ['name','cue','family'])assert.match(base[field],/[\u3400-\u9fff]/,`${base.id}: Chinese ${field}`);
  assert.ok(typeof base.en==='string'&&base.en.trim(),`${base.id}: original name`);
  assert.match(base.color,/^#[0-9a-f]{6}$/i,`${base.id}: liquid color`);
  const url=new URL(base.source);
  assert.equal(url.protocol,'https:');
  assert.equal(url.hostname,base.supplier==='galimard'?'www.galimard.com':'demeterfragrance.com');
  if(base.supplier==='galimard')assert.equal(url.pathname,'/produit/coffret-leleve-parfumeur');
  else assert.match(url.pathname,/^\/products\/[^/]+-cologne-spray$/,`${base.id}: Cologne Spray, not oil or another format`);
 }
});

test('the original six base identities and display data remain backward compatible',()=>{
 const original=[
  ['bergamot','佛手柑','Bergamote','#c9a34b','明亮的柑橘，像剥开果皮的那一刻。','柑橘'],
  ['tea','绿茶','Thé vert','#8e9c64','清透的绿意，给气味留一点呼吸。','绿意'],
  ['wood','木质与零陵香豆','Bois & Tonka','#ad7950','温暖的木质，收在柔和的尾声里。','木质'],
  ['musk','麝香和弦','Accord musc','#b9a595','柔软、贴肤，如刚晒过的衬衫。','麝香'],
  ['peony','牡丹','Pivoine','#bc8990','轻盈的花瓣感，让轮廓柔和一些。','花香'],
  ['yuzu','柚子','Yuzu','#c7b25a','清爽的果皮印象，带一点微苦。','柑橘']
 ];
 for(const expected of original){
  const base=baseById(expected[0]);
  assert.deepEqual(['id','name','en','color','cue','family'].map(field=>base[field]),expected);
  assert.equal(base.supplier,'galimard');
 }
});

test('each Demeter base has a unique matching recorded Cologne Spray product',()=>{
 const demeter=supplierBases('demeter');
 assert.equal(evidence.format,'Cologne Spray');
 assert.equal(evidence.selectedDistinctScents,72);
 assert.equal(evidence.products.length,72);
 assert.equal(new Set(evidence.products.map(product=>product.source)).size,72,'bottle-size variants must not be counted as distinct scents');
 assert.deepEqual(new Set(evidence.products.map(product=>product.id)),new Set(demeter.map(base=>base.id)));
 for(const base of demeter){
  const record=evidence.products.find(product=>product.id===base.id);
  assert.equal(record.productType,'Cologne Spray',base.id);
  assert.equal(record.title,`${base.en} Cologne Spray`,base.id);
  assert.equal(record.name,base.en,base.id);
  assert.equal(record.nameZh,base.name,base.id);
  assert.equal(record.source,base.source,base.id);
 }
});

test('every base can complete a three-base and four-base formula within its own supplier',()=>{
 for(const base of bases){
  const others=supplierBases(base.supplier).filter(other=>other.id!==base.id);
  for(const percentages of [[33.3,33.3,33.4],[25,25,25,25]]){
   const selected=[base,...others.slice(0,percentages.length-1)];
   const blend=makeBlend(30,selected.map((item,index)=>[item.id,percentages[index]]));
   assert.equal(blend.rows.length,percentages.length,base.id);
   assert.equal(blend.rows[0].id,base.id);
   for(const row of blend.rows)addDose(blend,row.id,100000);
   assert.ok(isComplete(blend),base.id);
   assert.equal(totalUnits(blend),3000,`${base.id}: exactly 30 mL`);
  }
 }
});

test('virtual three-base and four-base mixes can combine sources and survive saving',()=>{
 for(const capacity of [10,30,50,100])for(const entries of [
  [['bergamot',33.3],['demeter-earl-grey-tea',33.3],['demeter-sandalwood',33.4]],
  [['demeter-sweet-orange',31.1],['peony',23.4],['demeter-cedar',22.2],['musk',23.3]]
 ]){
  const blend=makeBlend(capacity,entries);
  assert.equal(new Set(blend.rows.map(row=>baseById(row.id).supplier)).size,2);
  assert.equal(blend.rows.reduce((sum,row)=>sum+row.target,0),capacity*100);
  blend.selected=entries[1][0];
  blend.appearance={shape:'round',nozzle:'silver',cap:'gold'};
  addDose(blend,blend.selected,19);
  const restored=restoreBlend(JSON.parse(JSON.stringify(blend)));
  assert.deepEqual(restored,blend,'mixed-source partial drafts must not fall back to the default recipe');
  for(const row of restored.rows)addDose(restored,row.id,100000);
  assert.ok(isComplete(restored));
  assert.equal(totalUnits(restored),capacity*100);
  let serialized='';
  const saved=saveFinishedBlend(restored,[],'自由搭配回归',candidate=>{serialized=JSON.stringify(candidate);return true;});
  const persisted=JSON.parse(serialized);
  assert.deepEqual(restoreBlend(persisted.draft),saved.draft,'completed virtual mixes restore after save');
  assert.equal(persisted.draft.sealed,true);
  assert.deepEqual(persisted.works[0].rows,saved.draft.rows);
  assert.deepEqual(persisted.works[0].appearance,blend.appearance);
  assert.equal(persisted.works[0].capacity,capacity);
 }
});

test('new bases survive partial draft restoration and completed-work save serialization',()=>{
 for(const id of ['orange-blossom','demeter-dark-chocolate']){
  const base=baseById(id),others=supplierBases(base.supplier).filter(other=>other.id!==id).slice(0,3);
  const selected=[base,...others],percentages=[31.1,23.4,22.2,23.3];
  const blend=makeBlend(30,selected.map((item,index)=>[item.id,percentages[index]]));
  blend.selected=id;
  blend.appearance={shape:'oval',nozzle:'silver',cap:'none'};
  addDose(blend,id,127);
  const partial=restoreBlend(JSON.parse(JSON.stringify(blend)));
  assert.deepEqual(partial,blend,`${id}: the new ID must not trigger legacy fallback`);
  assert.equal(partial.rows[0].added,127);
  for(const row of partial.rows)addDose(partial,row.id,100000);
  let serialized='';
  const saved=saveFinishedBlend(partial,[],'新基底保存回归',candidate=>{serialized=JSON.stringify(candidate);return true;});
  const persisted=JSON.parse(serialized),restored=restoreBlend(persisted.draft);
  assert.deepEqual(restored,saved.draft,id);
  assert.equal(restored.sealed,true,id);
  assert.equal(totalUnits(restored),3000,id);
  assert.deepEqual(persisted.works[0].rows,restored.rows,id);
  assert.deepEqual(persisted.works[0].appearance,blend.appearance,id);
  assert.equal(persisted.works[0].capacity,30,id);
  assert.equal(persisted.works[0].name,'新基底保存回归',id);
 }
});
