# Pranjal Saini — Portfolio

A static portfolio with an on-demand, keyboard-accessible memory game. Deploy the repository root with GitHub Pages; no build or dependencies are required.

## Performance

- HTML, one stylesheet, and a deferred script are the only initial page resources.
- No third-party scripts, icon fonts, web fonts, scroll handlers, animation loops, or backdrop filters.
- `game.js` loads only after Play is selected. A single click handler updates the board; there are no timers or background animations.
- Scrolling and anchor links use native browser behavior. Portfolio content stays visible when JavaScript is unavailable.
- `LittleUFO.glb` is an existing source asset retained for future use; the page does not load it.

## Game

Select two cards to find a matching pair. A mismatch stays visible until a different card is selected, so there is no time pressure. Find six pairs to win; New game shuffles and resets the board. Use Tab and Enter/Space or tap/click. No scores or personal data are sent to a server.

## Manual checks

Serve this folder with any static HTTP server (dynamic imports need HTTP). Check desktop and narrow mobile layouts, menu toggle/link closing/Escape, keyboard focus, mismatches, matches, six-pair completion, and restart. Verify the browser requests `game.js` only after Play and reports no console errors.
