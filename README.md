# Pranjal Saini — Portfolio

An editorial portfolio with a procedural chrome sculpture, viewport-wide iridescent directional trails, a kinetic grid and breathing particle sphere, GSAP scroll choreography, and a clean project list. Light and dark modes cover both the page and WebGL scenes, with the selected mode remembered locally.

## Development

Requires Node.js 20.19+ or 22.12+.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

```sh
pnpm build
pnpm preview
```

Source lives in `portfolio/`. The build script generates `.build/` and updates the root `index.html` and `assets/` for GitHub Pages. Pages serves the repository root on `main`; commit the source and generated files together. No backend or API keys are required.

## Content and behavior

Portfolio content lives in `src/portfolio.json`; the main composition lives in `src/App.jsx`. Continuous pointer and camera values stay outside React state. Below-the-fold WebGL loads near the viewport, rendering pauses offscreen and in inactive tabs, and pixel density adapts when frames run slowly. Mobile uses fewer points and a smaller flow texture; desktop-only pinning is disabled at narrow widths. Reduced motion renders a static scene, with an explicit pause button for everyone. Compressed posters keep the visual composition usable if WebGL fails. There is no blocking loader and no heavy video or external model request.

## Sources and licensing

- SmoothUI Liquid Metal by Eduardo Calvo, discovered through 21st.dev: https://21st.dev/@educalvolpz/components/liquid-metal — noise functions reused in `src/metal-noise.js`, MIT notice in `licenses/smoothui.txt`.
- React Bits Magnet: https://reactbits.dev/animations/magnet — proximity algorithm adapted for imperative GSAP transforms.
- React Bits Grid Distortion: https://reactbits.dev/backgrounds/grid-distortion — relaxing DataTexture displacement approach adapted for a rendered 3D scene. React Bits notice (MIT plus Commons Clause) retained in `licenses/react-bits.txt`.
- GSAP ScrollTrigger / matchMedia: https://gsap.com/docs/v3/Plugins/ScrollTrigger/ and https://gsap.com/docs/v3/GSAP/gsap.matchMedia()/.
- ThreeUI cinematic gallery: https://threeui.com/browse/tag/cinematic — composition research, no source copied.
- Magnific: https://www.magnific.com/ — asset workflow research; no account or paid asset required for this procedural design.

Legacy flight files and assets are retained, but are not imported or requested by the redesigned experience.


Cursor motion uses React Bits Splash Cursor, adapted with idle/hidden suspension, resource cleanup, capped pixel ratio, 512px desktop dye resolution and reduced mobile quality. The trail uses directional advection with curling and pressure-driven eddies disabled. Dye dissipates quickly, a smooth global fade clears all fluid buffers after one second of pointer inactivity, and the display shader applies translucent thin-film iridescence. The sculpture responds with stronger damped tilt, banking and a small positional lean. The 3D scenes retain their directional hover refraction and morphing alongside the fluid trail. The trail radius is now half the initial Splash Cursor size (25% narrower than the previous revision), with a tighter, stronger 3D refraction area. Source: https://github.com/DavidHDev/react-bits/blob/main/src/content/Animations/SplashCursor/SplashCursor.jsx . React Bits and the upstream Pavel Dobryakov fluid solver license notices are in `licenses/`.
