'use strict';
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
function closeMenu() {
  navLinks.classList.remove('active');
  navToggle.setAttribute('aria-expanded', 'false');
}
navToggle.addEventListener('click', () => {
  const open = navLinks.classList.toggle('active');
  navToggle.setAttribute('aria-expanded', String(open));
});
navLinks.addEventListener('click', event => {
  if (event.target.closest('a')) closeMenu();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && navToggle.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    navToggle.focus();
  }
});
// Load the game only when requested; no animation loop runs on this page.
const playButton = document.getElementById('playGame');
let game;
playButton.addEventListener('click', async () => {
  playButton.disabled = true;
  try {
    game ??= await import('./game.js');
    game.startGame();
    playButton.textContent = 'New game';
  } catch {
    document.getElementById('gameStatus').textContent = 'Could not load the game. Please try again.';
  } finally {
    playButton.disabled = false;
  }
});
