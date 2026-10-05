// Choose once per page load, randomly excluding the previous palette.
export const palettes = ['sage','slate','plum','clay','teal'];
let choices = palettes;
try {
 const previous = localStorage.getItem('portfolio-palette');
 choices = palettes.filter(palette => palette !== previous);
} catch { /* Storage may be unavailable; use all palettes. */ }
const selected = choices[Math.floor(Math.random() * choices.length)];
try {
 localStorage.setItem('portfolio-palette', selected);
} catch { /* The random theme still works without storage. */ }
document.documentElement.dataset.palette = selected;
export function paletteColor(hex) {
 return getComputedStyle(document.documentElement).getPropertyValue('--tone-' + hex.slice(1).toLowerCase()).trim() || hex;
}
