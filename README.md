# Pranjal Saini portfolio

A React and Three.js portfolio with a scroll-guided flight past India Gate, Galgotias University's AI & Data Science Block, a project tower and a stationary Himalayan photographic backdrop.

Deadpool reclines on the main extruded PRANJAL lettering. The site includes day/night lighting, a camera-motion control, reduced-motion support, project interactions and contact links. Other character models are not included.

## GitHub Pages

Pages serves the repository root from main. The root index.html and assets/ directory are the production build. .nojekyll keeps Pages from processing the static files.

## Editing and rebuilding

Use Node.js 22.12 or newer.

- Install dependencies with npm install (or npm ci once the lockfile is present).
- Run npm run dev to edit the source in portfolio/.
- Run npm run build to update the root index.html and assets/ files.
- Commit the source and generated files together, then push main.

The build script compiles into the ignored .build/ folder, then copies only the production HTML and assets into the repository root. It replaces old generated bundles while preserving authored assets and source files.

The matching source assets live in portfolio/public/assets/. Git stores matching asset contents once even though both source and deployment paths are checked in. node_modules, local environment files, unused models, Blender source and temporary review files are excluded.

## Project presentation

The GIT PUSHer workflow is an interactive explanation. The aim target is explicitly a browser sketch of the Unity project's core mechanic. The JobServlet excerpt is adapted for display from the Online-Job-Portal repository. Airport chart values come from the DataAnalytics repository CSV, and are project dataset values, not a claim about current airport operations.

## Assets and credits

- Deadpool model: Sheharyar76, CC BY 4.0. https://sketchfab.com/3d-models/deadpool-fully-rigged-with-facial-rig-bb4be48749df43f0a6899aeabec1cbdd . Pose, materials and texture resolution adapted.
- Himalayan photo: Eugene Ga, Unsplash License. https://unsplash.com/photos/infssQ2tjeM
- Free Poliigon concrete 7856: https://www.poliigon.com/texture/large-matte-panel-with-tie-hole-concrete-texture/7856 . Used as part of the rendered scene; not a standalone texture distribution.
- Poly Haven Industrial Sunset 02 Pure Sky HDRI, CC0: https://polyhaven.com/a/industrial_sunset_02_puresky
- Architecture is an authored interpretation, not a surveyed reconstruction.

## Validation

The production build is checked before release. The 3D module loads separately from the content; rendering stops while idle or hidden, and device resolution is capped. A failed WebGL scene leaves the HTML content accessible.
