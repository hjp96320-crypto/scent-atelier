import assert from 'node:assert/strict';
import {tips,rankedTips} from './blend-tips.mjs';
import {baseById,makeBlend,addDose,isComplete,totalUnits} from './blend-model.mjs';

assert.equal(tips.length,24);
assert.equal(new Set(tips.map(t=>t.id)).size,tips.length,'recipe IDs must stay unique');
assert.equal(new Set(tips.map(t=>JSON.stringify([...t.entries].sort()))).size,tips.length,'recipes must not duplicate the same proportions');
for(const supplier of ['galimard','demeter'])assert.equal(tips.filter(t=>t.supplier===supplier).length,12,supplier);
assert.deepEqual(new Set(tips.map(t=>t.category)),new Set(['清新柑橘','茶感绿意','柔和花香','温暖木质','甜香美食']));
for(const tip of tips){
 for(const field of ['title','category','why','scene','adjust'])assert.ok(typeof tip[field]==='string'&&tip[field].trim(),`${tip.id}: missing ${field}`);
 for(const [id] of tip.entries)assert.equal(baseById(id)?.supplier,tip.supplier,`${tip.id}: must use valid bases from its own supplier`);
 for(const capacity of [10,30,50,100]){
  const blend=makeBlend(capacity,tip.entries);
  assert.ok(blend.rows.length>=3&&blend.rows.length<=4,tip.id);
  assert.equal(blend.rows.reduce((sum,row)=>sum+row.percent,0),100,tip.id);
  for(const row of blend.rows)addDose(blend,row.id,row.target);
  assert.equal(totalUnits(blend),capacity*100,`${tip.id}: target volume at ${capacity} mL`);
  assert.ok(isComplete(blend),`${tip.id}: complete at ${capacity} mL`);
 }
}
for(const [id,entries] of [
 ['fresh',[['bergamot',45],['tea',35],['wood',20]]],
 ['floral',[['peony',50],['musk',30],['tea',20]]],
 ['warm',[['wood',50],['musk',30],['bergamot',20]]]
])assert.deepEqual(tips.find(t=>t.id===id)?.entries,entries,'existing trial proportions remain unchanged');
const original=JSON.stringify(tips),rows=makeBlend().rows;
assert.equal(rankedTips(rows).length,3,'workbench keeps a compact recommendation set');
assert.equal(rankedTips(rows)[0].id,'fresh','matching existing bases is ranked first');
assert.equal(rankedTips(rows,tips.length).length,24,'the full unified library remains available for any selection');
assert.deepEqual(new Set(rankedTips(rows,tips.length).map(t=>t.id)),new Set(tips.map(t=>t.id)));
const demeterRows=makeBlend(10,tips.find(t=>t.id==='demeter-citrus-spark').entries).rows;
assert.equal(rankedTips(demeterRows)[0].id,'demeter-citrus-spark');
assert.equal(rankedTips(demeterRows,tips.length).length,24);
const mixedRows=makeBlend(10,[['bergamot',40],['demeter-earl-grey-tea',35],['demeter-black-tea',25]]).rows;
assert.equal(rankedTips(mixedRows)[0].id,'demeter-earl-grey','two shared scents outrank one even when the first selected scent comes from another source');
assert.equal(rankedTips(mixedRows,tips.length).length,24,'mixed-source selection does not hide any suggestion');
assert.equal(rankedTips([],tips.length).length,tips.length,'empty selection can browse both suppliers');
assert.equal(JSON.stringify(tips),original,'ranking must not reorder or mutate the library');
console.log(`PASS: ${tips.length} trial recipes, five categories, unified scent-overlap ranking, all supported volumes, compatible original recipes`);
