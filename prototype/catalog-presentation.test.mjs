import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {perfumes,curatedPerfumes,brandNames} from './data.js';
import {catalogSearchText,filterCatalog} from './catalog-model.mjs';
import {explainEvolution,localizeCatalog} from './catalog-presentation.mjs';
import {catalogPyramids} from './catalog-pyramids.js';
import {unresolvedPyramidIds} from './catalog-note-overrides.mjs';
import {retainedOriginalNoteNames} from './catalog-note-translations.mjs';
const retained=new Set(retainedOriginalNoteNames.map(n=>n.toLowerCase()));

assert.equal(perfumes.length,26335);
for(const p of perfumes){
 assert.ok(p.displayName&&p.displayBrand,p.id);
 assert.ok(!['来源已核对','数据库收录'].includes(p.displayName),p.id);
 assert.match(p.displayDescription,/[\u3400-\u9fff]/,p.id);
 assert.ok(p.notesZh.every(note=>/[\u3400-\u9fff]/.test(note)||retained.has(note.toLowerCase())),p.id);
 assert.equal(explainEvolution(p).stages.length,3,p.id);
}
for(const original of curatedPerfumes){
 const shown=perfumes.find(p=>p.id===original.id);
 for(const field of ['name','description','image','sourceUrl'])assert.equal(shown[field],original[field]);
}
const texts=perfumes.map(p=>catalogSearchText(p,brandNames));
for(const query of ['可可小姐','COCO MADEMOISELLE','香奈儿','CHANEL']){
 assert.ok(filterCatalog(perfumes,{query},texts).some(p=>p.id==='chanel-coco-mademoiselle-edp'),query);
}
assert.ok(filterCatalog(perfumes,{query:'佛手柑'},texts).length>0);
assert.ok(filterCatalog(perfumes,{query:'  迪奥   旷野  '},texts).some(p=>p.id==='dior-sauvage-edt'),'brand and product keywords can be separated by whitespace');
assert.ok(filterCatalog(perfumes,{query:'Chloe'},texts).some(p=>p.brand==='CHLOÉ'),'plain Latin input matches accented brand names');
assert.deepEqual(filterCatalog(perfumes,{query:'  '},texts),perfumes);
assert.ok(filterCatalog(perfumes,{query:'L’Interdit'},texts).some(p=>p.name.includes("L'Interdit")),'curly and straight apostrophes match');
for(const [left,right] of [[6592,11104],[18534,23946]]){
 const a=perfumes.find(p=>p.sourceRowIndex===left),b=perfumes.find(p=>p.sourceRowIndex===right);
 assert.notEqual(a.displayName,b.displayName,'translated names must retain version differences');
}
const sample={id:'unknown',brand:'UNKNOWN',name:'Unique Name',nameZh:'数据库收录',notes:['Vanilla'],families:['美食'],description:'English source description',concentration:'浓度未单独标注'};
const localized=localizeCatalog([sample])[0];
assert.equal(localized.displayName,sample.name,'do not invent a translated proper name');
assert.equal(localized.descriptionKind,'interpretation','Chinese note summary is not called a translation of the original');
assert.equal(localized.concentrationZh,'香水','unknown concentration must not become EDP');
assert.equal(localizeCatalog([{...sample,concentration:'Cologne Intense'}])[0].concentrationZh,'浓郁古龙水');
assert.equal(localizeCatalog([{...sample,name:'Exact Name Eau De Toilette'}])[0].concentrationZh,'淡香水 · EDT','explicit concentration in the exact product name is preserved');
assert.equal(localizeCatalog([{...sample,name:'CK Cologne'}])[0].concentrationZh,'香水','Cologne alone can be a name and must not be treated as concentration');
assert.equal(explainEvolution(localized).mode,'interpretation');
assert.deepEqual(explainEvolution(localized).stages[0].notes,[],'do not invent top notes for a vanilla-only record');
for(const rowIndex of Object.keys(catalogPyramids)){
 const matches=perfumes.filter(p=>p.sourceRowIndex===Number(rowIndex));
 assert.equal(matches.length,1,rowIndex);
 const p=matches[0],expected=p.reviewedProfile?(p.reviewedProfile.pyramid?'documented':'interpretation'):(unresolvedPyramidIds.includes(p.id)?'interpretation':'documented');
 assert.equal(explainEvolution(p).mode,expected,rowIndex);
}
const app=readFileSync(new URL('./app.js',import.meta.url),'utf8');
assert.doesNotMatch(app,/来源已核对|catalog-review|catalog-image|catalog-about|showSources|imageRights/);
assert.doesNotMatch(app,/href=["']https?:/,'no external source links in the app interface');
const documented=perfumes.filter(p=>explainEvolution(p).mode==='documented').length;
console.log(JSON.stringify({status:'PASS',catalogEntries:perfumes.length,documentedPyramids:documented,evolutionReferences:perfumes.length-documented,chineseProductNames:perfumes.filter(p=>/[\u3400-\u9fff]/.test(p.displayName)).length,chineseBrandLabels:Object.values(brandNames).filter(n=>/[\u3400-\u9fff]/.test(n)).length}));
