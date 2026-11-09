import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {perfumes} from './data.js';
import {indexAtlas} from './catalog-atlas-model.mjs';
import {isGroupMember,groupClues,localRecords,groupCamera} from './catalog-atlas-groups.mjs';
const raw=fs.readFileSync(new URL('./assets/atlas/atlas-data.json',import.meta.url)),index=indexAtlas(JSON.parse(raw),perfumes);
const local=JSON.parse(fs.readFileSync(new URL('./assets/atlas/local-groups.json',import.meta.url)));
test('pear selection excludes screenshot background perfume and uses full member list',()=>{
 assert.equal(isGroupMember(index.byId.get('hf-full-11856'),15),false);
 const members=index.records.filter(r=>isGroupMember(r,15));assert.equal(members.length,190);
 const clues=groupClues(index,index.data.clusters.find(g=>g.id===15),members);
 assert.equal(clues.find(c=>c.label==='梨').count,190);assert.equal(clues.find(c=>c.label==='茉莉').count,113);
});
test('all published groups preserve global coordinates and every member; gates control availability',()=>{
 assert.equal(crypto.createHash('sha256').update(raw).digest('hex'),local.globalHash);
 assert.equal(local.groups.length,index.data.clusters.length);
 assert.deepEqual(new Set(local.groups.map(g=>g.id)),new Set(index.data.clusters.map(g=>g.id)));
 const before=index.records.map(r=>[r.id,r.x,r.y]);
 for(const group of local.groups){
  const records=localRecords(index.records,group);assert.equal(records.length,group.count);
  assert.deepEqual(new Set(records.map(r=>r.id)),new Set(index.records.filter(r=>r.cluster===group.id).map(r=>r.id)));
  assert.ok(records.every(r=>Number.isFinite(r.x)&&Number.isFinite(r.y)));
  assert.equal(new Set(group.subgroups.map(s=>s.label)).size,group.subgroups.length);
  const seen=new Set();for(const subgroup of group.subgroups){assert.ok(subgroup.seedJaccard>=.75);assert.ok(subgroup.ids.length>=15);for(const id of subgroup.ids){assert.ok(!seen.has(id));seen.add(id);assert.ok(records.some(r=>r.id===id));}}
  assert.equal(group.available,group.metrics.localSeeds.every(m=>m.trustworthiness15>=.8&&m.neighborCosine15>=group.metrics.global.neighborCosine15));
  if(group.subgroups.length)assert.ok(group.metrics.originalSilhouette>=.1);
 }
 assert.deepEqual(index.records.map(r=>[r.id,r.x,r.y]),before);
 assert.equal(local.groups.find(g=>g.id===15).subgroups.length,0);
 assert.equal(local.groups.find(g=>g.id===19).subgroups.length,2);
 assert.equal(local.groups.find(g=>g.id===4).available,false);
});
test('group and local drilldown restore entry camera, resets discard old context',()=>{
 const records=[{id:'a'}],base={mode:'star',records,group:null,localView:null,resetKey:1},entry={target:[40,60],zoom:1.2},overview={target:[0,0],zoom:0},focus={target:[1,1],zoom:2};
 const group={...base,group:15};const a=groupCamera(base,group,entry,null,overview,focus);assert.equal(a.saved,entry);
 const inside={...group,localView:{id:15}};const b=groupCamera(group,inside,focus,a.saved,overview,{target:[3,4],zoom:1});assert.equal(b.saved,entry);
 const c=groupCamera(inside,base,b.camera,b.saved,overview,overview);assert.equal(c.camera,entry);assert.equal(c.saved,null);
 assert.equal(groupCamera(inside,{...base,resetKey:2},b.camera,b.saved,overview,overview).camera,overview);
});
