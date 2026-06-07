# Rack Circular Economy Explorer

Interactive browser app for exploring data center rack composition and end-of-life recovery paths, based on `Requirements.md` and `Design.md`.

## Run locally

```bash
cd rack-explorer
npm install
npm run dev
```

`predev` / `prebuild` automatically generate `public/models/rack.glb` (glTF 2.0 rack with named component nodes).

## 3D model (glTF)

The rack is loaded from **`public/models/rack.glb`**. Each clickable component is a **named node** whose `name` matches an `id` in `public/data/components.json` (e.g. `gpu-server-1`).

To use your own photorealistic asset:

1. Export a single `.glb` / `.gltf` from Blender or similar.
2. Name each rack unit node exactly like the catalogue ids.
3. Replace `public/models/rack.glb` (or change `RACK_GLB_URL` in `src/three/rackModelConfig.ts`).
4. Run `npm run dev` again.

Regenerate the built-in PBR rack model:

```bash
npm run generate:model
```

Open the URL shown in the terminal (typically http://localhost:5173).

## Build

```bash
npm run build
npm run preview
```

## Features

- Full-screen 3D rack with clickable components (switch, router, server, GPU server, storage, PDU, cabling, cooling)
- Steering-wheel rotation control (0-360 degrees)
- Component panel with materials and **Circular Economy Life** action
- Split-view detail panel with deconstruction animation, chip drill-down, and recovery recommendations
- Metal Wheel reference data and component catalogue loaded from JSON
- English locale guard and dark data-center theme
