const board = document.getElementById('gameBoard');
const stats = document.getElementById('gameStats');
const status = document.getElementById('gameStatus');
const symbols = ['★', '◆', '●', '▲', '■', '♥'];
const names = ['star', 'diamond', 'circle', 'triangle', 'square', 'heart'];
let first = null;
let second = null;
let moves = 0;
let pairs = 0;

function show(card, visible) {
  card.textContent = visible ? symbols[Number(card.dataset.symbol)] : '?';
  card.setAttribute('aria-label', `Card ${Number(card.dataset.position) + 1}: ${visible ? names[Number(card.dataset.symbol)] : 'hidden'}`);
  card.classList.toggle('revealed', visible);
}

export function startGame() {
  const deck = [...symbols.keys(), ...symbols.keys()];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  first = second = null;
  moves = pairs = 0;
  stats.textContent = '0 moves · 0 / 6 pairs';
  status.textContent = 'Game started. Choose two cards. Use Tab and Enter, or tap.';
  board.replaceChildren(...deck.map((symbol, index) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'memory-card';
    card.dataset.symbol = symbol;
    card.dataset.position = index;
    show(card, false);
    return card;
  }));
  board.hidden = false;
  board.firstElementChild.focus({ preventScroll: true });
}

// A single handler: no clocks, frames, or work while idle/offscreen.
board.addEventListener('click', event => {
  const card = event.target.closest('.memory-card');
  if (!card || card === first || card === second || card.dataset.matched) return;
  if (second) {
    show(first, false);
    show(second, false);
    first = second = null;
  }
  show(card, true);
  if (!first) {
    first = card;
    status.textContent = `${names[Number(card.dataset.symbol)]} revealed. Choose another card.`;
    return;
  }
  moves++;
  if (first.dataset.symbol === card.dataset.symbol) {
    for (const match of [first, card]) {
      match.dataset.matched = 'true';
      match.setAttribute('aria-disabled', 'true');
      match.classList.add('matched');
    }
    first = null;
    pairs++;
    status.textContent = pairs === 6 ? `You won in ${moves} moves! Select New game to play again.` : 'A match! Choose another pair.';
  } else {
    second = card;
    status.textContent = 'No match. Choose another card to continue; these two will turn back over.';
  }
  stats.textContent = `${moves} ${moves === 1 ? 'move' : 'moves'} · ${pairs} / 6 pairs`;
});
