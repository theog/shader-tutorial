# Chapter 03: Mathematical Shaping & Continuous Transfer Functions

## Overview

In procedural rendering, all visual form is generated from mathematical functions. Before you can render complex 2D shapes, organic noise, or lighting falloffs, you must master the art of **1D scalar transfer functions**: taking a continuous input value $x \in [0.0, 1.0]$ and reshaping it through an analytical equation $y = f(x)$.

Transfer functions allow you to control edge sharpness, non-linear brightness curves, rhythmic oscillations, and spatial symmetry. This chapter examines the mathematical formulations of core GLSL shaping functions and demonstrates how to compose them into sophisticated visual effects.

---

## Key Concepts

| Function | Mathematical Definition | Visual Effect |
|---|---|---|
| **`step(edge, x)`** | $f(x) = \begin{cases} 0.0 & x < \text{edge} \\ 1.0 & x \ge \text{edge} \end{cases}$ | Hard binary cutoff / sharp silhouette border |
| **`smoothstep(e0, e1, x)`** | $t = \text{clamp}\left(\frac{x - e_0}{e_1 - e_0}, 0, 1\right), \quad 3t^2 - 2t^3$ | Cubic S-curve transition / antialiased edge |
| **`pow(x, \gamma)`** | $f(x) = x^\gamma$ | Exponential curve / contrast expansion & compression |
| **`fract(x)`** | $f(x) = x - \lfloor x \rfloor$ | Periodic sawtooth ramp / spatial tiling foundation |
| **`abs(x)`** | $f(x) = |x|$ | Bilateral fold reflection / V-shape mirror symmetry |
| **`clamp(x, min, max)`** | $f(x) = \min(\max(x, \text{min}), \text{max})$ | Boundary constraint preventing numerical overflow |

---

## Detailed Breakdown

### 1. The Heaviside Step Function (`step`)

The `step()` function is the graphics equivalent of an instantaneous digital logic switch. It evaluates without conditional CPU branching, making it execution-efficient on GPU SIMD cores:

```glsl
precision mediump float;
uniform vec2 u_resolution;

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;

    // Everything left of x = 0.5 is 0.0 (Black); right of 0.5 is 1.0 (White)
    float mask = step(0.5, st.x);

    gl_FragColor = vec4(vec3(mask), 1.0);
}
```

While useful for hard masks, `step()` produces jagged, pixelated staircase artifacts on diagonal lines because pixels are either 100% on or 100% off with no intermediate values.

---

### 2. Cubic Hermite Interpolation (`smoothstep`)

To eliminate aliasing and create organic transitions, GLSL provides `smoothstep(edge0, edge1, x)`. It computes a continuous cubic polynomial that transitions smoothly between two thresholds with zero velocity at both endpoints:

$$f(t) = 3t^2 - 2t^3 \quad \text{where } t = \text{clamp}\left(\frac{x - \text{edge}_0}{\text{edge}_1 - \text{edge}_0}, 0.0, 1.0\right)$$

```glsl
precision mediump float;
uniform vec2 u_resolution;

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;

    // Smooth gradient band between 0.3 and 0.7
    float smoothMask = smoothstep(0.3, 0.7, st.x);

    gl_FragColor = vec4(vec3(smoothMask), 1.0);
}
```

#### Analytical Edge Anti-Aliasing:
By narrowing the width of `smoothstep` to approximately the width of a single physical pixel, you achieve mathematically perfect antialiasing:
```glsl
float pixelWidth = 1.0 / u_resolution.x;
float antiAliasedEdge = smoothstep(0.5 - pixelWidth, 0.5 + pixelWidth, st.x);
```

---

### 3. Power Curves (`pow`) and Gamma Shaping

Power functions bend linear ramps into exponential or logarithmic curves:
- **$\gamma > 1.0$ (e.g. $x^2, x^3$)**: Compresses dark values, producing a steep rise near 1.0 (deep shadows, tight highlights).
- **$\gamma < 1.0$ (e.g. $x^{0.5}, x^{0.33}$)**: Expands dark values, producing rapid initial growth (diffuse ambient lighting, softened contrast).

```glsl
float darkCurve = pow(st.x, 3.0); // Slow start, dramatic rise
float brightCurve = pow(st.x, 0.33); // Rapid start, plateauing top
```

---

### 4. Periodic Waveforms with `fract` and `abs`

Combining fractional and absolute value functions transforms linear coordinate ramps into periodic waveforms without trigonometric computation cost:

#### A. Sawtooth Wave (`fract`):
`fract(x)` extracts the fractional part $x - \lfloor x \rfloor$, creating repeating $0.0 \to 1.0$ ramps:
```glsl
float sawtooth = fract(st.x * 5.0); // 5 repeating ramps
```

#### B. Triangle Wave (Ping-Pong):
Reflecting the sawtooth wave with `abs()` generates a continuous linear bounce between $0.0$ and $1.0$:
```glsl
// Remap [0..1] -> [-1..+1] -> mirror -> [0..1]
float triangleWave = abs(fract(st.x * 4.0) * 2.0 - 1.0);
```

---

### 5. Function Composition: Building a Gaussian-Style Pulse

Complex shapes are built by adding, multiplying, or subtracting elemental shaping functions. For example, subtracting two offset `smoothstep` curves constructs an isolated smooth light pulse:

```glsl
precision mediump float;
uniform vec2 u_resolution;

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;

    float center = 0.5;
    float width = 0.15;

    // Left rising edge minus right falling edge = isolated bell pulse
    float pulse = smoothstep(center - width, center, st.x)
                - smoothstep(center, center + width, st.x);

    vec3 color = vec3(pulse) * vec3(0.2, 0.8, 1.0); // Tinted cyan

    gl_FragColor = vec4(color, 1.0);
}
```

---

## Practical Exercises

1. **Symmetric Vignette**: Build a radial vignette falloff that darkens the canvas corners using `1.0 - smoothstep(0.4, 0.8, length(st - vec2(0.5)))`.
2. **Double Pulse Wave**: Combine two pulse equations with different widths and centers to produce a double-peak waveform.
3. **Step Staircase**: Use `floor(st.x * 5.0) / 4.0` to quantize a continuous gradient into 5 discrete stepped brightness levels.

---

## Key Takeaways

- 1D scalar shaping functions are the **atomic building blocks** of all procedural rendering.
- `smoothstep` provides continuous cubic transitions essential for smooth blending and hardware antialiasing.
- Modulo arithmetic (`fract`) and spatial reflection (`abs`) allow you to construct infinite periodic waveforms with zero trigonometric overhead.
