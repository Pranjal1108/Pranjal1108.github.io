import {segmentHitsEllipse} from './ambient-engine.js';

const layer=document.getElementById('ambientLayer');
const flyers=[...layer.querySelectorAll('[data-flyer]')];
const finePointer=matchMedia('(hover: hover) and (pointer: fine)');
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
let pointer=null,timer=0,motionFrame=0,playing=false;

function stopped() {
  return document.hidden || playing || reducedMotion.matches;
}
function setPaused() {
  layer.classList.toggle('ambient-paused',stopped());
  if(stopped()) stopChecking();
  else scheduleCheck();
}
function stopChecking() {
  clearTimeout(timer);
  timer=0;
  cancelAnimationFrame(motionFrame);
  motionFrame=0;
}
function explode(flyer) {
  if(flyer.classList.contains('is-hit'))return;
  flyer.classList.add('is-hit');
  flyer.dataset.cooldown='1';
  setTimeout(()=>flyer.classList.remove('is-hit'),650);
  setTimeout(()=>{delete flyer.dataset.cooldown;scheduleCheck();},1400);
}
function detectCollisions(from,to) {
  for(const flyer of flyers) {
    if(!flyer.dataset.cooldown && segmentHitsEllipse(flyer.getBoundingClientRect(),from,to))explode(flyer);
  }
}
function checkStationaryPointer() {
  timer=0;
  if(!pointer || stopped() || !finePointer.matches)return;
  detectCollisions(pointer,pointer);
  scheduleCheck();
}
function scheduleCheck() {
  if(!timer && pointer && !stopped() && finePointer.matches)timer=setTimeout(checkStationaryPointer,100);
}
function pointerMoved(event) {
  if(event.pointerType==='touch')return;
  const previous=pointer || {x:event.clientX,y:event.clientY};
  pointer={x:event.clientX,y:event.clientY};
  if(!motionFrame && !stopped() && finePointer.matches)motionFrame=requestAnimationFrame(()=>{
    motionFrame=0;
    detectCollisions(previous,pointer);
    scheduleCheck();
  });
}
function pointerGone() { stopChecking();pointer=null; }

document.addEventListener('pointermove',pointerMoved,{passive:true});
document.addEventListener('pointerleave',pointerGone);
document.addEventListener('visibilitychange',setPaused);
finePointer.addEventListener('change',()=>{pointer=null;setPaused();});
reducedMotion.addEventListener('change',setPaused);
document.getElementById('hero').addEventListener('arcadestart',()=>{playing=true;setPaused();});
document.getElementById('hero').addEventListener('arcadeexit',()=>{playing=false;setPaused();});
layer.classList.add('ambient-ready');
setPaused();
