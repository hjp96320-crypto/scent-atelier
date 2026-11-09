import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {perfumes} from './data.js';
import {brandGeography,countryBounds} from './catalog-atlas-geography.mjs';
const places=JSON.parse(fs.readFileSync(new URL('./assets/atlas/brand-locations.json',import.meta.url)));
const world=JSON.parse(fs.readFileSync(new URL('./assets/atlas/world.json',import.meta.url)));

test('each reviewed brand joins an exact catalog brand and a sourced city',()=>{
 assert.equal(new Set(places.brands.map(b=>b.brand)).size,places.brands.length);
 for(const b of places.brands){
  assert.ok(perfumes.some(p=>p.brand===b.brand&&p.region===b.region),b.brand);
  assert.ok(b.sourceUrl.startsWith('https://'));assert.ok(b.coordinateSource.includes(b.cityId));assert.ok(b.basis);
  assert.ok(b.position[0]>=-180&&b.position[0]<=180&&b.position[1]>=-85&&b.position[1]<=85);
 }
});
test('city aggregation counts each brand once; unknown brands never become capital-city pins',()=>{
 const all=brandGeography(perfumes,places);
 assert.equal(all.located,places.brands.length);
 assert.equal(all.located+all.unlocated.length,new Set(perfumes.map(p=>p.brand)).size);
 assert.equal(all.cities.reduce((s,c)=>s+c.count,0)+all.unlocated.reduce((s,b)=>s+b.items.length,0),perfumes.length);
 const france=brandGeography(perfumes.filter(p=>p.region==='法国'),places),paris=france.cities.find(c=>c.name==='巴黎');
 assert.deepEqual(new Set(paris.brands.map(b=>b.brand)),new Set(places.brands.filter(b=>b.region==='法国'&&b.city==='巴黎').map(b=>b.brand)));
 assert.ok(france.cities.some(c=>c.name==='格拉斯'));
 const subset=brandGeography(perfumes.filter(p=>p.brand==='CHANEL'),places);
 assert.equal(subset.cities.length,1);assert.equal(subset.cities[0].brands.length,1);
 assert.deepEqual(brandGeography([{brand:'UNKNOWN',region:'法国',displayBrand:'未知'}],places).cities,[]);
 assert.deepEqual(brandGeography([{brand:'CHANEL',region:'美国',displayBrand:'香奈儿'}],places).cities,[]);
 assert.deepEqual(brandGeography([],places).cities,[]);
});
test('all catalog countries have finite bounded drilldown frames including known cities',()=>{
 for(const region of new Set(perfumes.map(p=>p.region))){
  const positions=places.brands.filter(b=>b.region===region).map(b=>b.position);
  const bounds=countryBounds(world.features.find(f=>f.properties.name===region),positions);
  assert.ok(bounds,region);assert.ok(bounds.flat().every(Number.isFinite),region);
  assert.ok(bounds[1][0]-bounds[0][0]<190,region);
  assert.ok(bounds[1][1]>bounds[0][1],region);
 }
 const france=countryBounds(world.features.find(f=>f.properties.name==='法国'));
 assert.ok(france[0][1]>40&&france[1][0]-france[0][0]<15);
 const russia=countryBounds(world.features.find(f=>f.properties.name==='俄罗斯'));
 assert.ok(russia[1][0]-russia[0][0]<180);
});

test('reviewed small towns and ambiguous names resolve to the intended GeoNames place',()=>{
 const expected={'CHOPARD':'2658553','VICTORINOX SWISS ARMY':'2660279','URBAN GABRU':'1261481','BATH & BODY WORKS':'4509177'};
 for(const [brand,id] of Object.entries(expected))assert.equal(places.brands.find(b=>b.brand===brand)?.cityId,id,brand);
 const china=brandGeography(perfumes.filter(p=>p.region==='中国'),places);
 assert.deepEqual(new Set(china.cities.map(c=>c.name)),new Set(['北京','上海','广州']));
 assert.equal(china.located,6);
});
