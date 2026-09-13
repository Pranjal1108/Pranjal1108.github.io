export const ALIEN_SIZE = 22;
export const SHIP_WIDTH = 28;
export const SHIP_HEIGHT = 18;
export const clamp = (value, low, high) => Math.max(low, Math.min(value, high));
export const overlaps = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

function formation(game) {
  const columns = game.width < 600 ? 6 : 8;
  const spacing = Math.min(64, (game.width - 60) / columns);
  const left = (game.width - (columns - 1) * spacing - ALIEN_SIZE) / 2;
  game.aliens = Array.from({length: columns * 3}, (_, i) => ({
    x: left + (i % columns) * spacing, y: 105 + Math.floor(i / columns) * 38,
    w: ALIEN_SIZE, h: 18,
  }));
  game.direction = 1;
  game.shots = [];
  game.enemyShots = [];
  game.enemyCooldown = 1.1;
}

export function createGame(width, height) {
  const game = {width, height, player: {x: (width-SHIP_WIDTH)/2, y: height-115, w: SHIP_WIDTH, h: SHIP_HEIGHT},
    score: 0, lives: 3, wave: 1, status: 'playing', cooldown: 0, invulnerable: 1};
  formation(game);
  return game;
}

export function resizeGame(game, width, height) {
  const sx = width / game.width, sy = height / game.height;
  for (const item of [...game.aliens, ...game.shots, ...game.enemyShots]) {
    item.x = clamp(item.x * sx, 12, width - item.w - 12);
    item.y *= sy;
  }
  game.player.x = clamp(game.player.x * sx, 12, width-SHIP_WIDTH-12);
  game.player.y = height-115;
  game.width = width;
  game.height = height;
}

export function stepGame(game, elapsed, input = {}, random = Math.random) {
  if (game.status !== 'playing') return;
  const dt = clamp(elapsed, 0, .05);
  game.cooldown = Math.max(0, game.cooldown-dt);
  game.invulnerable = Math.max(0, game.invulnerable-dt);
  const player = game.player;
  if (Number.isFinite(input.targetX)) player.x = input.targetX-player.w/2;
  else player.x += (Number(Boolean(input.right))-Number(Boolean(input.left))) * 340 * dt;
  player.x = clamp(player.x, 12, game.width-player.w-12);
  if (input.fire && game.cooldown === 0 && game.shots.length < 10) {
    game.shots.push({x: player.x+player.w/2-2,y: player.y-10,w: 4,h: 12});
    game.cooldown = .18;
  }
  const speed = 22+game.wave*8+(24-game.aliens.length)*1.3;
  if (game.aliens.some(a => a.x+speed*dt*game.direction < 14 || a.x+a.w+speed*dt*game.direction > game.width-14)) {
    game.direction *= -1;
    for (const alien of game.aliens) alien.y += 16;
  }
  for (const alien of game.aliens) alien.x += speed*dt*game.direction;
  for (const shot of game.shots) shot.y -= 480*dt;
  for (const shot of game.enemyShots) shot.y += (170+game.wave*20)*dt;
  for (const shot of game.shots) {
    const index = game.aliens.findIndex(alien => overlaps(shot,alien));
    if (index !== -1) { game.aliens.splice(index,1); shot.dead = true; game.score += 10; }
  }
  game.shots = game.shots.filter(s => !s.dead && s.y+s.h > 65);
  game.enemyCooldown -= dt;
  if (game.enemyCooldown <= 0 && game.aliens.length && game.enemyShots.length < 12) {
    const alien = game.aliens[Math.floor(random()*game.aliens.length)];
    game.enemyShots.push({x: alien.x+alien.w/2-2, y: alien.y+alien.h, w: 4, h: 10});
    game.enemyCooldown = Math.max(.35,1.1-game.wave*.15);
  }
  for (const shot of game.enemyShots) {
    if (overlaps(shot,player)) {
      shot.dead = true;
      if (game.invulnerable === 0) { game.lives--; game.invulnerable = 1.2; }
    }
  }
  game.enemyShots = game.enemyShots.filter(s => !s.dead && s.y < game.height-85);
  if (game.lives <= 0 || game.aliens.some(a => a.y+a.h >= player.y)) { game.status = 'lost'; return; }
  if (!game.aliens.length) {
    if (game.wave === 3) game.status = 'won';
    else { game.wave++; formation(game); game.invulnerable = 1.2; }
  }
}
