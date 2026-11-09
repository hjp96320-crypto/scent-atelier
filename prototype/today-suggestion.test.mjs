import test from 'node:test';
import assert from 'node:assert/strict';
import {untilNextDay} from './today-suggestion.mjs';
test('next refresh follows local midnight across month and year boundaries',()=>{
 for(const date of [new Date(2026,10,9,23,59,59),new Date(2026,11,31,23,59,59),new Date(2026,1,28,23,59,59)]){
  assert.equal(untilNextDay(date),1100);
  const next=new Date(date.getTime()+untilNextDay(date));assert.equal(next.getHours(),0);assert.equal(next.getMinutes(),0);
 }
 assert.equal(untilNextDay(new Date(2026,10,9,12)),12*60*60*1000+100);
});
