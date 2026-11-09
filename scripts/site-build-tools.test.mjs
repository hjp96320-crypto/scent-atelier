import test from 'node:test';
import assert from 'node:assert/strict';
import rows from '../prototype/catalog-full-rows.js';
import {curatedPerfumes,perfumes} from '../prototype/data.js';
import {mergeCatalog} from '../prototype/catalog-model.mjs';
import {enrichCatalog} from '../prototype/catalog-enrichment.mjs';
import {localizeCatalog} from '../prototype/catalog-presentation.mjs';
import {compactCatalogRows} from './site-build-tools.mjs';

test('compact published catalog preserves every field except untranslated source prose',()=>{
 const compact=compactCatalogRows(rows);
 assert.ok(JSON.stringify(compact).length<JSON.stringify(rows).length*.65);
 const published=localizeCatalog(enrichCatalog(mergeCatalog(curatedPerfumes,compact)));
 assert.equal(published.length,perfumes.length);
 published.forEach((p,i)=>{
  const {description:before,...original}=perfumes[i],{description:after,...actual}=p;
  assert.deepEqual(actual,original,p.id);
  if(/[\u3400-\u9fff]/.test(before))assert.equal(after,before,p.id);
 });
 assert.ok(rows.some(row=>row[6]&&row[6]!==compact[rows.indexOf(row)][6]));
});
