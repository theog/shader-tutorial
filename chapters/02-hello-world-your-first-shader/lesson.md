# Chapter 02: Hello World — Your First Shader

## Overview

In most languages, "Hello World" prints text to a screen. In shader land, we can't draw text easily — so our hello world is a **color**. This chapter walks you through writing complete shaders from scratch, understanding every line, and learning to communicate between JavaScript and GLSL through uniforms.

By the end you'll be comfortable with the full shader lifecycle: writing the GLSL, passing data in from the host, and using `u_resolution`, `u_time`, and `u_mouse` to build interactive, animated visuals.

---

## Key Concepts

| Concept | Description |
|---------|-------------|
| Uniforms | Values passed from JavaScript to the shader — same for every pixel |
| `u_resolution` | Canvas dimensions in pixels — used for normalization |
| `u_time` | Elapsed time in seconds — the heartbeat of animation |
| `u_mouse` | Cursor position — enables interactivity |
| Coordinate Systems | Pixel space vs normalized space vs centered space |
| `vec` constructors | Building vectors with shorthand: `vec3(0.5)` = `vec3(0.5, 0.5, 0.5)` |

---

## Lesson

### The Full Picture: JavaScript + GLSL

A shader doesn't run on its own. It needs a **host** — JavaScript code that:
1. Creates a WebGL context on a `<canvas>`
2. Compiles the shader source code
3. Uploads uniform values each frame
4. Draws a full-screen quad so the fragment shader covers every pixel

In our tutorial apps, this boilerplate is handled for you. But it's important to know that every `uniform` variable you declare in GLSL must be **set from JavaScript** — otherwise it stays at zero.

```javascript
// JavaScript side (simplified)
const timeLocation = gl.getUniformLocation(program, 'u_time');
gl.uniform1f(timeLocation, performance.now() / 1000.0);

const resLocation = gl.getUniformLocation(program, 'u_resolution');
gl.uniform2f(resLocation, canvas.width, canvas.height);
```

### Hello World: A Solid Color

The absolute minimum shader:

```glsl
precision mediump float;

void main() {
    gl_FragColor = vec4(0.0, 0.8, 0.6, 1.0);
}
```

Every pixel outputs teal. Simple, but it proves the pipeline works. Notice:
- `precision mediump float;` — required precision declaration
- `void main()` — the entry point (like `main` in C)
- `gl_FragColor` — the output. You assign, the GPU displays.
- No `return` statement — you write to the built-in variable directly

### Coordinate Spaces

You'll work with three coordinate systems constantly:

**1. Pixel Space** (raw `gl_FragCoord`)
```
(0, 0) at bottom-left
(800, 600) at top-right (for an 800×600 canvas)
```

**2. Normalized Space** (divided by resolution)
```glsl
vec2 st = gl_FragCoord.xy / u_resolution.xy;
// (0.0, 0.0) at bottom-left
// (1.0, 1.0) at top-right
```

**3. Centered Space** (remapped to -1 → +1)
```glsl
vec2 st = (gl_FragCoord.xy / u_resolution.xy) * 2.0 - 1.0;
// (0.0, 0.0) at center
// (-1.0, -1.0) at bottom-left
// (1.0, 1.0) at top-right
```

Centered space is useful for radial effects. You'll often also correct the aspect ratio:

```glsl
vec2 st = gl_FragCoord.xy / u_resolution.xy;
st.x *= u_resolution.x / u_resolution.y;  // Circles stay circular
```

### The Three Essential Uniforms

#### `u_resolution` — knowing your canvas size

```glsl
precision mediump float;
uniform vec2 u_resolution;

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    gl_FragColor = vec4(st, 0.0, 1.0);
}
```

Without `u_resolution`, you can't normalize coordinates. This is the most fundamental uniform.

#### `u_time` — making things move

```glsl
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;

    // Pulse the entire screen brightness
    float pulse = 0.5 + 0.5 * sin(u_time * 2.0);

    gl_FragColor = vec4(vec3(pulse), 1.0);
}
```

`u_time` is a float that increases every frame (typically in seconds). Combined with `sin()`, it creates oscillation. Combined with offsets per-pixel, it creates waves.

#### `u_mouse` — responding to the user

```glsl
precision mediump float;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    vec2 mouse = u_mouse / u_resolution;

    // Color based on distance to mouse
    float d = distance(st, mouse);
    vec3 color = vec3(1.0 - d);

    gl_FragColor = vec4(color, 1.0);
}
```

`u_mouse` arrives in pixel coordinates (matching `gl_FragCoord`'s space), so divide by resolution to normalize.

### Vector Constructors — Shorthand That Saves Time

GLSL is flexible about constructing vectors:

```glsl
vec3(1.0, 0.0, 0.0)   // Explicit: red
vec3(0.5)              // Shorthand: vec3(0.5, 0.5, 0.5) — gray
vec4(color, 1.0)       // Build vec4 from a vec3 + float
vec2(st.x, 0.0)       // Mix and match components
```

This becomes natural fast. The key rule: the number of components on the right must match the vector size on the left.

### Building Gradients

Gradients are the first "real" visual you'll build. They demonstrate how position maps to color:

```glsl
precision mediump float;
uniform vec2 u_resolution;

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;

    // Linear gradient from color A to color B across X
    vec3 colorA = vec3(0.1, 0.0, 0.3);  // dark purple
    vec3 colorB = vec3(1.0, 0.5, 0.0);  // orange

    vec3 color = mix(colorA, colorB, st.x);

    gl_FragColor = vec4(color, 1.0);
}
```

`mix(a, b, t)` linearly interpolates: when `t = 0.0` you get `a`, when `t = 1.0` you get `b`, and values in between blend smoothly.

### Combining Everything: An Animated Gradient

```glsl
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    vec2 mouse = u_mouse / u_resolution;

    // Shift gradient direction over time
    float angle = u_time * 0.5;
    float gradient = st.x * cos(angle) + st.y * sin(angle);

    // Use mouse X to control hue range
    vec3 colorA = vec3(mouse.x, 0.2, 0.8);
    vec3 colorB = vec3(0.9, mouse.y, 0.1);

    vec3 color = mix(colorA, colorB, gradient);

    gl_FragColor = vec4(color, 1.0);
}
```

This uses all three uniforms: resolution for normalization, time for rotation, mouse for color control. Each pixel independently evaluates the same formula with its own `gl_FragCoord`.

---

## Exercises

1. **Diagonal split** — Write a shader where the top-right triangle is white and the bottom-left triangle is black (hint: compare `st.x` to `st.y` using `step()`)
2. **Radial gradient** — Create a gradient that goes from white at the center to black at the edges (hint: use `distance()` from `vec2(0.5)`)
3. **Time-shifted gradient** — Make a horizontal gradient that scrolls continuously to the right using `fract(st.x + u_time * 0.2)`

---

## Summary

Your shader needs a host (JavaScript/WebGL) that compiles it, passes uniforms, and triggers rendering. The three essential uniforms — `u_resolution`, `u_time`, `u_mouse` — give you space, time, and interactivity. With `mix()` and basic math on normalized coordinates, you can already build animated gradients and interactive effects. Every line of GLSL runs identically across all pixels — only `gl_FragCoord` differs.

**Next up:** [Chapter 03: Shaping Functions](../03-shaping-functions/lesson.md)
