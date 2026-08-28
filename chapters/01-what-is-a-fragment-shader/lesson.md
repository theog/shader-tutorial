# Chapter 01: The GPU Architecture & Parallel Execution

## Overview

Modern graphics programming requires a fundamental shift in how you design algorithms. When programming a CPU, you think sequentially: iterating through data structures, maintaining state in memory, and executing instructions step by step. 

On a **GPU (Graphics Processing Unit)**, execution is massively parallel. Instead of a few powerful processor cores executing loops, a GPU contains thousands of smaller arithmetic logic units (ALUs) running the exact same compiled program across millions of screen pixels simultaneously.

This chapter breaks down the hardware architecture of fragment shaders, explains how the GPU rasterization pipeline operates, and establishes the mathematical principles of per-pixel computing in GLSL.

---

## Key Concepts

| Concept | Description |
|---|---|
| **Fragment / Pixel Stage** | The programmable pipeline stage responsible for computing the final color vector of each rasterized pixel |
| **SIMD Architecture** | Single Instruction, Multiple Data — the hardware paradigm executing identical code across multiple threads concurrently |
| **`gl_FragCoord`** | Built-in GPU read-only vector containing the window-relative coordinates $(x, y, z, 1/w)$ of the current fragment |
| **`gl_FragColor`** | Built-in output register storing the four-component floating-point color vector $(\text{red}, \text{green}, \text{blue}, \text{alpha})$ |
| **Coordinate Normalization** | Mapping raw pixel indices into a scale-invariant unit square $[0.0, 1.0]^2$ |
| **GLSL Syntax** | The C-based shading language compiled directly into GPU machine code at runtime |

---

## Detailed Breakdown

### 1. Sequential CPU Processing vs. Parallel GPU Execution

To understand why shaders exist, consider how a CPU renders a high-definition image $(1920 \times 1080 = 2,073,600 \text{ pixels})$:

```javascript
// CPU Model: Iterative & Sequential
for (let y = 0; y < 1080; y++) {
    for (let x = 0; x < 1920; x++) {
        framebuffer[y][x] = evaluateColor(x, y);
    }
}
```

Even with multi-threading, evaluating over two million pixels sequentially at 60 frames per second requires over 124 million function executions per second. 

A GPU eliminates the outer loops entirely. Instead of looping through pixels, the GPU hardware launches **2,073,600 concurrent thread instances** across its compute units. Every thread runs the exact same fragment shader function simultaneously for its assigned pixel coordinate:

$$\text{Pixel Color} = f(\text{Coordinate}, \text{Time}, \text{Uniform Inputs})$$

Because every thread is isolated:
- **No Shared Memory**: A pixel cannot read or modify the color computed by its neighboring pixel.
- **Pure Functional Logic**: The output is determined entirely as a mathematical function of its inputs.

---

### 2. The 2D Rasterization Pipeline

In 2D shader environments (such as WebGL canvases), we supply the GPU with two simple triangles that form a full-screen quad covering the normalized viewport from $(-1.0, -1.0)$ to $(1.0, 1.0)$:

```text
[ Vertex Quad ] ──> [ GPU Rasterizer ] ──> [ Fragment Shader Threads ] ──> [ Display Buffer ]
(-1,1)───(1,1)       Generates 2D pixels     Evaluates GLSL code per pixel    Final RGBA image
  │   ╲   │         for the quad bounds     gl_FragCoord -> gl_FragColor
(-1,-1)──(1,-1)
```

The rasterizer determines every screen pixel bounded by this quad and dispatches an execution of your fragment shader for each one.

---

### 3. Anatomical Breakdown of a Fragment Shader

Here is a complete, minimal GLSL fragment shader:

```glsl
// 1. Declare floating-point precision
precision mediump float;

// 2. Uniform input provided by the host application (canvas dimensions)
uniform vec2 u_resolution;

// 3. Execution entry point executed once per pixel
void main() {
    // 4. Compute normalized coordinates in range [0.0, 1.0]
    vec2 st = gl_FragCoord.xy / u_resolution.xy;

    // 5. Assign RGBA output vector (Red = x, Green = y, Blue = 0, Alpha = 1)
    gl_FragColor = vec4(st.x, st.y, 0.0, 1.0);
}
```

