import test from 'node:test';
import assert from 'node:assert/strict';
import {perfumes} from './data.js';
import {versionGroups,compareVersions} from './catalog-versions.mjs';

test('every comparison uses explicit distinct reviewed editions, with the original identities and evidence',()=>{
 const ids=versionGroups.flatMap(g=>g.ids);assert.equal(ids.length,new Set(ids).size);assert.equal(ids.length,36);
 for(const group of versionGroups){const comparison=compareVersions(perfumes,group.ids[0]);assert.deepEqual(comparison.items.map(v=>v.p.id),group.ids);assert.equal(new Set(comparison.items.map(v=>v.p.brand)).size,1);
  for(const {p,distinct} of comparison.items){assert.equal(p,perfumes.find(item=>item.id===p.id));assert.ok(p.reviewedProfile.sourceUrl);assert.notEqual(p.concentrationKey,'unknown');assert.equal(p.reviewedProfile.stages.length,3);assert.ok(p.reviewedProfile.wear.occasions.length);assert.deepEqual(new Set([...distinct,...comparison.common]),new Set(p.reviewedProfile.notes));}
 }
 const sauvage=compareVersions(perfumes,'dior-sauvage-edt');assert.deepEqual(sauvage.items.map(v=>v.p.concentrationKey),['edt','edp','parfum','other']);
});

test('comparison never guesses a group from similar names or unknown concentration',()=>{
 assert.equal(compareVersions(perfumes,'hf-3123'),null);
 assert.equal(compareVersions([...perfumes,{id:'copy',name:'Sauvage',brand:'DIOR',concentrationKey:'edp'}],'copy'),null);
 const reduced=perfumes.map(p=>p.id==='hf-full-4304'?{...p,concentrationKey:'unknown'}:p);assert.equal(compareVersions(reduced,'hf-2581'),null);
});
