import {createGame, resizeGame, stepGame} from './arcade-engine.js';

const hero = document.getElementById('hero');
const canvas = document.getElementById('arcadeCanvas');
const ctx = canvas.getContext('2d', {alpha: false});
const hud = document.getElementById('arcadeHud');
const controls = document.getElementById('arcadeControls');
const message = document.getElementById('arcadeMessage');
const status = document.getElementById('gameStatus');
const scoreDisplay = document.getElementById('scoreDisplay');
const continueButton = document.getElementById('continueGame');
const pauseButton = document.getElementById('pauseGame');
const playButton = document.getElementById('playGame');
const keys = new Set();
const alienPixels = ['00100000100','00010001000','00111111100','01101110110','11111111111','10111111101','10100000101','00011011000'];
const shipPixels = ['000010000','000111000','000111000','011111110','111111111','111111111'];
let game, frame = 0, lastTime = 0, running = false, active = false, pointer = null, targetX, dpr = 1, lastHud = '';

function clearInput() { keys.clear(); pointer = null; targetX = undefined; }
function dimensions() {
  const width = hero.clientWidth, height = hero.clientHeight;
  dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  canvas.width = Math.round(width*dpr);
  canvas.height = Math.round(height*dpr);
  ctx.setTransform(dpr,0,0,dpr,0,0);
  ctx.imageSmoothingEnabled = false;
  return {width,height};
}
function sprite(pixels, x, y, size, color) {
  ctx.fillStyle = color;
  for (let row=0;row<pixels.length;row++) for (let col=0;col<pixels[row].length;col++) {
    if (pixels[row][col] === '1') ctx.fillRect(Math.round(x+col*size),Math.round(y+row*size),size,size);
  }
}
function draw() {
  ctx.fillStyle = '#102d35';
  ctx.fillRect(0,0,game.width,game.height);
  ctx.fillStyle = '#31525a';
  // A fixed star field has no objects, animations or random work per frame.
  for (let i=0;i<28;i++) ctx.fillRect((i*137+37)%game.width,75+(i*79)%(game.height-170),1,1);
  for (const alien of game.aliens) sprite(alienPixels,alien.x,alien.y,2,'#a4d4c4');
  sprite(shipPixels,game.player.x,game.player.y,3,game.invulnerable ? '#f2e2ba' : '#e1f0f3');
  ctx.fillStyle = '#e3f4ef';
  for (const shot of game.shots) ctx.fillRect(shot.x,shot.y,shot.w,shot.h);
  ctx.fillStyle = '#e9b480';
  for (const shot of game.enemyShots) ctx.fillRect(shot.x,shot.y,shot.w,shot.h);
  const text = `Score ${game.score} / Lives ${game.lives} / Wave ${game.wave}`;
  if (text !== lastHud) { scoreDisplay.textContent = text; lastHud = text; }
}
function stopLoop() {
  running = false;
  cancelAnimationFrame(frame);
  frame = 0;
  clearInput();
}
function pause(reason = 'Paused') {
  if (!active || !running) return;
  stopLoop();
  status.textContent = reason;
  continueButton.textContent = 'Resume';
  message.hidden = false;
  pauseButton.textContent = 'Resume';
}
function tick(time) {
  frame = 0;
  if (!running) return;
  const elapsed = lastTime ? (time-lastTime)/1000 : 0;
  lastTime = time;
  stepGame(game,elapsed,{left: keys.has('ArrowLeft') || keys.has('a'), right: keys.has('ArrowRight') || keys.has('d'), fire: keys.has(' ') || pointer !== null, targetX});
  draw();
  if (game.status !== 'playing') {
    stopLoop();
    status.textContent = game.status === 'won' ? `All three waves cleared. Final score: ${game.score}.` : `Game over. Score: ${game.score}.`;
    continueButton.textContent = 'Play again';
    message.hidden = false;
    pauseButton.hidden = true;
    continueButton.focus({preventScroll:true});
    return;
  }
  frame = requestAnimationFrame(tick);
}
function resume() {
  if (!active || running || document.hidden) return;
  if (game.status !== 'playing') { startGame(); return; }
  clearInput();
  message.hidden = true;
  pauseButton.textContent = 'Pause';
  lastTime = 0;
  running = true;
  canvas.focus({preventScroll:true});
  frame = requestAnimationFrame(tick);
}
export function startGame() {
  if (!ctx) throw new Error('Canvas is unavailable.');
  stopLoop();
  active = true;
  hero.classList.add('playing');
  for (const el of [canvas,hud,controls,pauseButton]) el.hidden = false;
  const {width,height} = dimensions();
  game = createGame(width,height);
  draw();
  hero.scrollIntoView({block:'start',behavior:'instant'});
  resume();
}
function exitGame() {
  stopLoop();
  active = false;
  for (const el of [canvas,hud,controls,message]) el.hidden = true;
  hero.classList.remove('playing');
  playButton.focus({preventScroll:true});
}
pauseButton.addEventListener('click', () => running ? pause() : resume());
continueButton.addEventListener('click',resume);
document.getElementById('exitGame').addEventListener('click',exitGame);
canvas.addEventListener('keydown', event => {
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  if (['ArrowLeft','ArrowRight','a','d',' '].includes(key)) { event.preventDefault(); if (running) keys.add(key); }
  if (key === 'p' && !event.repeat) { event.preventDefault(); running ? pause() : resume(); }
});
window.addEventListener('keyup', event => keys.delete(event.key.length === 1 ? event.key.toLowerCase() : event.key));
hero.addEventListener('keydown', event => {
  if (event.key === 'Escape' && active) { event.preventDefault(); exitGame(); }
});
canvas.addEventListener('blur', event => {
  clearInput();
  if (![pauseButton,continueButton,document.getElementById('exitGame')].includes(event.relatedTarget)) pause();
});
canvas.addEventListener('pointerdown', event => {
  if (!running || (event.pointerType === 'mouse' && event.button !== 0)) return;
  canvas.focus({preventScroll:true});
  pointer = event.pointerId;
  canvas.setPointerCapture(pointer);
  targetX = event.clientX-canvas.getBoundingClientRect().left;
});
canvas.addEventListener('pointermove', event => {
  if (event.pointerId === pointer) targetX = event.clientX-canvas.getBoundingClientRect().left;
});
for (const eventName of ['pointerup','pointercancel','lostpointercapture']) canvas.addEventListener(eventName, event => {
  if (event.pointerId === pointer) { pointer = null; targetX = undefined; }
});
window.addEventListener('blur', () => pause('Paused while this window is inactive.'));
document.addEventListener('visibilitychange', () => { if (document.hidden) pause('Paused while this tab is hidden.'); });
new IntersectionObserver(entries => {
  if (entries[0].intersectionRatio < .35) pause('Paused while you browse the portfolio.');
}, {threshold: [.35]}).observe(hero);
new ResizeObserver(() => {
  if (!active || (hero.clientWidth === game.width && hero.clientHeight === game.height)) return;
  pause('Layout resized. Resume when ready.');
  const {width,height} = dimensions();
  resizeGame(game,width,height);
  draw();
}).observe(hero);
