import test from 'node:test';
import assert from 'node:assert/strict';




import {densityGrid} from './catalog-atlas-density.mjs';
import {normalizeCamera} from './catalog-atlas-renderer.mjs';

test('dragging a fitted desktop chart keeps subsequent button zoom finite',()=>{
 const before={zoom:-.37,zoomX:.73,zoomY:-.37,minZoom:-4,maxZoom:6};
 const camera=normalizeCamera(before,{zoom:[.73,-.37],zoomX:.73,zoomY:-.37,target:[-51,50]});
 assert.equal(camera.zoom,-.37);assert.equal(camera.minZoom,-4);assert.equal(camera.maxZoom,6);
 const next=Math.max(camera.minZoom,Math.min(camera.maxZoom,camera.zoom+.6));assert.ok(Number.isFinite(next));assert.ok(Math.abs(next-.23)<1e-12);
 assert.equal(camera.zoomX-camera.zoomY,1.1);assert.equal(before.zoom,-.37);
 assert.equal(normalizeCamera(before,{zoom:2}).zoom,2);
});


test('density excludes small samples, counts every record, and keeps equal fixed-scale weights',()=>{
 assert.equal(densityGrid([[0,0],[1,1]]),null);
 const points=Array.from({length:20},(_,i)=>[i%5,Math.floor(i/5)]),grid=densityGrid(points),double=densityGrid([...points,...points]);
 assert.deepEqual(grid.bounds,double.bounds);
 for(let i=0;i<grid.values.length;i++)assert.ok(Math.abs(double.values[i]-2*grid.values[i])<1e-10);
 assert.ok(grid.values.every(v=>Number.isFinite(v)&&v>=0));assert.ok(grid.max>0);
 const dense=densityGrid([...Array(40).fill([0,0]),...Array(20).fill([10,10])]);
 const cell=p=>{const step=(dense.bounds[2]-dense.bounds[0])/(dense.size-1),x=Math.round((p[0]-dense.bounds[0])/step),y=Math.round((p[1]-dense.bounds[1])/step);return dense.values[y*dense.size+x];};
 assert.ok(Math.abs(cell([0,0])/cell([10,10])-2)<1e-10);
});

