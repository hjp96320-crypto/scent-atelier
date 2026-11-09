import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {popularProfiles} from './popular-perfume-profiles.mjs';
import {perfumes} from './data.js';
import {explainEvolution,localizeCatalog} from './catalog-presentation.mjs';
import {describeWear} from './perfume-wear.mjs';

test('100 exact versions use verified key notes and readable three-stage explanations',()=>{
 assert.equal(Object.keys(popularProfiles).length,100);
 for(const [id,profile] of Object.entries(popularProfiles)){
  const matches=perfumes.filter(p=>p.id===id);assert.equal(matches.length,1,id);const p=matches[0];
  assert.equal(p.concentration,profile.concentration,id);assert.equal(p.reviewedProfile,profile,id);assert.deepEqual(p.notesZh,profile.notes);
  assert.ok(['eco-beauty-sfra.dior.com','www.givenchybeauty.com','www.guerlain.com','www.mugler.com','www.jeanpaulgaultier.com','www.narcisorodriguezparfums.com','www.carolinaherrera.com','www.hugoboss.com','www.montblanc.com','www.calvinklein.us','www.isseymiyakeparfums.com','www.kenzoparfums.com','www.chanel.com','www.dior.com','www.hermes.com','www.jomalone.com','www.jomalone.co.uk','www.jomalone.eu','www.yslbeautyus.com','www.yslbeauty.com.au','www.lancome-usa.com','www.giorgioarmanibeauty-usa.com','www.armanibeauty.co.uk','www.gucci.com','www.prada-beauty.com','us.burberry.com','www.versace.com','www.dolcegabbana.com','www.chloe.com','www.marcjacobs.com','us.viktor-rolf.com','www.tomfordbeauty.com','www.byredo.com','us.diptyqueparis.com','www.franciskurkdjian.com','www.creedfragrance.com','www.maisonmargiela-fragrances.us'].includes(new URL(profile.sourceUrl).hostname),id);
  const evolution=explainEvolution(p);assert.equal(evolution.mode,profile.pyramid?'documented':'interpretation');assert.equal(evolution.stages.length,3);
  evolution.stages.forEach((stage,i)=>{assert.equal(stage.explanation,profile.stages[i]);assert.ok(stage.explanation.length>20);assert.deepEqual(stage.notes,profile.pyramid?profile.pyramid[stage.key]:[]);});
  assert.equal(describeWear(p),profile.wear);assert.ok(profile.wear.consideration.length>20);assert.equal(profile.wear.occasions.length,2);
 }
 assert.equal(Object.values(popularProfiles).filter(p=>p.pyramid).length,50);
 assert.equal(perfumes.filter(p=>p.reviewedProfile).length,100,'scope stays explicit');
});
test('previous 12 profiles are preserved and all new versions retain Chinese names',()=>{
 const previous=JSON.parse(readFileSync(new URL('../research/round-three/verified-profiles.json',import.meta.url),'utf8'));
 assert.equal(previous.length,12);
 for(const {id,...profile} of previous)assert.deepEqual(popularProfiles[id],profile,id);
 for(const p of perfumes.filter(p=>p.reviewedProfile))assert.match(p.displayName,/[\u3400-\u9fff]/,p.id);
});
test('Chance, Bloom and Baccarat editions have their own evidence and explanations',()=>{
 const chanceEdp=popularProfiles['hf-16094'],chanceEdt=popularProfiles['hf-full-25596'];
 assert.ok(chanceEdp.notes.includes('玫瑰'));assert.ok(!chanceEdt.notes.includes('玫瑰'));assert.ok(chanceEdt.notes.includes('白麝香'));
 assert.equal(popularProfiles['hf-4504'].pyramid,null,'Bloom EDP is explicitly non-pyramidal');
 assert.ok(popularProfiles['hf-full-14626'].pyramid.top.includes('柠檬'),'Bloom EDT has a separate official pyramid');
 assert.ok(!popularProfiles['hf-2581'].notes.includes('苦杏仁'));assert.ok(popularProfiles['hf-full-4304'].notes.includes('苦杏仁'));
 for(const [a,b] of [['hf-16094','hf-full-25596'],['hf-4504','hf-full-14626'],['hf-2581','hf-full-4304']])assert.notDeepEqual(popularProfiles[a].stages,popularProfiles[b].stages);
 assert.ok(!popularProfiles['hf-full-24495'].notes.includes('香草'),'Si Passione does not inherit the Intense comparison card');
 assert.ok(!popularProfiles['hf-6579'].notes.includes('榛子'),'Devotion EDP does not inherit Intense notes');
});
test('conflicting official lists remain interpretation instead of a fabricated pyramid',()=>{
 for(const id of ['hf-5015','hf-14863','hf-23113']){
  assert.equal(popularProfiles[id].pyramid,null,id);
  const evolution=explainEvolution(perfumes.find(p=>p.id===id));
  assert.equal(evolution.mode,'interpretation');
  assert.ok(evolution.stages.every(stage=>stage.notes.length===0));
 }
});
test('profile cannot leak to an unreviewed edition or mismatched concentration',()=>{
 const original={id:'hf-4504',brand:'GUCCI',name:'Gucci Bloom Eau De Parfum',notes:['Jasmine'],families:['花香'],description:'Source text',image:'original.jpg',concentration:'Eau de Parfum'};
 for(const item of [{...original,id:'unreviewed-limited-edition'},{...original,concentration:'Extrait de Parfum'}])assert.equal(localizeCatalog([item])[0].reviewedProfile,undefined);
 const shown=localizeCatalog([original])[0];
 for(const key of ['id','name','notes','description','image','concentration'])assert.deepEqual(shown[key],original[key],key);
});
test('version-specific facts do not transfer between EDT and EDP; explicit brand order wins',()=>{
 const edt=popularProfiles['dior-sauvage-edt'],edp=popularProfiles['dior-sauvage-eau-de-parfum'];
 assert.ok(!edt.notes.includes('香草'));assert.ok(edp.notes.includes('香草'));assert.notDeepEqual(edt.stages,edp.stages);
 assert.deepEqual(popularProfiles['jo-wood'].pyramid,{top:['黄葵籽'],heart:['海盐调'],base:['鼠尾草']});
 assert.deepEqual(popularProfiles['jo-pear'].pyramid.heart,['小苍兰']);
 assert.deepEqual(popularProfiles['jo-peony'].pyramid.base,['麂绒调']);
});

