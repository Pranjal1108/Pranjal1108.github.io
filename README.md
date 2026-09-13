# Pranjal Saini portfolio

A static personal portfolio with a slate and sea-green glass design. Alien Shift is an original pixel arcade shooter integrated into the hero.

## Preview and deployment

Serve this directory with a static HTTP server. No install, build, API key or framework is needed. Open index.html through HTTP so the game modules can load.

This revision is prepared on a separate branch. The owner will deploy it to GitHub Pages. Publish the repository root when ready. No custom domain has been configured.

## Game

Clear three waves of aliens with three lives. Arrow keys or A/D move; Space fires. Touch or mouse: hold and drag on the canvas to move and fire. P or the Pause button pauses. Escape or Exit returns to the portfolio.

The game automatically pauses when the window or tab loses visibility, when the hero leaves view or when the layout changes. Resume is explicit. Scores exist only in memory; there is no storage or server submission.

## Performance and assets

The initial page loads one CSS file, one small deferred script and the SVG favicon. Two small game modules load on demand. Rendering is capped at 1.5 device pixels per CSS pixel and stops when not playing. Enemy and projectile counts are bounded. There are no third-party fonts, scripts, trackers, images or scroll listeners. Only the small decorative hero pane uses backdrop blur; scrolling content uses static translucent fills and borders.

The favicon and pixel artwork are local SVG/canvas shapes. The existing LittleUFO.glb asset is retained but never loaded by the page.

## Pages

- index.html: portfolio and arcade
- privacy.html: actual site and game data handling, hosting and email links
- terms.html: use of the portfolio and free game

Keep the privacy page in sync if hosting, analytics, forms or storage are changed.
