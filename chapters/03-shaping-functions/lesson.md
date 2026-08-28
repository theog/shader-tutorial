# Chapter 03: Shaping Functions

## Overview

If shaders are painting, then shaping functions are your brushstrokes. Every visual effect you'll build — soft edges, hard borders, glowing pulses, curved transitions — comes from choosing the right mathematical function to transform a value.

This chapter is the "wax on, wax off" of shader development. You'll learn to see functions as visual tools: `step()` is a knife edge, `smoothstep()` is a soft brush, `pow()` bends curves, and `sin()` creates rhythm. Master these and everything else becomes composition.

---

## Key Concepts

| Concept | Description |
|---------|-------------|
| `step(edge, x)` | Hard cutoff: returns 0.0 if x < edge, 1.0 if x >= edge |
| `smoothstep(a, b, x)` | Smooth transition: 0.0 below a, 1.0 above b, S-curve between |
| `pow(x, n)` | Power curve: bends linear ramps into exponential/logarithmic shapes |
| `sin()` / `cos()` | Oscillation: periodic waves for animation and repetition |
| `fract()` | Fractional part: creates sawtooth waves and repetition |
| `clamp(x, min, max)` | Constrains a value to a range |
| `abs()` | Absolute value: mirrors negative values to positive |
| Function composition | Combining simple functions to build complex curves |

---

## Lesson

### Thinking in 1D Before 2D

Before you draw shapes on a 2D canvas, you need to master 1D shaping — taking a value that goes from 0 to 1 (like `st.x`) and transforming it into a different curve. That transformed value becomes brightness, an edge, a color blend factor, or an animation timing.

Think of it this way:
- **Input**: a linear ramp from 0 to 1 (position, time, distance — anything)
- **Output**: a shaped value (still typically 0 to 1, but with a different curve)

The interactive app for this chapter plots these functions as graphs so you can see their shape.

### step() — The Hard Edge

```glsl
float result = step(edge, x);
// Returns: 0.0 if x < edge
//          1.0 if x >= edge
```

`step()` is a binary switch. Everything below the threshold is 0, everything above is 1. No in-between.

```glsl
precision mediump float;
uniform vec2 u_resolution;

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;

    // Hard split at x = 0.5
    // Left half = black (0.0), right half = white (1.0)
    float value = step(0.5, st.x);

    gl_FragColor = vec4(vec3(value), 1.0);
}
```

Use `step()` when you want crisp borders: inside/outside, on/off, visible/invisible.

**Key insight**: `step(edge, x)` is equivalent to `x >= edge ? 1.0 : 0.0` — but it's branchless on GPU hardware, making it fast.

### smoothstep() — The Soft Transition

```glsl
float result = smoothstep(edge0, edge1, x);
// Returns: 0.0 if x <= edge0
//          1.0 if x >= edge1
//          Smooth S-curve interpolation between
```

`smoothstep()` is the workhorse of shader graphics. It gives you anti-aliased edges, soft gradients, and controllable transitions.

```glsl
precision mediump float;
uniform vec2 u_resolution;

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;

    // Soft transition from 0.3 to 0.7
    // Below 0.3 = black, above 0.7 = white
    // Between = smooth curve
    float value = smoothstep(0.3, 0.7, st.x);

    gl_FragColor = vec4(vec3(value), 1.0);
}
```

The width of the transition (edge1 - edge0) controls the softness:
- Wide gap (e.g., 0.0 to 1.0) → very gradual
- Narrow gap (e.g., 0.49 to 0.51) → nearly as sharp as `step()`
- `smoothstep(a, a, x)` → identical to `step(a, x)`

**Making a line from smoothstep**: Subtract two smoothsteps to create a band:

```glsl
// A soft band (line) around y = 0.5
float line = smoothstep(0.45, 0.5, st.x) - smoothstep(0.5, 0.55, st.x);
```

### pow() — Bending the Curve

```glsl
float result = pow(x, exponent);
// x^exponent — reshapes the linear ramp
```

When x goes from 0 to 1:
- `pow(x, 1.0)` → linear (no change)
- `pow(x, 2.0)` → quadratic (slow start, fast end)
- `pow(x, 0.5)` → square root (fast start, slow end)
- `pow(x, 5.0)` → very steep at end (concentrates values near 0)

```glsl
precision mediump float;
uniform vec2 u_resolution;

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;

    // Compare: linear vs pow curves
    // The exponent reshapes brightness distribution
    float linear = st.x;
    float squared = pow(st.x, 2.0);
    float rooted = pow(st.x, 0.5);

    // Use Y position to show different curves:
    float value;
    if (st.y > 0.66) {
        value = rooted;      // top third: sqrt (bright)
    } else if (st.y > 0.33) {
        value = linear;      // middle: linear
    } else {
        value = squared;     // bottom: squared (dark)
    }

    gl_FragColor = vec4(vec3(value), 1.0);
}
```

**Use cases**: Gamma correction, easing animations, controlling contrast.

