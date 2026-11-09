import assert from 'node:assert/strict';
import rows from './catalog-full-rows.js';
import {perfumes} from './data.js';
import {catalogPyramids} from './catalog-pyramids.js';
import {noteLabel,explainEvolution} from './fragrance-notes.mjs';
import {retainedOriginalNoteNames} from './catalog-note-translations.mjs';
const retained=new Set(retainedOriginalNoteNames.map(n=>n.toLowerCase()));
const notes=[...new Set(rows.flatMap(row=>row[5]))];
assert.equal(notes.length,394);
for(const note of notes){assert.ok(/[\u3400-\u9fff]/.test(noteLabel(note)),note);assert.ok(!noteLabel(note).includes('�'),note);}
const stagedNotes=[...new Set(Object.values(catalogPyramids).flatMap(pyramid=>['top','heart','base'].flatMap(key=>pyramid[key])))];
for(const note of stagedNotes){assert.ok(/[\u3400-\u9fff]/.test(noteLabel(note))||retained.has(note.toLowerCase()),note);assert.ok(!noteLabel(note).includes('�'),note);}
for(const note of retainedOriginalNoteNames)assert.equal(noteLabel(note),note,'uncertain identities retain the source spelling');
assert.equal(noteLabel('Cedarwood (Atlas)'),'阿特拉斯雪松');
assert.equal(noteLabel('Bergamot'),'佛手柑');
assert.equal(noteLabel('Ambrofix (Ambergris)'),'Ambrofix（龙涎香材料）');
assert.equal(noteLabel('Foug��re accord'),'馥奇香调');
assert.equal(noteLabel('麝香'),'麝香');
assert.equal(noteLabel('Unknown material'),'Unknown material','unmapped identity is not invented');
for(const perfume of perfumes){
 const evolution=explainEvolution(perfume);
 assert.equal(evolution.stages.length,3,perfume.id);
 assert.deepEqual(evolution.stages.map(s=>s.key),['top','heart','base']);
 assert.ok(evolution.stages.every(s=>s.explanation.length>12));
 assert.ok(evolution.stages.every(s=>s.notes.length||s.referenceNotes.length),perfume.id+' has specific scent context in every phase');
 assert.ok(evolution.stages.every(s=>!/未提供|未单列|未单独列/.test(s.explanation)),perfume.id+' has a reading experience, not a missing-data placeholder');
 assert.ok(evolution.disclaimer);
}
const incomplete=explainEvolution({notes:['Vanilla']});
assert.equal(incomplete.mode,'interpretation');
assert.deepEqual(incomplete.stages[0].notes,[],'no fake top notes for a vanilla-only source');
assert.ok(incomplete.stages[0].explanation.includes('香草'));
assert.deepEqual(incomplete.stages[0].referenceNotes,['香草']);
const actual=explainEvolution({notes:['Musk'],pyramid:{top:['Bergamot'],heart:['Rose'],base:['Vanilla'],sourceUrl:'https://example.test/product'}});
assert.equal(actual.mode,'documented');
assert.deepEqual(actual.stages.map(s=>s.notes),[['佛手柑'],['玫瑰'],['香草']]);
assert.equal(actual.sourceUrl,'https://example.test/product');
const partial=explainEvolution({pyramid:{heart:['Jasmine']},notes:['Musk']});
assert.deepEqual(partial.stages[2].notes,[],'partial official pyramids do not inherit guessed notes');
console.log(`PASS: ${notes.length} source labels translated; ${stagedNotes.length} staged labels localized or explicitly retained; ${perfumes.length} three-stage explanations; evidence and interpretation kept separate`);
