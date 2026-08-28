# 2D Shader Tutorial & Interactive Companion

An interactive, browser-based tutorial series for learning 2D fragment shaders (GLSL), inspired by [The Book of Shaders](https://thebookofshaders.com/) by Patricio Gonzalez Vivo & Jen Lowe.

Every chapter includes:
- 🎮 **Interactive WebGL Playground** (Live GLSL code editor, real-time compilation, uniform controls, preset examples)
- 📖 **Written Lesson** (Concept deep-dives, diagrams, mathematical intuition)
- ❓ **Concept Quiz** (Multiple choice, true/false, and code challenges)

---

## 🚀 Quick Start (Local Development)

The entire project is built with static, client-side React + WebGL. No build steps, bundlers, or `npm install` required.

Run the local server script:
```bash
./scripts/serve.sh
```
Then open your browser to `http://localhost:8080`.

You can also serve a single chapter directly:
```bash
./scripts/serve.sh 01
```

---

## 📚 Curriculum Roadmap

Full curriculum outline is documented in [`SYLLABUS.md`](./SYLLABUS.md).

| Chapter | Title | Status | Key Concepts |
| :--- | :--- | :---: | :--- |
| **01** | **What Is a Fragment Shader?** | ✅ Ready | `gl_FragCoord`, `gl_FragColor`, Parallel execution |
| **02** | **Hello World — Your First Shader** | ✅ Ready | `uniform`, `u_resolution`, `u_time`, `u_mouse`, Gradients |
| **03** | **Shaping Functions** | ✅ Ready | `step()`, `smoothstep()`, `pow()`, `fract()`, `abs()` |
| **04** | **Colors & Color Spaces** | ✅ Ready | HSB/HSL to RGB, Polar coordinates, Cosine palettes |
| **05** | **2D Shapes & Signed Distance Fields** | 🗓️ Planned | SDFs, `length()`, Circles, Rectangles, Boolean operations |
| **06** | **Advanced SDFs & CSG Geometry** | 🗓️ Planned | `smin`, Rounding, Onion outlines, Smooth Booleans |
| **07** | **Matrices & Coordinate Transforms** | 🗓️ Planned | `mat2`, Rotation, Translation, Scale, Space deformation |
| **08** | **Patterns & Tiling** | 🗓️ Planned | Grid tiling, Brick offsets, Truchet tiles |
| **09** | **Randomness & Hash Functions** | 🗓️ Planned | Pseudo-random hashing, 1D & 2D Value noise |
| **10** | **Perlin & Gradient Noise** | 🗓️ Planned | Continuous noise, Bilinear smoothing, Terrain distortion |
| **11** | **Cellular & Worley Noise** | 🗓️ Planned | Voronoi diagrams, Organic textures, Metric distances |
| **12** | **Fractional Brownian Motion (fBm)** | 🗓️ Planned | Octaves, Domain warping, Procedural terrain/clouds |
| **13** | **Animation Dynamics & Time** | 🗓️ Planned | Looping time, Easing curves, Kinetic wave propagation |
| **14** | **Image Effects & Post-Processing** | 🗓️ Planned | UV distortion, Chromatic aberration, Bloom, Blur filters |
| **15** | **2D Showcase Projects** | 🗓️ Planned | Generative landscapes, Plasma, Procedural backgrounds |
| **16** | **2D Lighting & Soft Shadows** | 🗓️ Planned | 2D Raymarching, Penumbra soft shadows, Ambient occlusion |
| **17** | **2D Fractals & Complex Numbers** | 🗓️ Planned | Mandelbrot/Julia sets, Orbit traps, KIFS folding |
| **18** | **Multi-Pass Shaders & Simulation** | 🗓️ Planned | FBO double buffering, Game of Life, Reaction-Diffusion |

---

## 🛠️ Scaffolding New Chapters

To scaffold a new chapter from templates:
```bash
./scripts/new-chapter.sh 05 "2D Shapes & Signed Distance Fields"
```

To validate that all chapter assets and files are present:
```bash
./scripts/build-apps.sh
```

---

## 🌐 Deploying to GitHub Pages

This repository includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that automatically deploys to GitHub Pages whenever you push to `main`.

1. Push this repository to GitHub.
2. In your GitHub repository, go to **Settings** → **Pages**.
3. Under **Build and deployment** → **Source**, select **GitHub Actions**.
4. The workflow will automatically publish the site!
