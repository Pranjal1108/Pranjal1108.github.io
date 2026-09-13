'use strict';
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
function closeMenu() { navLinks.classList.remove('active'); navToggle.setAttribute('aria-expanded','false'); }
navToggle.addEventListener('click', () => { const open = navLinks.classList.toggle('active'); navToggle.setAttribute('aria-expanded', String(open)); });
navLinks.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape' && navToggle.getAttribute('aria-expanded') === 'true') { closeMenu(); navToggle.focus(); } });
const playButton = document.getElementById('playGame');
let game;
playButton.addEventListener('click', async () => {
  playButton.disabled = true;
  try {
    game ??= await import('./arcade.js');
    game.startGame();
    document.getElementById('loadStatus').textContent = '';
  } catch { document.getElementById('loadStatus').textContent = 'The game could not load. Please try again.'; }
  finally { playButton.disabled = false; }
});
