# 2D Shader Tutorial — Syllabus

A guided, hands-on tutorial for learning fragment shaders with a focus on 2D techniques.
Each chapter includes a written lesson, an interactive WebGL playground (HTML/JS/React), and a quiz.

Based on concepts from [The Book of Shaders](https://thebookofshaders.com/) by Patricio Gonzalez Vivo.

---

## Part I — Foundations

### Chapter 01: What Is a Fragment Shader?

**Topics:**
- The GPU rendering pipeline (vertex vs fragment stage)
- What "parallel per-pixel" means
- Why shaders are fast — and why they think differently
- GLSL as a language: types, precision, entry point

**Key Concepts:** `gl_FragCoord`, `gl_FragColor`, parallelism, normalized coordinates

**Interactive App:** Side-by-side: CPU loop coloring pixels vs GPU fragment shader doing the same

---

### Chapter 02: Hello World — Your First Shader

**Topics:**
- The minimal fragment shader (output a solid color)
- Mapping position to color (the classic red/green gradient)
- Uniforms: `u_resolution`, `u_time`, `u_mouse`
- The coordinate system: (0,0) → (1,1)

**Key Concepts:** `uniform`, `vec2`, `vec3`, `vec4`, normalization

**Interactive App:** Live shader editor — type GLSL, see output instantly. Sliders for uniforms.

---

### Chapter 03: Shaping Functions

**Topics:**
- 1D functions as building blocks: `step()`, `smoothstep()`, `pow()`, `sin()`, `cos()`
- Visualizing a function as a graph (y = f(x) drawn as brightness)
- Combining functions: add, multiply, min, max
- Easing curves and animation

**Key Concepts:** `step`, `smoothstep`, `mix`, `clamp`, `fract`, `abs`, `mod`

**Interactive App:** Function plotter — select/combine functions, see the 1D curve and the 2D color field side-by-side

---

### Chapter 04: Color

**Topics:**
- RGB color model in shaders
- HSB/HSL conversion (hue wheels, saturation, brightness)
- Color mixing with `mix()`
- Gradients: linear, radial, angular
- Palette generation with math (`cos`-based palettes)

**Key Concepts:** `mix`, `hsb2rgb`, color space conversion, gradient design

**Interactive App:** Color lab — build gradients and palettes interactively, see generated GLSL

---

## Part II — Drawing in 2D

### Chapter 05: Shapes — Lines, Circles, and Rectangles

**Topics:**
- Drawing with distance: the concept of a distance field
- Rectangles via `step()` on each edge
- Circles via `length()` (Euclidean distance)
- Lines via distance-to-line
- Combining shapes: union, intersection, subtraction

**Key Concepts:** `length()`, `distance()`, `step()`, SDF basics, boolean ops via `min`/`max`

**Interactive App:** Shape builder — compose primitives, toggle SDF visualization vs hard-edge rendering

---

### Chapter 06: Signed Distance Functions (SDF)

**Topics:**
- What an SDF really represents (positive outside, negative inside, zero at boundary)
- Common 2D SDF primitives: circle, box, segment, triangle, polygon
- Combining SDFs: smooth union (`smin`), smooth subtraction
- Rounding, onioning (outlines), repetition
- Anti-aliasing edges with `smoothstep` on distance

**Key Concepts:** SDF, `smin`, rounding, onion, anti-aliased edges

**Interactive App:** SDF playground — drag primitives, see distance field as color map, combine with operations

---

### Chapter 07: 2D Transformations

**Topics:**
- Translate, scale, rotate via coordinate manipulation
- Matrix math: `mat2` rotation matrix
- Transforming the coordinate space (not the shape)
- Combining transforms (order matters)
- Aspect ratio correction

**Key Concepts:** `mat2`, rotation formula, coordinate-space thinking

**Interactive App:** Transform sandbox — apply translate/rotate/scale to a shape, see the matrix and coordinate grid update

---

### Chapter 08: Patterns and Tiling

**Topics:**
- `fract()` for repetition — the tiling trick
- Grid-based patterns: checkerboard, dots, bricks
- Offset rows (brick pattern)
- Combining patterns with shapes
- Truchet tiles

**Key Concepts:** `fract`, `floor`, `mod`, tile index, offset patterns

**Interactive App:** Pattern designer — adjust grid size, offset, shape-per-cell, see infinite tiling

---

## Part III — Procedural Generation

### Chapter 09: Randomness

**Topics:**
- Pseudo-random in shaders: `fract(sin(dot(...)))` hash
- 1D and 2D random
- Random per-tile (using `floor` of coordinates as seed)
- Creating texture from randomness: static, mosaic, Truchet
- Controlling randomness with thresholds

**Key Concepts:** hash functions, `fract(sin(...))`, seeded randomness, deterministic chaos

**Interactive App:** Random explorer — toggle 1D/2D random, animate seed, show per-tile vs per-pixel

---

### Chapter 10: Noise (Perlin / Value / Gradient)

**Topics:**
- Why random isn't enough — the need for smooth randomness
- Value noise: interpolate between random grid values
- Gradient (Perlin) noise: random gradients at grid points
- Simplex noise (concept)
- Using noise for displacement, color, shape distortion

**Key Concepts:** `mix`, interpolation (linear vs smoothstep), gradient noise, octaves preview

**Interactive App:** Noise lab — switch noise type, adjust frequency, see 1D wave and 2D texture, animate with time

---

### Chapter 11: Cellular Noise (Voronoi / Worley)

**Topics:**
- Feature points and distance-to-nearest-point
- Worley/Voronoi algorithm
- F1, F2 distances and their visual difference
- Edge detection in Voronoi
- Applications: stone, cells, cracks, organic textures

**Key Concepts:** Voronoi, Worley, F1/F2, point distribution, edge extraction

**Interactive App:** Voronoi builder — drag/randomize points, visualize F1/F2/edges, animate

---

### Chapter 12: Fractal Brownian Motion (FBM)

**Topics:**
- Layering noise at different frequencies (octaves)
- Lacunarity and gain (persistence)
- FBM for terrain, clouds, fire
- Domain warping: feeding noise into noise
- Turbulence (absolute value of noise)

**Key Concepts:** `fbm()`, octaves, lacunarity, gain, domain warping

**Interactive App:** FBM studio — adjust octaves/lacunarity/gain in real-time, toggle domain warping, see terrain-like output

---

## Part IV — Practical Applications

### Chapter 13: Animation and Time

**Topics:**
- Using `u_time` for motion
- Oscillation patterns with `sin(u_time)`
- Animating SDFs, noise, patterns
- Easing functions applied to time
- Creating loops (modular time)

**Key Concepts:** `u_time`, `mod` for loops, easing, phase offsets

**Interactive App:** Animation timeline — keyframe-style view of time-based shader parameters

---

### Chapter 14: Image Effects and Post-Processing

**Topics:**
- Sampling a texture with `texture2D`
- UV distortion (ripple, warp, zoom)
- Color grading (contrast, brightness, hue shift)
- Vignette, grain, chromatic aberration
- Edge detection (Sobel kernel concept)

**Key Concepts:** `sampler2D`, `texture2D`, UV manipulation, convolution concept

**Interactive App:** Image FX stack — load an image, chain effects, see GLSL for each

---

### Chapter 15: Putting It All Together — Mini Projects

**Topics:**
- Project A: Procedural landscape (FBM + gradients + time)
- Project B: Animated abstract art (SDFs + noise + color palettes)
- Project C: Retro game background (patterns + scrolling + palette cycling)
- Project D: Water/liquid shader (noise + distortion + reflections)

**Key Concepts:** Composition, layering techniques, performance considerations

**Interactive App:** Project gallery — select a project, see annotated source, tweak parameters

---

## Part V — Advanced 2D Techniques

### Chapter 16: 2D Lighting, Soft Shadows & Raymarching

**Topics:**
- 2D Raymarching: stepping along light rays using Signed Distance Fields
- Casting hard vs soft penumbra shadows in 2D
- Point lights, spotlights, and directional ambient light
- Ambient occlusion in 2D distance fields
- Volumetric light rays (God rays in 2D)

**Key Concepts:** 2D Raymarching, `min()` step traversal, penumbra factor, 2D shadow attenuation, ambient occlusion

**Interactive App:** 2D Light studio — move light sources around SDF obstacles, adjust shadow softness and ambient glow in real time

---

### Chapter 17: 2D Fractals, Complex Numbers & KIFS

**Topics:**
- Complex number arithmetic in GLSL ($z_{n+1} = z_n^2 + c$)
- The Mandelbrot Set and Julia Sets
- Smooth coloring and continuous potential formulas
- Orbit traps for organic fractal texturing
- Kaleidoscopic Iterated Function Systems (KIFS) in 2D

**Key Concepts:** Iterative fractals, complex multiplication, escape time, orbit traps, fold symmetry

**Interactive App:** Fractal explorer — smooth zoom into the Mandelbrot/Julia set, adjust max iterations, tweak orbit trap colors

---

### Chapter 18: Multi-Pass Shaders, Ping-Pong Buffers & Simulation

**Topics:**
- The Framebuffer Object (FBO) and render-to-texture
- State persistence in shaders (Ping-pong double buffering)
- Cellular Automata: Conway's Game of Life on the GPU
- Gray-Scott Reaction-Diffusion simulations (organic skin, coral, chemical patterns)
- 2D Fluid smoke trails & mouse velocity advection

**Key Concepts:** FBOs, render textures, ping-pong buffering, discrete laplacian kernel, reaction-diffusion

**Interactive App:** GPU Simulation lab — paint chemicals/cells with mouse, adjust feed/kill rates, toggle Game of Life vs Reaction-Diffusion

---

## Appendix

### A: GLSL Quick Reference
Built-in functions, types, swizzling, precision qualifiers.

### B: WebGL Boilerplate Explained
How the HTML/JS host sets up the shader, passes uniforms, handles resize.

### C: Debugging Shaders
Visualizing intermediate values as color, common pitfalls, mobile/browser differences.

### D: Resources and Further Reading
Links to Shadertoy, GLSL Sandbox, IQ's articles, GPU Gems chapters.

---

## How This Tutorial Works

Each chapter folder contains:

```
chapters/XX-chapter-name/
├── lesson.md          # Written lesson with diagrams and code snippets
├── quiz.md            # 5-10 questions (multiple choice + write-a-shader challenges)
└── app/               # Interactive React + WebGL app
    ├── index.html
    ├── App.jsx
    ├── shaders/       # .frag files used by the lesson
    └── components/    # Reusable shader canvas, editor, sliders
```

### Build Commands

```bash
# Generate a new chapter from template
./scripts/new-chapter.sh 05 "Shapes"

# Build all interactive apps
./scripts/build-apps.sh

# Serve locally with hot reload
./scripts/serve.sh

# Build a specific chapter's app
./scripts/build-apps.sh 05
```

### Templates

Templates live in `_templates/` and are used by the build scripts:
- `_templates/lesson.md.tmpl` — Lesson document skeleton
- `_templates/quiz.md.tmpl` — Quiz skeleton
- `_templates/app/` — React+WebGL app boilerplate (shader canvas, editor, controls)
- `_templates/shader.frag.tmpl` — Base fragment shader with standard uniforms
- `_templates/PROMPT.md` — The AI prompt used to generate each chapter's content

---

## Progression Philosophy

1. **Foundations first** — understand the mental model (parallel, per-pixel, no state)
2. **Math as drawing tools** — every function is a brush stroke
3. **Build complexity from simple parts** — SDFs compose, noise layers, patterns tile
4. **Always interactive** — every concept has a live playground you can break and rebuild
5. **Quiz to consolidate** — test recall and force you to write small shaders from scratch

---

## Prerequisites

- Basic programming knowledge (variables, functions, loops)
- A browser that supports WebGL 2 (all modern browsers)
- No GPU programming experience required — we start from zero
