import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {perfumes} from './data.js';
import {indexAtlas} from './catalog-atlas-model.mjs';
import {applyAtlasScope,cameraTransition,clusterRegions,clusterFocusRecords} from './catalog-atlas-exploration.mjs';

test('neighbour highlight and its removal preserve all 26,335 background records',()=>{
 const focus={kind:'anchor',anchor:perfumes[0].id,ids:new Set(perfumes.slice(0,49).map(p=>p.id))};
 assert.equal(applyAtlasScope(perfumes,focus),perfumes);
 assert.equal(applyAtlasScope(perfumes,null),perfumes);
 const filtered=perfumes.filter(p=>p.region==='法国');assert.equal(applyAtlasScope(filtered,focus),filtered);
 assert.equal(applyAtlasScope(perfumes,{ids:focus.ids,cluster:1}).length,49);
});
test('enter, pan and zoom, then remove highlight restores the exact entry camera',()=>{
 const records=[{id:'a'},{id:'b'}],overview={target:[500,500],zoom:-1},entry={target:[250,330],zoom:1.2};
 const before={mode:'star',records,resetKey:0},focus={...before,anchor:'a'};
 const entered=cameraTransition(before,focus,entry,null,overview);assert.equal(entered.camera,entry);
 const panned={target:[10,900],zoom:3};
 const exited=cameraTransition(focus,{...before,records:[...records]},panned,entered.focusCamera,overview);
 assert.equal(exited.camera,entry);assert.equal(exited.focusCamera,null);
 assert.equal(cameraTransition(focus,{...before,resetKey:1},panned,entry,overview).camera,overview);
 assert.equal(cameraTransition(focus,{...before,records:[{id:'c'}]},panned,entry,overview).camera,overview);
});
test('cluster labels come from the 33 validated groups without changing original coordinates',()=>{
 const data=JSON.parse(fs.readFileSync(new URL('./assets/atlas/atlas-data.json',import.meta.url))),index=indexAtlas(data,perfumes),snapshot=index.records.map(r=>[r.id,r.x,r.y]);
 const groups=clusterRegions(index);assert.equal(groups.length,33);assert.equal(groups.reduce((s,g)=>s+g.data.length,0),8501);
 for(const g of groups){assert.equal(g.data.length,g.count);assert.ok(g.data.every(r=>r.cluster===g.id));assert.ok(g.data.some(r=>r.x===g.x&&r.y===g.y));assert.equal(g.label,data.clusters.find(c=>c.id===g.id).label);}
 assert.equal(index.records.filter(r=>r.cluster<0).length,17834);assert.deepEqual(index.records.map(r=>[r.id,r.x,r.y]),snapshot);
 const filtered=index.records.filter(r=>r.p.region==='法国'),subset=clusterRegions(index,filtered);
 for(const g of subset){assert.ok(g.data.every(r=>r.p.region==='法国'));assert.ok(g.data.some(r=>r.x===g.x&&r.y===g.y));}
 assert.deepEqual(clusterRegions(index,[]),[]);
});

test('group camera excludes distant tails without dropping or moving any catalog members',()=>{
 const data=JSON.parse(fs.readFileSync(new URL('./assets/atlas/atlas-data.json',import.meta.url))),index=indexAtlas(data,perfumes);
 const members=index.records.filter(r=>r.cluster===19),snapshot=members.map(r=>[r.id,r.x,r.y]);
 const focus=clusterFocusRecords(members);
 assert.equal(members.length,501);assert.ok(focus.length>=members.length*.8);
 assert.ok(Math.max(...focus.map(r=>r.x))-Math.min(...focus.map(r=>r.x))<600);
 assert.ok(Math.max(...focus.map(r=>r.y))-Math.min(...focus.map(r=>r.y))<600);
 assert.ok(focus.every(r=>members.includes(r)));assert.deepEqual(members.map(r=>[r.id,r.x,r.y]),snapshot);
 for(const group of clusterRegions(index))assert.ok(clusterFocusRecords(group.data).length>0);
 const small=members.slice(0,3);assert.equal(clusterFocusRecords(small),small);assert.deepEqual(clusterFocusRecords([]),[]);
});
