'use strict';
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
function closeMenu() { navLinks.classList.remove('active'); navToggle.setAttribute('aria-expanded','false'); }
navToggle.addEventListener('click', () => { const open = navLinks.classList.toggle('active'); navToggle.setAttribute('aria-expanded', String(open)); });
navLinks.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape' && navToggle.getAttribute('aria-expanded') === 'true') { closeMenu(); navToggle.focus(); } });
const playButton = document.getElementById('playGame');
const deck = document.getElementById('gameDeck');
const hero = document.getElementById('hero');
const cards = [...deck.querySelectorAll('.game-card')];
const rotationButton = document.getElementById('rotateCards');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let selected = 0, timer, visible = false, hovered = false, playing = false, manuallyPaused = reducedMotion.matches;
function scheduleRotation() {
  clearTimeout(timer);
  if (visible && !document.hidden && !hovered && !deck.contains(document.activeElement) && document.activeElement !== playButton && !playing && !manuallyPaused && !reducedMotion.matches) {
    timer = setTimeout(() => { selectCard(1); scheduleRotation(); }, 4200);
  }
}
function selectCard(direction, announce = false) {
  selected = (selected + direction + cards.length) % cards.length;
  cards.forEach((card,i) => {
    const slot = (i - selected + cards.length) % cards.length;
    card.dataset.slot = slot;
    card.inert = slot !== 0;
    card.setAttribute('aria-hidden',String(slot !== 0));
  });
  const title = cards[selected].querySelector('h2').textContent;
  playButton.textContent = 'Play ' + title + ' ↗';
  document.getElementById('deckPosition').textContent = `0${selected+1} / 03`;
  if (announce) document.getElementById('deckAnnouncement').textContent = title + ' selected';
}
for (const [id,direction] of [['previousCard',-1],['nextCard',1]]) document.getElementById(id).addEventListener('click',() => {selectCard(direction,true);scheduleRotation();});
rotationButton.addEventListener('click',() => {
  manuallyPaused = !manuallyPaused;
  rotationButton.textContent = manuallyPaused ? 'Resume rotation' : 'Pause rotation';
  scheduleRotation();
});
function motionPreference() {
  manuallyPaused = reducedMotion.matches;
  rotationButton.hidden = reducedMotion.matches;
  rotationButton.textContent = manuallyPaused ? 'Resume rotation' : 'Pause rotation';
  scheduleRotation();
}
reducedMotion.addEventListener('change',motionPreference);
motionPreference();
deck.addEventListener('pointerenter',()=>{hovered=true;scheduleRotation();});
deck.addEventListener('pointerleave',()=>{hovered=false;scheduleRotation();});
deck.addEventListener('focusin',scheduleRotation);
deck.addEventListener('focusout',()=>queueMicrotask(scheduleRotation));
playButton.addEventListener('focus',()=>{clearTimeout(timer);});
playButton.addEventListener('blur',scheduleRotation);
document.addEventListener('visibilitychange',scheduleRotation);
new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;scheduleRotation();},{threshold:.15}).observe(deck);
hero.addEventListener('arcadestart',()=>{playing=true;scheduleRotation();});
hero.addEventListener('arcadeexit',()=>{playing=false;scheduleRotation();});
let loading = false;
async function launch(kind,trigger) {
  if (loading) return;
  loading = true;
  const buttons=[playButton,...deck.querySelectorAll('.game-launch')];
  buttons.forEach(button=>button.disabled=true);
  document.getElementById('loadStatus').textContent = 'Loading game…';
  try {
    const game = await import('./arcade.js');
    const mode = kind === 'alien' ? null : (await import('./extra-games.js'))[kind];
    game.startGame(mode,trigger);
    document.getElementById('loadStatus').textContent = '';
  } catch { document.getElementById('loadStatus').textContent = 'The game could not load. Please try again.'; }
  finally { loading=false; buttons.forEach(button=>button.disabled=false); }
}
playButton.addEventListener('click',()=>launch(cards[selected].dataset.game,playButton));
deck.querySelectorAll('.game-launch').forEach(button=>button.addEventListener('click',()=>launch(button.dataset.game,button)));
