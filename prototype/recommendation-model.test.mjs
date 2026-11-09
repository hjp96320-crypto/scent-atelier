import test from 'node:test';
import assert from 'node:assert/strict';
import {perfumes} from './data.js';
import {recommendationCatalog as catalog,recommendationRelease as release} from './recommendation-data.mjs';
import {releaseCandidates,recommendPerfume,rememberRecommendation} from './recommendation-model.mjs';
const date=new Date(2026,10,9,12),options={date};
test('release covers all 100 exact reviewed versions and all 12 contexts',()=>{
 assert.equal(catalog.entries.length,100);assert.equal(new Set(catalog.entries.map(e=>e.id)).size,100);
 assert.deepEqual(new Set(catalog.entries.map(e=>e.id)),new Set(perfumes.filter(p=>p.reviewedProfile).map(p=>p.id)));
 for(const w of ['晴朗','炎热','下雨','微凉'])for(const o of ['日常出门','办公室','晚间约会']){
  const entries=releaseCandidates(perfumes,w,o,options);assert.ok(entries.length>=4);
  for(const {entry,perfume} of entries){assert.equal(entry.concentration,perfume.concentration);assert.ok(entry.facts.sourceUrl.startsWith('https://'));assert.ok(entry.editorial.consideration);}
 }
});
test('paused, invalid versions, mismatched facts and expired releases never become evidence-backed picks',()=>{
 const item=releaseCandidates(perfumes,'晴朗','日常出门',options)[0],id=item.perfume.id;
 for(const mutate of [e=>e.status='paused',e=>e.concentration='wrong',e=>e.version++,e=>e.facts.sourceUrl='',e=>e.reviewDue='2026-01-01',e=>e.facts.notes=['wrong']]){
  const copy=structuredClone(catalog);mutate(copy.entries.find(e=>e.id===id));
  assert.ok(!releaseCandidates(perfumes,'晴朗','日常出门',{date,catalog:copy}).some(e=>e.perfume.id===id));
 }
 for(const day of [new Date(2026,10,8),new Date(2026,10,16)])assert.equal(recommendPerfume(perfumes,[],'晴朗','日常出门',{date:day}),null);
});
test('same-day context persists, manual and next-day choices change and avoid last brand',()=>{
 const first=recommendPerfume(perfumes,[],'晴朗','日常出门',options),history=[first.record];
 assert.equal(recommendPerfume(perfumes,[],'晴朗','日常出门',{date,history}).perfume.id,first.perfume.id);
 const second=recommendPerfume(perfumes,[],'晴朗','日常出门',{date,history,manual:true});
 assert.notEqual(second.perfume.id,first.perfume.id);assert.notEqual(second.perfume.brand,first.perfume.brand);
 const next=recommendPerfume(perfumes,[],'晴朗','日常出门',{date:new Date(2026,10,10),history});assert.notEqual(next.perfume.id,first.perfume.id);
 assert.equal(rememberRecommendation(history,first.record),history);
 assert.equal(rememberRecommendation(Array(300).fill(first.record),second.record).length,300);
});
test('cabinet priority respects exact reviewed context; other cabinet choices are exploration only',()=>{
 const eligible=releaseCandidates(perfumes,'晴朗','办公室',options)[0].perfume;
 assert.equal(recommendPerfume(perfumes,[eligible.id],'晴朗','办公室',options).perfume.id,eligible.id);
 const unknown=perfumes.find(p=>!p.reviewedProfile);
 const pick=recommendPerfume(perfumes,[unknown.id],'晴朗','办公室',options);assert.ok(pick.exploration);assert.equal(pick.entry,null);assert.equal(pick.record.releaseVersion,null);
 const noFit=recommendPerfume(perfumes,['hf-7014'],'炎热','办公室',options);assert.ok(noFit.exploration);
});
