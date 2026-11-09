import assert from 'node:assert/strict';
import {makeBlend,addDose,totalUnits,isComplete,restoreBlend} from './blend-model.mjs';
for(const capacity of [10,30,50,100]) {
  const b=makeBlend(capacity,[['bergamot',33.3],['tea',33.3],['wood',33.4]]);
  assert.equal(b.rows.reduce((s,r)=>s+r.target,0),capacity*100);
  b.rows.forEach(r=>addDose(b,r.id,1e6));
  assert.equal(totalUnits(b),capacity*100);
  assert.ok(isComplete(b));
  assert.equal(addDose(b,'bergamot',10),0);
}
const b=makeBlend();
addDose(b,'bergamot',128);
assert.equal(b.rows[0].added,128);
assert.equal(b.rows[1].added,0);
addDose(b,'bergamot',-100);
assert.equal(b.rows[0].added,128);
const restored=restoreBlend({...b,sealed:true});
assert.equal(restored.sealed,false);
assert.equal(restored.rows[0].added,128);
assert.throws(()=>makeBlend(10,[['bergamot',50],['tea',40],['wood',20]]));
assert.throws(()=>makeBlend(10,[['bergamot',50],['bergamot',25],['wood',25]]));
assert.throws(()=>makeBlend(10,[['bergamot',33.333],['tea',33.333],['wood',33.334]]));
assert.deepEqual(restoreBlend({rows:null}),makeBlend());
console.log('PASS: dose limits, exact totals, validation, draft restoration, sealed-state guard');

const custom=makeBlend();
custom.appearance={shape:'oval',nozzle:'silver',cap:'none'};
addDose(custom,'bergamot',123);
assert.deepEqual(restoreBlend(JSON.parse(JSON.stringify(custom))),custom);
assert.deepEqual(restoreBlend({...custom,appearance:{shape:'unknown',nozzle:'silver',cap:null}}).appearance,{shape:'square',nozzle:'silver',cap:'silver'});
console.log('PASS: packaging and partial-dose persistence; legacy/invalid packaging defaults');