### sin() and cos() — Rhythm and Oscillation

```glsl
float wave = sin(x);
// Oscillates between -1 and 1
// Period = 2*PI (about 6.28)
```

For shader work, you almost always remap sin to 0–1:

```glsl
float wave01 = 0.5 + 0.5 * sin(x);  // Now oscillates 0 to 1
```

Control the frequency by multiplying the input:
```glsl
sin(x * 2.0)         // Twice as fast
sin(x * PI)          // One full cycle per unit
sin(x * 10.0)        // Ten cycles per unit
```

Control the phase (offset) by adding:
```glsl
sin(x + u_time)      // Shifts over time (animation!)
sin(x + PI * 0.5)    // Same as cos(x)
```

```glsl
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;

#define PI 3.14159265359

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;

    // Animated sine wave stripes
    float frequency = 10.0;
    float wave = 0.5 + 0.5 * sin(st.x * frequency * PI + u_time * 3.0);

    gl_FragColor = vec4(vec3(wave), 1.0);
}
```

### fract() — The Sawtooth

```glsl
float result = fract(x);
// Returns the fractional part: fract(2.7) = 0.7, fract(0.3) = 0.3
```

`fract()` creates a sawtooth wave — the value rises from 0 to 1, then snaps back to 0, repeatedly. It's the foundation of tiling and repetition (Chapter 08) but also useful for shaping:

```glsl
// Five sawtooth ramps across the screen
float saw = fract(st.x * 5.0);

// Combine with smoothstep for repeated soft pulses
float pulse = smoothstep(0.0, 0.5, saw) - smoothstep(0.5, 1.0, saw);
```

### abs() — The Mirror

```glsl
float result = abs(x);
// Mirrors negatives: abs(-0.3) = 0.3, abs(0.3) = 0.3
```

Useful for centered effects. If you center your coordinates to -1..+1, then `abs(st.x)` gives you a V-shape — symmetric around the center:

```glsl
vec2 st = gl_FragCoord.xy / u_resolution.xy * 2.0 - 1.0;
float v = 1.0 - abs(st.x);  // Peak at center, falls to edges
```

### Composing Functions

The real power comes from combining these primitives. A few patterns:

**Pulse/bump** (useful for highlighting a specific value):
```glsl
// Gaussian-like bump centered at 0.5, width controlled by 'w'
float bump = smoothstep(0.5 - w, 0.5, x) - smoothstep(0.5, 0.5 + w, x);
```

**Ease-in / ease-out** (for animation):
```glsl
float easeIn = pow(t, 2.0);           // Slow start
float easeOut = 1.0 - pow(1.0 - t, 2.0);  // Slow end
float easeInOut = smoothstep(0.0, 1.0, t); // Both
```

**Stepped gradient** (posterization):
```glsl
float steps = floor(x * 5.0) / 5.0;  // 5 discrete levels
```

**Ping-pong** (triangle wave — bounce between 0 and 1):
```glsl
float pingpong = abs(fract(x) * 2.0 - 1.0);
```

### Visualizing Functions as Graphs

A common debugging and learning technique: draw the function as a curve on screen:

```glsl
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;

#define PI 3.14159265359

// Plot a line on Y
float plot(vec2 st, float y) {
    return smoothstep(y - 0.02, y, st.y) - smoothstep(y, y + 0.02, st.y);
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;

    // The function to visualize
    float y = smoothstep(0.2, 0.8, st.x);

    // Background: show the value as brightness
    vec3 color = vec3(y);

    // Overlay: draw the curve as a green line
    float line = plot(st, y);
    color = mix(color, vec3(0.0, 1.0, 0.0), line);

    gl_FragColor = vec4(color, 1.0);
}
```

This pattern — background shows the value as grayscale, green line traces the curve — is used throughout The Book of Shaders and in our interactive app.

---

## Exercises

1. **Step staircase** — Use `floor(st.x * 8.0) / 8.0` to create 8 discrete brightness levels across the screen. Then try 4, 16, 32 levels.

2. **Smooth pulse** — Create a bright band (pulse) at `st.x = 0.5` using two `smoothstep()` calls subtracted from each other. Control the width.

3. **Bouncing ball curve** — Use `abs(sin(u_time * 3.0))` as brightness to simulate a bouncing-ball ease (fast at bottom, slow at top). Combine with position to show the curve across the screen.

4. **Custom easing** — Implement an ease-in-out-back curve: `t * t * (3.0 - 2.0 * t)` (this is what smoothstep uses internally). Compare it to a linear ramp visually.

---

## Summary

Shaping functions are the vocabulary of shader graphics. `step()` creates hard edges, `smoothstep()` creates soft ones, `pow()` bends curves, `sin()`/`cos()` add rhythm, `fract()` creates repetition, and `abs()` creates symmetry. By composing these simple pieces, you can build any transition, edge, or animation curve you need. Master them in 1D — they'll carry directly into 2D shapes, patterns, and noise.

**Next up:** [Chapter 04: Color](../04-color/lesson.md)
