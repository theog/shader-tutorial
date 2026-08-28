# Chapter 02: Coordinate Spaces, Host-Device Interface & Uniforms

## Overview

In traditional software development, input and output are handled via console streams, file systems, or event listeners. In graphics hardware, input is supplied from the CPU host to the GPU device through **Uniforms**, and the output is a continuous field of light rendered across 2D coordinate spaces.

This chapter explores how the host application (JavaScript/WebGL) streams data into the GPU shader pipeline, breaks down the geometry of 2D coordinate spaces, and demonstrates how to build dynamic, interactive visuals using resolution, time, and cursor inputs.

---

## Key Concepts

| Concept | Description |
|---|---|
| **Uniform Buffers** | Read-only global data streams transmitted from the CPU host to all GPU threads per frame |
| **Normalized UV Space** | The standard unit coordinate system where $(0.0, 0.0)$ is bottom-left and $(1.0, 1.0)$ is top-right |
| **Centered Coordinate Space** | Remapped coordinates $[-1.0, +1.0]$ with $(0.0, 0.0)$ located at the physical canvas center |
| **Aspect Ratio Compensation** | Adjusting non-square coordinate domains so geometric primitives maintain circularity and scale |
| **Temporal Modulation (`u_time`)** | Driving dynamic continuous motion using floating-point elapsed time |
| **Spatial Interaction (`u_mouse`)** | Mapping user cursor input into interactive localized vector fields |

---

## Detailed Breakdown

### 1. The Host-Device Interface (JavaScript to GPU)

A fragment shader does not execute in isolation. It relies on a host program (such as a WebGL runtime) that creates a canvas drawing context, uploads shader source code, and binds uniform values before issuing a draw call:

```javascript
// Host CPU (JavaScript runtime)
const uTimeLocation = gl.getUniformLocation(shaderProgram, "u_time");
const uResolutionLocation = gl.getUniformLocation(shaderProgram, "u_resolution");
const uMouseLocation = gl.getUniformLocation(shaderProgram, "u_mouse");

function renderLoop(currentTimeInMilliseconds) {
    // 1. Convert time to seconds
    gl.uniform1f(uTimeLocation, currentTimeInMilliseconds * 0.001);

    // 2. Transmit canvas dimensions
    gl.uniform2f(uResolutionLocation, canvas.width, canvas.height);

    // 3. Transmit cursor coordinates
    gl.uniform2f(uMouseLocation, mouseX, mouseY);

    // 4. Trigger GPU pipeline execution
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    requestAnimationFrame(renderLoop);
}
```

On the GPU side, declaring `uniform` variables with matching identifiers creates direct hardware registers that all fragment threads can sample:

```glsl
precision mediump float;

uniform vec2 u_resolution; // Canvas width and height
uniform float u_time;      // Elapsed time in seconds
uniform vec2 u_mouse;      // Cursor coordinate in pixels
```

---

### 2. The Three Fundamental Coordinate Spaces

Graphics programming relies on switching between coordinate representations depending on the mathematical task:

```text
1. Pixel Space             2. Normalized Space         3. Centered Space
   (0, 600)──(800, 600)        (0.0, 1.0)──(1.0, 1.0)      (-1.0, 1.0)──(1.0, 1.0)
      │          │                 │          │                │    (0,0)   │
      │          │       ──>       │          │      ──>       │      •     │
   (0, 0)────(800, 0)          (0.0, 0.0)──(1.0, 0.0)      (-1.0,-1.0)──(1.0,-1.0)
```

#### A. Raw Pixel Space (`gl_FragCoord.xy`)
- Expressed in physical device pixels: $x \in [0, \text{width}]$, $y \in [0, \text{height}]$.
- Problem: Code written in pixel coordinates breaks when the canvas size or screen DPI changes.

#### B. Normalized Space (`st = gl_FragCoord.xy / u_resolution.xy`)
- Scale-invariant coordinate range: $x \in [0.0, 1.0]$, $y \in [0.0, 1.0]$.
- Standard format for texture sampling and linear gradient mapping.

#### C. Centered & Aspect-Corrected Space
- Placing $(0.0, 0.0)$ at the center of the viewport makes radial equations and rotations straightforward:

```glsl
// Step 1: Normalize to [0.0, 1.0]
vec2 st = gl_FragCoord.xy / u_resolution.xy;

// Step 2: Remap domain to [-1.0, +1.0]
vec2 pos = st * 2.0 - 1.0;

// Step 3: Correct aspect ratio so 1.0 unit is physically identical along X and Y
pos.x *= u_resolution.x / u_resolution.y;
```

Without aspect ratio correction, circular distance calculations $\sqrt{x^2 + y^2}$ on a widescreen display $(16:9)$ will stretch into ovals.

---

### 3. Modulating Color by Position & Time

Combining normalized coordinates with time-varying trigonometric functions produces dynamic wave interference:

```glsl
precision mediump float;

uniform vec2 u_resolution;
uniform float u_time;

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;

    // Generate oscillating waves along X and Y
    float r = 0.5 + 0.5 * sin(st.x * 10.0 + u_time * 2.0);
    float g = 0.5 + 0.5 * cos(st.y * 10.0 + u_time * 1.5);
    float b = 0.5 + 0.5 * sin((st.x + st.y) * 5.0 - u_time);

    gl_FragColor = vec4(r, g, b, 1.0);
}
```

---

### 4. Interactive Vector Fields with `u_mouse`

The `u_mouse` uniform allows the shader to respond to user pointer input. Because `u_mouse` is sent in raw pixel coordinates, we normalize it to match `st`:

```glsl
precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    vec2 mouse = u_mouse.xy / u_resolution.xy;

    // Euclidean distance from this fragment to the cursor
    float dist = distance(st, mouse);

    // Create a localized light falloff (inverse distance)
    float illumination = clamp(1.0 - dist * 2.5, 0.0, 1.0);

    vec3 baseColor = vec3(0.08, 0.12, 0.22);
    vec3 glowColor = vec3(0.3, 0.7, 1.0);

    vec3 finalColor = mix(baseColor, glowColor, illumination);

    gl_FragColor = vec4(finalColor, 1.0);
}
```

---

## Practical Exercises

1. **Diagonal Aspect-Corrected Wave**: Create a shader in centered coordinates that renders concentric ripples originating from the center $(0.0, 0.0)$ using $\sin(\text{length}(\text{pos}) \cdot 20.0 - u\_time \cdot 4.0)$.
2. **Interactive Color Spotlight**: Modify the mouse shader so that horizontal cursor position `mouse.x` controls the hue of the illumination spot.
3. **Corner Inversion**: Write a shader that computes distance to all four corners of the canvas and blends between four distinct color vectors.

---

## Key Takeaways

- **Uniforms** are the data conduit connecting host applications to the graphics hardware.
- Converting coordinates from pixel space to **normalized** and **centered aspect-corrected** coordinates is essential for responsive, resolution-independent visuals.
- The `distance()` and `mix()` functions form the core toolkit for spatial falloffs and continuous vector interpolation.
