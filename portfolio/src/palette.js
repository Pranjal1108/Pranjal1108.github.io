// Choose once per document, outside React renders. Reloads advance the palette.
export const palettes = ['sage','slate','plum','clay','teal'];
let index = Math.floor(Math.random() * palettes.length);
try {
 const previous = localStorage.getItem('portfolio-palette');
 const last = palettes.indexOf(previous);
 if (last >= 0) index = (last + 1) % palettes.length;
 localStorage.setItem('portfolio-palette', palettes[index]);
} catch { /* Storage may be unavailable; retain the random selection. */ }
document.documentElement.dataset.palette = palettes[index];
export function paletteColor(hex) {
 return getComputedStyle(document.documentElement).getPropertyValue('--tone-' + hex.slice(1).toLowerCase()).trim() || hex;
}
