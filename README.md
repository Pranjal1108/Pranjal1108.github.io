# Pranjal Saini — Portfolio

An editorial portfolio with a procedural chrome sculpture, refractive pointer trails, a kinetic grid and breathing particle sphere, GSAP scroll choreography, and a clean project list. Light and dark modes cover both the page and WebGL scenes, with the selected mode remembered locally.

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

Pointer interaction uses an advected velocity field to smear and refract actual scene pixels. The hero media plane spans the window width; there is no colored cursor overlay. Visual behavior was studied from https://lusion.co without reusing its proprietary source.
