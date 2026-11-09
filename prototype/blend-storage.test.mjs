import test from 'node:test';
import assert from 'node:assert/strict';
import {makeBlend,addDose} from './blend-model.mjs';
import {saveFinishedBlend} from './blend-storage.mjs';

function finished(){const blend=makeBlend();blend.rows.forEach(row=>addDose(blend,row.id,row.target));blend.appearance={shape:'oval',nozzle:'silver',cap:'gold'};return blend;}

test('saving a complete blend preserves the original and persists its recipe and packaging',()=>{
 const blend=finished(),original=structuredClone(blend),works=[{id:'existing',name:'已有作品',rows:[]}];
 let persisted;
 const result=saveFinishedBlend(blend,works,'  雨后茶香  ',candidate=>{persisted=JSON.parse(JSON.stringify(candidate));});
 assert.deepEqual(result,persisted);
 assert.equal(result.draft.name,'雨后茶香');
 assert.equal(result.draft.sealed,true);
 assert.equal(result.works.length,2);
 assert.equal(result.works[0].name,'雨后茶香');
 assert.equal(result.works[0].capacity,10);
 assert.deepEqual(result.works[0].rows,blend.rows);
 assert.deepEqual(result.works[0].appearance,blend.appearance);
 assert.ok(result.works[0].id);
 assert.ok(Number.isFinite(Date.parse(result.works[0].date)));
 assert.deepEqual(blend,original);
 assert.deepEqual(works,[{id:'existing',name:'已有作品',rows:[]}]);
 assert.notEqual(result.works[0].rows,result.draft.rows);
 assert.notEqual(result.works[1],works[0]);
});

test('incomplete, unnamed, overlong, and already sealed drafts cannot be submitted',()=>{
 const persist=()=>assert.fail('invalid drafts must not reach storage');
 assert.throws(()=>saveFinishedBlend(makeBlend(),[],'未完成',persist),/完成所有基底/);
 assert.throws(()=>saveFinishedBlend(finished(),[],'   ',persist),/取一个名字/);
 assert.throws(()=>saveFinishedBlend(finished(),[],'香'.repeat(25),persist),/最多 24/);
 const saved=saveFinishedBlend(finished(),[],'完成作品',()=>{});
 assert.throws(()=>saveFinishedBlend(saved.draft,saved.works,'重复保存',persist),/已经保存/);
});

test('a failed storage write leaves the original draft and collection available for retry',()=>{
 const blend=finished(),works=[{id:'existing',name:'已有作品',rows:[{added:20}]}],before=structuredClone({blend,works});
 assert.throws(()=>saveFinishedBlend(blend,works,'重试作品',candidate=>{
  candidate.draft.rows[0].added=0;
  candidate.works[1].rows[0].added=0;
  throw new Error('QuotaExceededError');
 }),/QuotaExceededError/);
 assert.deepEqual({blend,works},before);
 assert.throws(()=>saveFinishedBlend(blend,works,'重试作品',()=>false),/未能保存/);
 assert.deepEqual({blend,works},before);
 const retry=saveFinishedBlend(blend,works,'重试作品',()=>{});
 assert.equal(retry.draft.sealed,true);
 assert.equal(retry.works.length,2);
});

test('a missing randomUUID API uses a local identifier without preventing saving',()=>{
 const original=Object.getOwnPropertyDescriptor(globalThis,'crypto');
 try{
  Object.defineProperty(globalThis,'crypto',{value:{},configurable:true});
  const result=saveFinishedBlend(finished(),[],'兼容保存',()=>{});
  assert.match(result.works[0].id,/^local-/);
  assert.equal(result.draft.sealed,true);
  assert.equal(result.works.length,1);
 }finally{
  if(original)Object.defineProperty(globalThis,'crypto',original);
  else delete globalThis.crypto;
 }
});
