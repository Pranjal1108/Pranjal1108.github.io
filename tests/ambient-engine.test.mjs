import {test} from 'node:test';
import assert from 'node:assert/strict';
import {segmentHitsEllipse} from '../ambient-engine.js';

const rect={left:20,right:60,top:30,bottom:70};
test('cursor collision includes the visible centre without oversized corners',()=>{
  assert.equal(segmentHitsEllipse(rect,{x:40,y:50},{x:40,y:50}),true);
  assert.equal(segmentHitsEllipse(rect,{x:21,y:31},{x:21,y:31}),false);
  assert.equal(segmentHitsEllipse(rect,{x:59,y:69},{x:59,y:69}),false);
});
test('a fast cursor segment crossing an object still collides',()=>{
  assert.equal(segmentHitsEllipse(rect,{x:0,y:50},{x:100,y:50}),true);
  assert.equal(segmentHitsEllipse(rect,{x:0,y:10},{x:100,y:10}),false);
});
