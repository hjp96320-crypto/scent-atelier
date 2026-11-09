import test from 'node:test';
import assert from 'node:assert/strict';
import {makeBlend,addDose,totalUnits,isComplete} from './blend-model.mjs';
import {equalEntries,prepareEntries,sameRecipe} from './atelier-selection.mjs';

const three=['bergamot','tea','wood'];
const four=[...three,'musk'];

test('equal shares use exact tenths and preserve selection order',()=>{
 assert.deepEqual(equalEntries(three),[['bergamot',33.3],['tea',33.3],['wood',33.4]]);
 assert.deepEqual(equalEntries(four),four.map(id=>[id,25]));
 assert.deepEqual(three,['bergamot','tea','wood']);
});

test('selection requires three or four unique known bases',()=>{
 for(const ids of [[],['bergamot'],['bergamot','tea'],[...four,'peony'],['bergamot','tea','tea'],['bergamot','tea','unknown']]){
  assert.throws(()=>equalEntries(ids),/3–4 款不同且有效/);
  assert.throws(()=>prepareEntries(ids,[]),/3–4 款不同且有效/);
 }
});

test('returning to selection or reordering keeps manual ratios, including unfinished edits',()=>{
 const manual=[['bergamot',45],['tea',35],['wood',20]],before=structuredClone(manual);
 assert.deepEqual(prepareEntries(three,manual),manual);
 const reordered=prepareEntries(['wood','bergamot','tea'],manual);
 assert.deepEqual(reordered,[['wood',20],['bergamot',45],['tea',35]]);
 reordered[0][1]=99;
 assert.deepEqual(manual,before);
 const unfinished=[['bergamot',0],['tea',35],['wood',20]];
 assert.deepEqual(prepareEntries(three,unfinished),unfinished);
 assert.throws(()=>makeBlend(10,prepareEntries(three,unfinished)),/合计为 100/);
});

test('changing the selected set or count creates equal shares without mutating inputs',()=>{
 const manual=[['bergamot',45],['tea',35],['wood',20]],before=structuredClone(manual);
 const changed=['bergamot','tea','demeter-rain'];
 assert.deepEqual(prepareEntries(changed,manual),equalEntries(changed));
 assert.deepEqual(prepareEntries(four,manual),equalEntries(four));
 assert.deepEqual(prepareEntries(three,[]),equalEntries(three));
 assert.deepEqual(manual,before);
 assert.deepEqual(changed,['bergamot','tea','demeter-rain']);
});

test('sameRecipe ignores row order and progress but compares capacity and ratios',()=>{
 const entries=[['bergamot',45],['tea',35],['wood',20]],blend=makeBlend(10,entries);
 assert.equal(sameRecipe(10,[...entries].reverse(),blend),true);
 addDose(blend,'bergamot',100);
 blend.sealed=true;
 assert.equal(sameRecipe(10,entries,blend),true);
 assert.equal(sameRecipe(30,entries,blend),false);
 assert.equal(sameRecipe(10,[['bergamot',40],['tea',35],['wood',25]],blend),false);
 assert.equal(sameRecipe(10,[['bergamot',45],['tea',35],['musk',20]],blend),false);
 assert.equal(sameRecipe(10,[['bergamot',45],['tea',35],['tea',20]],blend),false);
 assert.equal(sameRecipe(10,entries,null),false);
});

test('equal selection shares create exact dose totals at every supported capacity',()=>{
 for(const capacity of [10,30,50,100])for(const ids of [three,four,['bergamot','tea','demeter-rain']]){
  const blend=makeBlend(capacity,equalEntries(ids));
  assert.equal(blend.rows.reduce((sum,row)=>sum+row.target,0),capacity*100);
  blend.rows.forEach(row=>addDose(blend,row.id,row.target));
  assert.equal(totalUnits(blend),capacity*100);
  assert.equal(isComplete(blend),true);
 }
});
