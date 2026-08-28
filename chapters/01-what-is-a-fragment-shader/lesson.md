# Chapter 01: What Is a Fragment Shader?

## Overview

Imagine a factory where a million workers each paint one tiny tile on a massive mosaic — simultaneously. No worker can see what the others are doing. Each one just gets told their position and produces a color. That's a fragment shader.

This chapter introduces the mental model you need before writing any shader code: how GPUs work differently from CPUs, what "parallel per-pixel" means, and the basic structure of the GLSL language you'll be writing in.

---

## Key Concepts

| Concept | Description |
|---------|-------------|
| Fragment Shader | A small program that runs once per pixel, deciding its color |
| GPU Parallelism | Thousands of shader instances run simultaneously, one per pixel |
| `gl_FragCoord` | Built-in variable — the pixel's position in screen coordinates |
| `gl_FragColor` | Built-in output — the RGBA color this pixel should be |
| Normalized Coordinates | Remapping pixel position to 0.0–1.0 range for resolution independence |
| GLSL | OpenGL Shading Language — C-like, typed, no loops over pixels needed |

---

## Lesson

### The CPU vs GPU Mental Model

On a CPU, if you wanted to color a 800×600 image, you'd write something like:

```javascript
// CPU approach: sequential, one pixel at a time
for (let y = 0; y < 600; y++) {
    for (let x = 0; x < 800; x++) {
        pixels[y][x] = computeColor(x, y);
    }
}
```

That's 480,000 iterations, one after another. Even at GHz speeds, this is slow for real-time graphics.

A GPU flips this on its head. Instead of one worker doing 480,000 jobs sequentially, it launches 480,000 workers (threads) at once. Each worker runs the **same program** but with a different pixel coordinate. There's no loop. There's no concept of "the pixel next to me." Each thread is blind to the others.

Your fragment shader is that program — the instructions for a single worker.

### The Rendering Pipeline (Simplified)

The full GPU pipeline has many stages, but for 2D shaders, we only care about two:

```
Vertices → [Vertex Shader] → Triangles → Rasterization → [Fragment Shader] → Pixels
```

1. **Vertex Shader** — transforms geometry (positions of triangle corners)
2. **Rasterization** — the GPU figures out which pixels each triangle covers
3. **Fragment Shader** — for each covered pixel, your code decides the color

In our tutorial apps, we draw a single full-screen rectangle (two triangles covering the entire canvas). That means the fragment shader runs for every pixel on screen — giving us a blank canvas to paint on with math.

### Your First Fragment Shader

Here's the absolute minimum:

```glsl
precision mediump float;

void main() {
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}
```

This outputs pure red for every pixel. `vec4(R, G, B, A)` — values from 0.0 to 1.0.

Not very interesting. Let's use **position**:

```glsl
precision mediump float;

uniform vec2 u_resolution;

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    gl_FragColor = vec4(st.x, st.y, 0.0, 1.0);
}
```

Now each pixel gets a different color based on where it is:
- Bottom-left (0,0) → black
- Bottom-right (1,0) → red
- Top-left (0,1) → green
- Top-right (1,1) → yellow

This is the classic "hello world" of shaders — a red/green gradient. You'll see this everywhere.

### Breaking Down the Syntax

```glsl
precision mediump float;       // Required: set floating-point precision
```

GLSL runs on hardware that offers different precision levels. `mediump` is the standard choice for fragment shaders — good enough for most 2D work and works on mobile.

```glsl
uniform vec2 u_resolution;     // Input from JavaScript: canvas width/height in pixels
```

A `uniform` is a value passed in from the outside (your JavaScript host). It's the same for every pixel — hence "uniform." Common uniforms:
- `u_resolution` — canvas size in pixels
- `u_time` — seconds since the shader started
- `u_mouse` — cursor position in pixels

```glsl
vec2 st = gl_FragCoord.xy / u_resolution.xy;
```

`gl_FragCoord` is the pixel's position (in actual pixels, like 347.5, 201.5). Dividing by resolution normalizes it to 0.0–1.0 regardless of canvas size. We call this `st` by convention (like UV coordinates).

```glsl
gl_FragColor = vec4(st.x, st.y, 0.0, 1.0);
```

Output: the pixel's final color. That's it. No return statement needed — you write to this built-in variable.

### GLSL Types You Need Now

| Type | What it is | Example |
|------|-----------|---------|
| `float` | Single number | `0.5` |
| `vec2` | Two floats | `vec2(0.5, 1.0)` |
| `vec3` | Three floats (often RGB) | `vec3(1.0, 0.0, 0.5)` |
| `vec4` | Four floats (often RGBA) | `vec4(1.0, 0.0, 0.5, 1.0)` |

Vectors support **swizzling** — accessing components by name:
```glsl
vec4 color = vec4(0.2, 0.5, 0.8, 1.0);
color.rgb   // vec3(0.2, 0.5, 0.8)
color.xy    // vec2(0.2, 0.5)
color.r     // 0.2 (same as color.x)
```

### The Constraints

Fragment shaders have strict rules:

1. **No shared state** — you can't read what another pixel computed
2. **No persistent memory** — each frame starts fresh
3. **No recursion** — the call stack is limited
4. **No dynamic arrays** — memory is pre-allocated
5. **No print/debug** — you debug by outputting color (more on this in the appendix)

These constraints exist because thousands of instances run in parallel. But they also force elegant solutions — you'll learn to think in pure functions of position and time.

### Adding Time

```glsl
precision mediump float;

uniform vec2 u_resolution;
uniform float u_time;

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;

    // Oscillate blue channel with time
    float blue = 0.5 + 0.5 * sin(u_time);

    gl_FragColor = vec4(st.x, st.y, blue, 1.0);
}
```

Now the shader animates — the blue channel pulses as time passes. Every pixel still runs independently, but they all read the same `u_time` value, creating coherent animation.

---

## Exercises

1. **Modify the gradient** — Change the hello-world shader so red increases from top to bottom instead of left to right (hint: swap which component uses `st.x` vs `st.y`)
2. **Single color pulse** — Make the entire screen pulse between black and white using `sin(u_time)`
3. **Diagonal gradient** — Create a gradient that goes from black (bottom-left corner) to white (top-right corner) using `(st.x + st.y) / 2.0`

---

## Summary

A fragment shader is a tiny program that runs per-pixel in parallel on the GPU. It receives position (`gl_FragCoord`) and uniform inputs (`u_resolution`, `u_time`, `u_mouse`), and outputs a color (`gl_FragColor`). The key mental shift: you don't loop over pixels — you write the logic for one pixel, and the GPU runs it for all of them simultaneously.

**Next up:** [Chapter 02: Hello World — Your First Shader](../02-hello-world-your-first-shader/lesson.md)
