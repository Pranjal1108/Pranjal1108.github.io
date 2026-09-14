import {test} from 'node:test';
import assert from 'node:assert/strict';
import {platform,race} from '../extra-games.js';

test('platform jumps only from a surface, falls, respawns, and eventually loses',()=>{
  const g=platform.create(375,600);
  platform.step(g,1/60,{jump:true}); assert(g.player.vy<0);
  const velocity=g.player.vy; platform.step(g,1/60,{jump:true}); assert(g.player.vy>velocity);
  for(let i=0;i<4000 && g.status==='playing';i++)platform.step(g,1/60);
  assert.equal(g.status,'lost');assert.equal(g.lives,0);
});
test('every rooftop gap is traversable and the course can be completed',()=>{
  const g=platform.create(800,600),edges=[360,650,920,1215,1500,1790,2080];
  for(let i=0;i<1800 && g.status==='playing';i++) {
    const edge=edges[g.checkpoint];
    platform.step(g,1/60,{jump:g.player.grounded && edge-g.player.x<52});
  }
  assert.equal(g.status,'won');assert.equal(g.lives,3);assert(g.score>=600);
  const finished=JSON.stringify(g);platform.step(g,.03,{jump:true});assert.equal(JSON.stringify(g),finished);
});
test('race steering is bounded for keyboard and pointer at mobile and desktop widths',()=>{
  for(const width of [320,1440]) {
    const g=race.create(width,600);
    for(let i=0;i<120;i++)race.step(g,1/60,{left:true});assert.equal(g.player.x,110);
    for(let i=0;i<120;i++)race.step(g,1/60,{targetX:width*2});assert.equal(g.player.x,342);
    race.resize(g,768,700);assert.equal(g.width,768);assert.equal(g.height,700);
  }
});
test('race collisions cost one life per protection period and stop at game over',()=>{
  const g=race.create(800,600);
  g.traffic=[{...g.player},{...g.player}];race.step(g,0);assert.equal(g.lives,2);
  race.step(g,0);assert.equal(g.lives,2);
  for(let i=0;i<2;i++){g.invulnerable=0;g.traffic=[{...g.player}];race.step(g,0);}
  assert.equal(g.status,'lost');const finished=JSON.stringify(g);race.step(g,.03);assert.equal(JSON.stringify(g),finished);
});
test('race supports a full winning run with bounded traffic',()=>{
  const g=race.create(800,600);
  for(let i=0;i<2800 && g.status==='playing';i++) {
    const threat=g.traffic.filter(c=>c.y>40 && c.y<330).sort((a,b)=>b.y-a.y)[0];
    const target=threat && threat.x<226?330:150;
    const scale=(600-180)/360;
    race.step(g,1/60,{targetX:(800-480*scale)/2+target*scale});
    assert(g.traffic.length<=4);
  }
  assert.equal(g.status,'won');assert(g.lives>0);
});