#### Line-by-Line Technical Analysis:

1. **`precision mediump float;`**: Tells the GPU shader compiler how many bits of precision to allocate for floating-point calculations (`lowp` = 8-10 bits, `mediump` = 16 bits, `highp` = 32 bits). `mediump` provides great performance and broad cross-platform compatibility across mobile and desktop GPUs.
2. **`uniform vec2 u_resolution;`**: A **uniform** is a read-only variable passed from the host application (JavaScript/WebGL) into the shader. It remains constant across all pixel threads during a single draw call.
3. **`gl_FragCoord.xy / u_resolution.xy`**: `gl_FragCoord` contains the physical pixel coordinate (e.g. $x=640.5, y=360.5$). Dividing by the canvas width and height normalizes the domain into a clean $[0.0, 1.0]$ coordinate space.
4. **`gl_FragColor = vec4(...)`**: The output target register. In WebGL 1.0, writing to `gl_FragColor` sends the final clamped floating-point color $(R, G, B, A)$ to the graphics framebuffer.

---

### 4. Essential GLSL Types and Vector Swizzling

GLSL is strongly typed with hardware-accelerated vector mathematics:

| Type | Components | Use Cases | Example |
|---|---|---|---|
| `float` | 1 scalar float | Coordinates, angles, time scalars | `float t = 1.5;` |
| `vec2` | 2D vector | 2D screen positions, UV coordinates | `vec2 pos = vec2(0.5, 1.0);` |
| `vec3` | 3D vector | 3D normals, RGB colors | `vec3 rgb = vec3(1.0, 0.5, 0.0);` |
| `vec4` | 4D vector | RGBA colors, homogeneous coordinates | `vec4 color = vec4(rgb, 1.0);` |

#### Vector Swizzling:
GLSL allows arbitrary reordering and extraction of vector components using property accessors:
```glsl
vec4 data = vec4(1.0, 2.0, 3.0, 4.0);

vec2 xy = data.xy;    // vec2(1.0, 2.0)
vec3 rgb = data.rgb;  // vec3(1.0, 2.0, 3.0)
vec3 bgr = data.bgr;  // vec3(3.0, 2.0, 1.0) - channel inversion!
vec4 dup = data.xxxx; // vec4(1.0, 1.0, 1.0, 1.0)
```

---

### 5. Architectural Constraints of the GPU

Because thousands of threads run concurrently at hardware clock speeds, fragment shaders operate under specific design constraints:

1. **No Cross-Thread Communication**: You cannot query the color or calculation of an adjacent pixel. All spatial patterns must be derived mathematically from `gl_FragCoord`.
2. **Stateless per Frame**: Fragment shaders do not retain variables from the previous frame unless explicitly passed via textures or framebuffers.
3. **Branching Cost**: Conditional statements (`if/else`) that diverge across adjacent threads can serialize execution on SIMD warps. Branchless mathematical formulations (`step`, `mix`, `clamp`) are preferred.

---

## Practical Exercises

1. **Inverted Vertical Gradient**: Modify the initial shader so that the Red channel transitions from `1.0` at the top of the canvas to `0.0` at the bottom (Hint: `1.0 - st.y`).
2. **Four-Quadrant Checker**: Use `step(0.5, st.x)` and `step(0.5, st.y)` to divide the screen into four distinct color quadrants.
3. **Pulsing Monochrome**: Multiply the output `vec3(st.x)` by `0.5 + 0.5 * sin(u_time)` to create a pulsing luminance wave.

---

## Key Takeaways

- Fragment shaders replace sequential loops with **massively parallel per-pixel mathematical evaluation**.
- Normalizing coordinates via `gl_FragCoord.xy / u_resolution.xy` makes shader logic resolution-independent.
- Shaders are pure mathematical mapping functions from coordinate space $(x, y)$ to color space $(r, g, b, a)$.
