import assert from 'node:assert/strict';
import {perfumes} from './data.js';
import {catalogNoteOverrides,unresolvedPyramidIds} from './catalog-note-overrides.mjs';
import {localizeCatalog,explainEvolution} from './catalog-presentation.mjs';
import {noteLabel} from './fragrance-notes.mjs';

const amber=perfumes.find(p=>p.id==='hf-full-39');
assert.equal(amber.name,'Amber Heath');
assert.equal(amber.concentration,'Eau de Parfum');
assert.equal(explainEvolution(amber).mode,'documented');
assert.deepEqual(explainEvolution(amber).stages.map(s=>s.notes),[
 ['降龙涎香醚（Ambroxan）'],['广藿香'],['零陵香豆原精','香根草','香兰素'],
]);
assert.deepEqual(amber.notesZh,['降龙涎香醚（Ambroxan）','广藿香','零陵香豆原精','香根草','香兰素']);
assert.ok(amber.displayDescription.includes('降龙涎香醚'),'summary uses researched notes instead of the obsolete flat list');
for(const [id,record] of Object.entries(catalogNoteOverrides)){
 assert.ok(perfumes.some(p=>p.id===id),id);
 assert.match(record.pyramid.sourceUrl,/^https:\/\//,id);
 for(const phase of ['top','heart','base']){
  assert.ok(record.pyramid[phase].length,id);
  for(const note of record.pyramid[phase]){
   assert.match(noteLabel(note),/[\u3400-\u9fff]/,`${id}: ${note}`);
   assert.ok(!noteLabel(note).includes('�'),`${id}: ${note}`);
  }
 }
}
const sample={id:'unpublished',brand:'UNKNOWN',name:'Sample',notes:['Vanilla'],families:['美食'],description:'',concentration:'浓度未单独标注',image:'unchanged.jpg'};
const partial=localizeCatalog([{...sample,pyramid:{top:['Bergamot'],base:['Musk']}}])[0];
assert.deepEqual(explainEvolution(partial).stages[1].notes,[],'a source without a heart stays incomplete');
assert.deepEqual(partial.notesZh,['香草'],'partial evidence does not replace the complete flat source');
const complete=localizeCatalog([{...sample,pyramid:{top:['Bergamot'],heart:['Rose'],base:['Musk']}}])[0];
assert.deepEqual(complete.notesZh,['佛手柑','玫瑰','麝香']);
assert.deepEqual(complete.notes,sample.notes,'original source notes remain intact');
assert.equal(complete.image,sample.image);
assert.equal(complete.concentration,sample.concentration,'a note pyramid alone does not establish concentration');
assert.equal(noteLabel('Unknown material'),'Unknown material');
for(const id of unresolvedPyramidIds){
 const p=perfumes.find(p=>p.id===id);
 assert.ok(p,id);
 assert.equal(p.pyramid,undefined,'unresolved source conflicts must not be presented as established stages');
 assert.equal(explainEvolution(p).mode,'interpretation');
}
console.log(`PASS: screenshot regression, ${Object.keys(catalogNoteOverrides).length} evidence overrides, complete and partial source behavior`);
