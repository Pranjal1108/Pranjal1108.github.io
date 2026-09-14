# Pranjal Saini portfolio

A dependency-free portfolio with slate and sea-green glass panels and three original arcade games integrated into the hero.

## Preview and deployment

Serve this directory with a static HTTP server. No install, build, API key or framework is needed. Open index.html through HTTP so game modules can load.

Changes are saved on revision/glass-arcade. The owner handles GitHub Pages deployment. Publish the repository root when ready. No custom domain has been configured.

## Arcade

- Alien Shift: clear three waves with three lives. Left/Right or A/D to move, Space to fire. Drag on the canvas to move and fire.
- Skyline Run: an automatic rooftop runner with eight platforms and collectible gems. Space, Up, W, or a tap/click jumps. Reach the final flag. Falling costs a life and restarts from the last rooftop.
- Pocket Circuit: a 45-second traffic-dodging sprint with three lives. Left/Right or A/D to steer, or drag on the canvas.

P or Pause pauses each game. Escape or Exit returns to the selected card. The games pause when hidden, offscreen, inactive or resized; resume is explicit. Replay restarts the same game. Scores are held only in memory.

## Cards and performance

Three glass cards cycle every 4.2 seconds with CSS flip transitions. Previous/Next and Pause rotation controls are available. Rotation pauses on hover, keyboard focus, gameplay, hidden tabs and when the deck is offscreen. Reduced-motion preferences disable automatic cycling and transitions.

The initial page loads local HTML, CSS, one small deferred script and an SVG favicon. Game code loads only after Play. The two extra games share a small module; all three share one canvas lifecycle with a 1.5 pixel-density cap. No framework, external font, tracker, scroll listener, image download or score storage is used. Rendering stops whenever a game is paused or exited. Traffic, projectiles and level geometry are bounded.

Main content panes use an 8px backdrop blur over static colour shapes. Moving cards use translucent fills and highlights without animated blur filters. Reduced-transparency preferences receive opaque surfaces. The retained LittleUFO.glb is never loaded.

## Verification

Run: node --test tests/*.test.mjs

Tests cover movement, collisions, complete winning/losing runs, responsive coordinates, score state, and pause/resume/exit rendering. Check browser keyboard/pointer controls and responsive layouts after UI changes.

Privacy and terms pages describe the actual site behaviour. Keep them current if tracking, forms or storage change.
