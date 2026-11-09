import assert from 'node:assert/strict';
import test from 'node:test';
import {bases,baseById} from './blend-model.mjs';
import {scentCategories,guideForBase} from './scent-guide.mjs';

test('all 90 bases have everyday guidance in one of eight shared categories',()=>{
 assert.equal(scentCategories.length,8);
 assert.equal(new Set(scentCategories).size,8);
 assert.equal(bases.length,90);
 const used=new Set();
 for(const base of bases){
  const guide=guideForBase(base);
  assert.ok(scentCategories.includes(guide.category),`${base.id}: category coverage`);
  used.add(guide.category);
  for(const field of ['label','reference','originalName'])assert.match(guide[field],/[\u3400-\u9fff]/,`${base.id}: readable ${field}`);
  assert.equal(guide.originalName,base.name,`${base.id}: retain the formal name`);
  assert.ok(!Object.hasOwn(guide,'supplier'),'browsing guide is not divided by supplier');
 }
 assert.deepEqual(used,new Set(scentCategories),'every category is populated');
});

test('abstract perfume vocabulary has familiar labels and concrete everyday references',()=>{
 const examples=[
  ['musk','干净棉衣','棉衬衫'],
  ['wood','甜暖木头','甜点'],
  ['amber','柔甜暖香','香草糖'],
  ['marine','海风空气','海边'],
  ['moss','潮湿苔藓','湿土'],
  ['provence','南法花草气息','花园'],
  ['demeter-frankincense','清透焚香','香炉'],
  ['demeter-myrrh','微苦树香','树皮'],
  ['demeter-leather','皮包皮衣','皮包'],
  ['demeter-pipe-tobacco','干烟叶','尚未点燃']
 ];
 for(const [id,label,reference] of examples){
  const guide=guideForBase(baseById(id));
  assert.equal(guide.label,label,id);
  assert.ok(guide.reference.includes(reference),id);
  assert.notEqual(guide.label,guide.originalName,id);
 }
});

test('the same smell family shares its browsing category across both sources',()=>{
 for(const [left,right] of [['bergamot','demeter-sweet-orange'],['peony','demeter-jasmine'],['tea','demeter-earl-grey-tea'],['wood','demeter-sandalwood'],['marine','demeter-rain'],['musk','demeter-clean-skin'],['praline','demeter-caramel'],['amber','demeter-amber']]){
  assert.equal(guideForBase(baseById(left)).category,guideForBase(baseById(right)).category,`${left} / ${right}`);
 }
});

test('guidance is a display layer and cannot alter source identities or saved formulas',()=>{
 const snapshot=JSON.stringify(bases);
 for(const base of bases){
  const guide=guideForBase(base);
  guide.label='仅修改显示副本';
  guide.originalName='不应写回';
 }
 assert.equal(JSON.stringify(bases),snapshot);
});
