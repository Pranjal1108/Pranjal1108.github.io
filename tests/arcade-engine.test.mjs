import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createGame,stepGame,resizeGame,overlaps} from '../arcade-engine.js';

test('desktop and mobile formations fit and start with three lives', () => {
  for (const width of [320,375,640,1120]) {
    const g = createGame(width,600);
    assert.equal(g.aliens.length,width<600?18:24);
    assert.equal(g.lives,3);
    assert(g.aliens.every(a=>a.x>=0 && a.x+a.w<=width));
  }
});
test('keyboard and pointer movement are clamped to the playfield', () => {
  const g = createGame(375,600);
  for(let i=0;i<100;i++) stepGame(g,1/60,{left:true});
  assert.equal(g.player.x,12);
  stepGame(g,1/60,{targetX:10000});
  assert.equal(g.player.x,375-g.player.w-12);
  stepGame(g,1/60,{targetX:-10000});
  assert.equal(g.player.x,12);
});
test('firing is rate-limited and shot counts stay bounded', () => {
  const g=createGame(640,600);
  stepGame(g,0,{fire:true});
  assert.equal(g.shots.length,1);
  stepGame(g,0,{fire:true});
  assert.equal(g.shots.length,1);
  for(let i=0;i<1000;i++) { stepGame(g,1/60,{fire:true},()=>.5); assert(g.shots.length<=10); assert(g.enemyShots.length<=12); }
});
test('a bullet removes one alien and awards one score increment', () => {
  const g=createGame(640,600), alien=g.aliens[0];
  g.shots=[{x:alien.x,y:alien.y,w:4,h:12}];
  stepGame(g,0);
  assert.equal(g.score,10); assert.equal(g.aliens.length,23); assert.equal(g.shots.length,0);
  stepGame(g,0); assert.equal(g.score,10);
});
test('a volley costs only one life during the invulnerability window', () => {
  const g=createGame(640,600);
  g.invulnerable=0;
  g.enemyShots=Array.from({length:3},()=>({...g.player}));
  stepGame(g,0); assert.equal(g.lives,2); assert.equal(g.enemyShots.length,0);
  g.enemyShots=[{...g.player}]; stepGame(g,0); assert.equal(g.lives,2);
});
test('loss occurs on exhausted lives or an alien reaching the ship', () => {
  let g=createGame(640,600); g.lives=1; g.invulnerable=0; g.enemyShots=[{...g.player}];
  stepGame(g,0); assert.equal(g.status,'lost');
  g=createGame(640,600); g.aliens[0].y=g.player.y;
  stepGame(g,0); assert.equal(g.status,'lost');
});
test('clearing three waves wins, and completed games stop changing', () => {
  const g=createGame(640,600);
  for(let wave=1;wave<=3;wave++) { assert.equal(g.wave,wave); g.aliens=[]; stepGame(g,0); }
  assert.equal(g.status,'won');
  const snapshot=JSON.stringify(g); stepGame(g,1,{fire:true,right:true}); assert.equal(JSON.stringify(g),snapshot);
});
test('resize preserves score and keeps objects inside horizontal bounds', () => {
  const g=createGame(1120,650); g.score=90; resizeGame(g,320,520);
  assert.equal(g.score,90); assert.equal(g.player.y,405);
  assert(g.aliens.every(a=>a.x>=0 && a.x+a.w<=320));
});
test('collision rectangles reject misses and accept overlaps',()=> {
  assert.equal(overlaps({x:0,y:0,w:4,h:4},{x:4,y:0,w:4,h:4}),false);
  assert.equal(overlaps({x:0,y:0,w:4,h:4},{x:3,y:3,w:4,h:4}),true);
});
