import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {indexAtlas,relatedPerfumes,regionStatistics,regionHeatmap} from './catalog-atlas-model.mjs';
import {perfumes} from './data.js';

const data=JSON.parse(fs.readFileSync(new URL('./assets/atlas/atlas-data.json',import.meta.url)));
const index=indexAtlas(data,perfumes);
test('published atlas joins every real ID and preserves exact versions',()=>{
 assert.equal(index.byId.size,26335);assert.deepEqual(new Set(index.byId.keys()),new Set(perfumes.map(p=>p.id)));
 const original=new Map(perfumes.map(p=>[p.id,p]));
 for(const r of index.records){assert.equal(r.p,original.get(r.id));assert.ok(r.notes.length);assert.ok(Number.isFinite(r.x+r.y));}
 assert.throws(()=>indexAtlas({...data,rows:[data.rows[0],...data.rows.slice(0,-1)]},perfumes),/重复/);
});
test('ranking agrees with independent cosine calculation and excludes self',()=>{
 const p=[{id:'a'},{id:'b'},{id:'c'}];
 const d={population:3,notes:['柠檬','雪松'],featureNames:['柠檬','雪松'],weights:[1,2],rows:[['a',0,0,-1,[0,1],[0,1,1,1]],['b',0,0,-1,[0],[0,1]],['c',0,0,-1,[1],[1,1]]]};
 const result=relatedPerfumes(indexAtlas(d,p),'a');
 assert.deepEqual(result.map(r=>r.record.id),['c','b']);assert.ok(Math.abs(result[0].score-2/Math.sqrt(5))<1e-12);
 assert.deepEqual(result[0].common,['雪松']);assert.deepEqual(result[0].sourceOnly,['柠檬']);assert.equal(result[0].partial,true);
 assert.deepEqual(relatedPerfumes(indexAtlas(d,p),'a',new Set(['b'])).map(r=>r.record.id),['b']);
});
test('map totals reconcile with filtered records and corrected brands',()=>{
 for(const items of [perfumes,perfumes.filter(p=>p.families.includes('柑橘')),perfumes.filter(p=>p.brand==='MONCLER'),[]]){
  const stats=regionStatistics(items);assert.equal(stats.reduce((s,r)=>s+r.count,0),items.length);
  assert.equal(stats.reduce((s,r)=>s+r.brandCount,0),new Set(items.map(p=>p.brand)).size);
 }
 assert.equal(regionStatistics(perfumes).length,48);
 assert.ok(perfumes.filter(p=>['MONCLER','EVODY'].includes(p.brand)).every(p=>p.region==='法国'));
});
test('heatmap uses the current region denominator and preserves multi-label coverage',()=>{
 const items=[{region:'甲',brand:'A',families:['花香','木质','花香']},{region:'甲',brand:'B',families:['花香']},{region:'乙',brand:'C',families:['木质']}];
 const rows=regionHeatmap(items,['乙','甲']);assert.deepEqual(rows.map(r=>r.region),['乙','甲']);
 const a=rows[1];assert.equal(a.count,2);assert.equal(a.cells.find(c=>c.family==='花香').coverage,1);assert.equal(a.cells.find(c=>c.family==='木质').coverage,.5);
 assert.equal(a.cells.reduce((sum,c)=>sum+c.coverage,0),1.5);assert.equal(a.small,true);
 assert.deepEqual(regionHeatmap(items,['乙','甲'],'count').map(r=>r.region),['甲','乙']);
 assert.equal(regionHeatmap(items.filter(p=>p.brand==='A'),['甲'])[0].cells.find(c=>c.family==='木质').coverage,1);
 assert.deepEqual(regionHeatmap([],[]),[]);
});

test('all heatmap cells independently reconcile and 15 small regions remain represented',()=>{
 const rows=regionHeatmap(perfumes,data.regionOrder);assert.equal(rows.length,48);assert.equal(rows.filter(r=>!r.clustered).length,15);
 for(const r of rows){const items=perfumes.filter(p=>p.region===r.region);assert.equal(r.count,items.length);for(const c of r.cells){assert.equal(c.count,items.filter(p=>p.families.includes(c.family)).length);assert.equal(c.coverage,c.count/items.length);}}
 assert.deepEqual(rows.filter(r=>r.clustered).map(r=>r.region),data.regionOrder);
});

test('qualified notes and their parent do not masquerade as independent shared clues',()=>{
 const d={population:2,notes:['保加利亚玫瑰'],featureNames:['保加利亚玫瑰','玫瑰'],featureParents:{'保加利亚玫瑰':'玫瑰'},weights:[1,1],rows:[['a',0,0,-1,[0],[0,1,1,1]],['b',0,0,-1,[0],[0,1,1,1]]]};
 const result=relatedPerfumes(indexAtlas(d,[{id:'a'},{id:'b'}]),'a')[0];assert.deepEqual(result.common,['保加利亚玫瑰']);assert.deepEqual(result.groupedCommon,[]);assert.equal(result.partial,true);
});
