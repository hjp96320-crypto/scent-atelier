import test from 'node:test';
import assert from 'node:assert/strict';
import {bases,makeBlend} from './blend-model.mjs';
import {pairingGuidance,blendScenes} from './blend-guidance.mjs';

test('all 90 bases receive contextual, readable pairing guidance without changing the recipe',()=>{
 assert.equal(bases.length,90);
 for(const base of bases){const others=bases.filter(b=>b.id!==base.id).slice(0,2),entries=[[base.id,40],...others.map(b=>[b.id,30])],before=JSON.stringify(entries),g=pairingGuidance(entries);
  assert.ok(g.pair.title.length>4);assert.ok(g.pair.why.length>20);assert.ok(g.scene.length>20);assert.equal(JSON.stringify(entries),before);
  if(g.adjustment){makeBlend(10,g.adjustment.entries);assert.equal(g.adjustment.changes.length,2);assert.equal(g.adjustment.entries.reduce((sum,[,p])=>sum+p,0),100);}
 }
});
test('adjustment moves exactly five percentage points, preserving all other rows and valid doses',()=>{
 const rows=[['bergamot',40],['tea',35],['wood',25]];
 for(const capacity of [10,30,50,100]){const g=pairingGuidance(rows,capacity);assert.deepEqual(g.adjustment.entries,[['bergamot',45],['tea',35],['wood',20]]);makeBlend(capacity,g.adjustment.entries);}
 assert.equal(pairingGuidance([['bergamot',60],['tea',35],['wood',5]]).adjustment,null,'insufficient donor is not changed');
 assert.equal(pairingGuidance([['bergamot',60],['tea',35],['wood',25]]).adjustment,null,'invalid total must not offer adjustment');
 assert.equal(pairingGuidance([['peony',40],['demeter-jasmine',30],['demeter-orange-blossom',30]]).adjustment,null,'no suitable pair is not forced');
 const edge=pairingGuidance([['bergamot',94.8],['tea',0.1],['wood',5.1]]);makeBlend(10,edge.adjustment.entries);assert.equal(edge.adjustment.entries[2][1],0.1);
});
test('scene changes advice, not proportions; mixed supplier bases are supported',()=>{
 const rows=[['bergamot',40],['demeter-earl-grey-tea',35],['wood',25]],texts=new Set();
 for(const scene of Object.keys(blendScenes)){const g=pairingGuidance(rows,10,scene);texts.add(g.scene);assert.match(g.pair.why,/茶杯/);assert.deepEqual(g.adjustment.entries,[['bergamot',45],['demeter-earl-grey-tea',35],['wood',20]]);}
 assert.equal(texts.size,4);
});
