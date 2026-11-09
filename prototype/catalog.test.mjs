import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {curatedPerfumes as perfumes} from './data.js';

assert.equal(perfumes.length,100,'The reviewed launch catalog must contain 100 entries');
assert.equal(new Set(perfumes.map(p=>p.id)).size,perfumes.length,'Duplicate product IDs');
assert.equal(new Set(perfumes.map(p=>`${p.brand}|${p.name}|${p.concentration}`.toLowerCase())).size,perfumes.length,'Duplicate fragrance versions');
const sourceHosts={'DIOR':['www.dior.com'],'JO MALONE LONDON':['www.jomalone.com'],'BURBERRY':['assets.burberry.com']};
const reviews=JSON.parse(await readFile(new URL('../research/catalog-100/visual-review.json',import.meta.url)));
for(const p of perfumes){
  assert.ok(p.image&&p.imageAlt&&p.sourceUrl&&p.concentration&&p.imageCredit&&p.verifiedAt,`Incomplete image-backed entry: ${p.id}`);
  assert.ok(p.brand&&p.name&&p.nameZh&&p.family&&p.description&&p.notes.length,`Incomplete product information: ${p.id}`);
  assert.ok(!p.image.includes('..')&&p.image.startsWith('assets/'),'Catalog images must be local verified assets');
  const bytes=await readFile(new URL(p.image,import.meta.url));
  assert.ok(bytes.length>1000,`Missing/placeholder image: ${p.id}`);
  if(p.sha256){
    assert.equal(p.reviewStatus,'visually-verified');
    assert.equal(createHash('sha256').update(bytes).digest('hex'),p.sha256,`Changed image requires review: ${p.id}`);
    if(p.id.startsWith('hf-')||reviews.some(r=>r.id===p.id))assert.equal(reviews.find(r=>r.id===p.id)?.sha256,p.sha256);
  }
  if(p.imageOriginalUrl){
    assert.ok(sourceHosts[p.brand]?.includes(new URL(p.imageOriginalUrl).hostname));
    assert.ok(new URL(p.sourceUrl).hostname.endsWith(p.brand==='BURBERRY'?'burberry.com':new URL(p.imageOriginalUrl).hostname));
    assert.ok(p.sku&&p.imageSize);
  }
  if(p.imageSourceType==='dataset'){
    assert.equal(p.datasetSnapshot,'2024');
    assert.ok(Number.isInteger(p.datasetRowIndex)&&p.datasetImageName&&p.datasetCsvSha256&&p.versionNote);
    assert.equal(p.imageRightsStatus,'third-party-rights-unverified');
    assert.equal(p.imageOriginalUrl,undefined,'Dataset images must not be presented as official downloads');
  }
}
assert.equal(perfumes.filter(p=>p.imageOriginalUrl).length,27);
assert.equal(perfumes.filter(p=>p.imageSourceType==='dataset').length,70);
console.log(`PASS: ${perfumes.length} image-backed entries; unique versions, image hashes, review records, official hosts, and dataset provenance verified`);