test('the previous 50 profiles and all catalog images retain their original identity',()=>{
 const previous=JSON.parse(readFileSync(new URL('../research/popular-expansion/verified-profiles.json',import.meta.url),'utf8'));
 assert.equal(previous.length,50);
 for(const {id,...profile} of previous)assert.deepEqual(popularProfiles[id],profile,id);
 const identities=JSON.parse(readFileSync(new URL('../research/popular-100/catalog-identities.json',import.meta.url),'utf8'));
 assert.equal(identities.length,50);
 for(const original of identities){
  const p=perfumes.find(p=>p.id===original.id);
  for(const key of ['brand','name','image'])assert.equal(p[key],original[key],`${p.id} ${key}`);
  assert.deepEqual(p.reviewedProfile.identity,{brand:p.brand,name:p.name});
 }
});

test('new evidence fills only the exact unknown edition and rejects conflicting identity or type',()=>{
 const identities=JSON.parse(readFileSync(new URL('../research/popular-100/catalog-identities.json',import.meta.url),'utf8'));
 const unknown=identities.filter(p=>p.concentration==='浓度未单独标注');
 assert.equal(unknown.length,12);
 for(const original of unknown){
  const raw={...original,notes:['Wood'],families:['木质'],description:'Source description'};
  const shown=localizeCatalog([raw])[0];assert.equal(shown.concentration,popularProfiles[original.id].concentration);
  for(const item of [{...raw,name:raw.name+' Limited Edition'},{...raw,brand:'OTHER BRAND'},{...raw,concentration:'Extrait de Parfum'}]){
   const result=localizeCatalog([item])[0];assert.equal(result.reviewedProfile,undefined,original.id);
   assert.equal(result.concentration,item.concentration,original.id);
  }
 }
});

test('new same-series versions keep their own notes, type and evidence mode',()=>{
 assert.equal(popularProfiles['hf-15181'].concentration,'Eau de Parfum Intense');
 assert.equal(popularProfiles['hf-full-20067'].concentration,'Parfum');
 assert.deepEqual(popularProfiles['hf-full-20067'].pyramid,{top:['薰衣草'],heart:['零陵香豆'],base:['安息香']});
 assert.ok(popularProfiles['hf-full-7647'].notes.includes('桂花'));assert.ok(!popularProfiles['hf-full-7647'].notes.includes('桃子'));
 assert.ok(popularProfiles['hf-full-21448'].notes.includes('桃子'));assert.ok(!popularProfiles['hf-full-21448'].notes.includes('桂花'));
 assert.ok(popularProfiles['hf-7685'].notes.includes('青苹果'));assert.ok(popularProfiles['hf-full-6674'].notes.includes('糖渍苹果香调'));
 for(const id of ['hf-7685','hf-5199','hf-7014','hf-full-4333'])assert.equal(popularProfiles[id].pyramid,null,id);
 assert.ok(!popularProfiles['hf-7014'].notes.some(note=>/朗姆|李子/.test(note)));
 assert.ok(!popularProfiles['dior-homme'].notes.includes('鸢尾'));
 assert.deepEqual(popularProfiles['hf-full-23266'].pyramid.top,['橙花','晚香玉']);
});
