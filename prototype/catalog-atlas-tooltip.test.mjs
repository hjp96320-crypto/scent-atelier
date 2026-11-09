import test from 'node:test';
import assert from 'node:assert/strict';
import {perfumeTooltip,tooltipPosition} from './catalog-atlas-tooltip.mjs';

test('preview keeps exact version, real image and three note clues with escaped catalog text',()=>{
 const result=perfumeTooltip({p:{displayBrand:'A & B',displayName:'<EDP>',image:'assets/a"b.jpg',concentrationZh:'淡香精 · EDP',region:'法国'},notes:['玫瑰','木质','麝香','香草']});
 assert.ok(result.html.includes('assets/a&quot;b.jpg'));assert.ok(result.html.includes('&lt;EDP&gt;'));assert.ok(result.html.includes('A &amp; B'));
 assert.ok(result.html.includes('淡香精 · EDP'));assert.ok(result.html.includes('玫瑰'));assert.ok(!result.html.includes('香草'));assert.ok(!result.html.includes('<EDP>'));
 assert.equal(result.style.pointerEvents,'none');
 assert.ok(!perfumeTooltip({p:{displayName:'无香调资料',image:'assets/real.jpg'}}).html.includes('undefined'));
});

test('preview flips at edges and stays inside desktop and narrow charts',()=>{
 for(const width of [350,844])for(const height of [360,500])for(const x of [2,100,width-2])for(const y of [2,100,height-2]){
  const style=tooltipPosition(x,y,width,height),left=x+parseFloat(style.left),top=y+parseFloat(style.top);
  assert.ok(left>=12&&left+272<=width-12);assert.ok(top>=12&&top+200<=height-12);
 }
});
