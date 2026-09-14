import {test} from 'node:test';
import assert from 'node:assert/strict';

class Element {
  constructor(id) { this.id=id; this.hidden=false; this.textContent=''; this.clientWidth=800; this.clientHeight=600; this.listeners={}; this.classList={add(){},remove(){}}; }
  addEventListener(name,fn) { (this.listeners[name]??=[]).push(fn); }
  emit(name,event={}) { for(const fn of this.listeners[name]??[]) fn(event); }
  focus() { const previous=document.activeElement; document.activeElement=this; if(previous!==this) previous?.emit('blur',{relatedTarget:this}); }
  getContext() { return context; }
  scrollIntoView() {}
  getBoundingClientRect() { return {left:0}; }
  setPointerCapture() {}
}
let draws=0, nextFrame=1;
const frames=new Map();
const context={setTransform(){},fillRect(){draws++;}};
const elements=new Map();
globalThis.document=new Element('document');
document.getElementById=id=> { if(!elements.has(id)) elements.set(id,new Element(id)); return elements.get(id); };
document.hidden=false;
globalThis.window=new Element('window');
window.devicePixelRatio=3;
globalThis.requestAnimationFrame=fn=> { const id=nextFrame++; frames.set(id,fn); return id; };
globalThis.cancelAnimationFrame=id=>frames.delete(id);
let intersection,resize;
globalThis.IntersectionObserver=class { constructor(fn){intersection=fn;} observe(){} };
globalThis.ResizeObserver=class { constructor(fn){resize=fn;} observe(){} };
const {startGame}=await import('../arcade.js');
const el=id=>document.getElementById(id);
const click=id=> { el(id).focus(); el(id).emit('click'); };
const tick=time=> { const [id,fn]=frames.entries().next().value; frames.delete(id); fn(time); };

test('module import schedules no rendering',()=>assert.equal(frames.size,0));
test('start uses one frame chain and caps canvas pixel density',()=> {
  startGame(); assert.equal(frames.size,1); assert.equal(el('arcadeCanvas').width,1200);
  tick(1000); tick(1016); assert.equal(frames.size,1); assert(draws>0);
});
test('clicking pause cancels every pending frame and resume creates one',()=> {
  click('pauseGame'); assert.equal(frames.size,0); assert.equal(el('gameStatus').textContent,'Paused');
  click('continueGame'); assert.equal(frames.size,1);
  click('pauseGame'); assert.equal(frames.size,0);
  click('pauseGame'); assert.equal(frames.size,1);
});
test('offscreen and hidden tab pause until an explicit resume',()=> {
  intersection([{intersectionRatio:0}]); assert.equal(frames.size,0);
  intersection([{intersectionRatio:1}]); assert.equal(frames.size,0);
  click('continueGame'); assert.equal(frames.size,1);
  document.hidden=true; document.emit('visibilitychange'); assert.equal(frames.size,0);
  click('continueGame'); assert.equal(frames.size,0);
  document.hidden=false; document.emit('visibilitychange'); assert.equal(frames.size,0);
  click('continueGame'); assert.equal(frames.size,1);
});
test('resize pauses and keeps rendering stopped',()=> {
  el('hero').clientWidth=375; resize(); assert.equal(frames.size,0); assert.equal(el('arcadeCanvas').width,563);
});
test('exit restores portfolio, cancels frames and repeated starts cannot duplicate loops',()=> {
  click('continueGame'); click('exitGame'); assert.equal(frames.size,0); assert.equal(el('arcadeCanvas').hidden,true); assert.equal(document.activeElement.id,'playGame');
  startGame(); startGame(); assert.equal(frames.size,1);
  el('hero').emit('keydown',{key:'Escape',preventDefault(){}}); assert.equal(frames.size,0);
});

test('alternate games share pause, pointer input, resize and replay without switching back to aliens',()=> {
  let state,inputs=[],starts=0;
  const mode={title:'Test runner',instructions:'Tap to jump.',create(width,height){starts++;return state={width,height,status:'playing',score:0};},draw(){},hud(){return 'Runner';},victory(){return 'Finished';},step(game,dt,input){inputs.push(input);},resize(game,width,height){Object.assign(game,{width,height});}};
  startGame(mode,el('runnerCard'));assert.equal(starts,1);assert.equal(frames.size,1);
  el('arcadeCanvas').emit('pointerdown',{pointerId:1,pointerType:'touch',clientX:50});tick(3000);assert.equal(inputs.at(-1).jump,true);
  tick(3016);assert.equal(inputs.at(-1).jump,false);
  click('pauseGame');assert.equal(frames.size,0);click('continueGame');assert.equal(frames.size,1);
  el('hero').clientWidth=400;resize();assert.equal(state.width,400);assert.equal(frames.size,0);
  click('continueGame');state.status='won';tick(3032);assert.equal(frames.size,0);
  click('continueGame');assert.equal(starts,2);assert.equal(frames.size,1);
  click('exitGame');assert.equal(frames.size,0);assert.equal(document.activeElement.id,'runnerCard');
});
