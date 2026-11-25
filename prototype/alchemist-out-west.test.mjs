import test from 'node:test';
import assert from 'node:assert/strict';
import {alchemistPerfumes,alchemistProfiles,isAlchemistOfficialImage} from './alchemist-out-west.mjs';
import {perfumes,curatedPerfumes,brandNames} from './data.js';
import rows from './catalog-full-rows.js';
import {filterCatalog,catalogSearchText} from './catalog-model.mjs';
import {compareVersions} from './catalog-versions.mjs';
import {canonicalConcentration} from './catalog-concentration.mjs';
import {explainEvolution} from './catalog-presentation.mjs';

test('four exact official versions enter the live catalog without modifying prior identities',()=>{
 const ids=alchemistPerfumes.map(p=>p.id),items=perfumes.filter(p=>p.brand==='ALCHEMIST');
 assert.equal(curatedPerfumes.length,104);assert.equal(new Set(curatedPerfumes.map(p=>p.brand)).size,27);
 assert.deepEqual(items.map(p=>p.id),ids);assert.equal(new Set(items.map(p=>p.image)).size,4);
 assert.deepEqual(items.map(p=>p.concentration),['Extrait de Parfum','Extrait de Parfum','Elixir','Absolu']);
 assert.equal(canonicalConcentration('Absolu'),'Absolu');
 assert.deepEqual(items.map(p=>p.perfumer),[null,'Jean-Christophe Hérault','Pascal Gaurin','Pascal Gaurin']);
 assert.equal(rows.filter(([brand,name])=>/^alchemist(?: fragrance)?$/i.test(brand.trim())&&/out[\s-]*west/i.test(name)).length,0,'no exact dataset duplicate');
 for(const p of items){assert.equal(p.region,'印度尼西亚');assert.ok(isAlchemistOfficialImage(p));assert.ok(p.atlasPending);assert.equal(p.sha256,undefined);assert.equal(p.reviewedProfile,alchemistProfiles[p.id]);assert.equal(explainEvolution(p).mode,'documented');assert.deepEqual(['top','heart','base'].flatMap(k=>p.reviewedProfile.pyramid[k]),p.notes);assert.ok(!isAlchemistOfficialImage({...p,image:'https://example.com/fake.jpg'}));}
 assert.deepEqual(filterCatalog(perfumes,{brand:'ALCHEMIST',query:'Out West'}).map(p=>p.id),ids);
 assert.ok(items.every(p=>catalogSearchText(p,brandNames).includes('炼金术士')));
 const group=compareVersions(perfumes,ids[0]);assert.deepEqual(group.items.map(x=>x.p.id),ids);assert.deepEqual(group.common,[]);
});
