import test from 'node:test';
import assert from 'node:assert/strict';
import {createAtlasAssetLoader} from './atlas-assets.mjs';

test('star excludes geography; map excludes local groups and reuses shared resources',async()=>{
 const requests=[];let rendererLoads=0;
 const load=createAtlasAssetLoader(async url=>{requests.push(url);return {url};},async()=>{rendererLoads++;});
 const star=await load('star');
 assert.deepEqual(requests,['assets/atlas/atlas-data.json','assets/atlas/local-groups.json?v=20261109-all-groups']);
 assert.deepEqual(star[1].features,[]);
 await load('map');await load('star');
 assert.equal(requests.length,5);assert.equal(rendererLoads,1);
 const mapRequests=[];
 await createAtlasAssetLoader(async url=>{mapRequests.push(url);},async()=>{})('map');
 assert.ok(!mapRequests.some(url=>url.includes('local-groups')));
});

test('failed resource can retry without downloading successful resources again',async()=>{
 let attempts=0,rendererLoads=0;
 const load=createAtlasAssetLoader(async url=>{if(url.includes('atlas-data')&&++attempts===1)throw Error('offline');return {};},async()=>{rendererLoads++;});
 await assert.rejects(load('star'),/offline/);await load('star');
 assert.equal(attempts,2);assert.equal(rendererLoads,1);
});
