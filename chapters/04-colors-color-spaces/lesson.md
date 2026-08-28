# Chapter 04: Colors & Color Spaces

## Overview

In physical painting, you mix pigments on a palette. In digital rendering, colors are vectors of light — numerical values between `0.0` and `1.0`. But working with raw Red, Green, and Blue channels can feel unintuitive when trying to build natural rainbows, warm sunset gradients, or harmonious palettes.

This chapter explores how to master color in shaders. You'll learn to transition between RGB and HSB (Hue, Saturation, Brightness), use polar coordinates to create radiant color wheels, shape color channels independently, and generate procedural cosine palettes with mathematical precision.

---

## Key Concepts

| Concept | Description |
|---|---|
| **RGB Color Cube** | Color represented as 3D coordinate space $(r, g, b) \in [0.0, 1.0]^3$ |
| **`mix(colorA, colorB, t)`** | Linear (or non-linear) color interpolation between two vector endpoints |
| **Channel Shaping** | Applying independent shaping functions (`smoothstep`, `pow`, `sin`) to R, G, and B |
| **HSB / HSV Model** | Hue (color angle), Saturation (vibrancy), and Brightness (value) |
| **Branchless `hsb2rgb`** | Mathematical function to map cylindrical HSB into linear RGB |
| **Polar Coordinates** | Calculating angle via `atan(y, x)` and distance via `length()` to drive color |
| **Cosine Palettes** | Procedural harmonic palettes using $a + b \cdot \cos(2\pi(c \cdot t + d))$ |

---

## Lesson

### 1. The RGB Color Model & Linear Interpolation

In GLSL, colors are typically stored in `vec3` (RGB) or `vec4` (RGBA) variables where each component ranges from `0.0` (0% intensity) to `1.0` (100% intensity):

```glsl
vec3 red   = vec3(1.0, 0.0, 0.0);
vec3 green = vec3(0.0, 1.0, 0.0);
vec3 blue  = vec3(0.0, 0.0, 1.0);
vec3 white = vec3(1.0);
vec3 black = vec3(0.0);
```

The simplest way to blend two colors is the built-in `mix()` function:

$$\text{mix}(A, B, t) = A \cdot (1.0 - t) + B \cdot t$$

```glsl
precision mediump float;
uniform vec2 u_resolution;

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;

    vec3 colorA = vec3(0.149, 0.141, 0.912); // Deep blue
    vec3 colorB = vec3(1.000, 0.833, 0.224); // Warm gold

    // Linear blend based on horizontal coordinate st.x
    vec3 color = mix(colorA, colorB, st.x);

    gl_FragColor = vec4(color, 1.0);
}
```

---

### 2. Non-Linear Color Blending (Channel Shaping)

Linear color gradients often appear muddy or grayish in the middle because perceptual brightness is non-linear. By combining what you learned in **Chapter 03 (Shaping Functions)**, you can pass shaped interpolation factors into `mix()`:

```glsl
// Soft S-curve transition instead of linear ramp
float pct = smoothstep(0.0, 1.0, st.x);
vec3 color = mix(colorA, colorB, pct);
```

You can even shape the **Red, Green, and Blue channels independently**:

```glsl
precision mediump float;
uniform vec2 u_resolution;

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;

    vec3 colorA = vec3(0.1, 0.2, 0.8);
    vec3 colorB = vec3(0.9, 0.4, 0.1);

    // Each channel gets its own unique transition curve
    vec3 pct = vec3(
        smoothstep(0.1, 0.9, st.x),   // Red transition
        pow(st.x, 2.0),               // Green transition
        sin(st.x * 3.14159)           // Blue transition
    );

    vec3 color = mix(colorA, colorB, pct);
    gl_FragColor = vec4(color, 1.0);
}
```

---

### 3. HSB Color Space & The `hsb2rgb` Function

While RGB represents how screens emit light, **HSB (Hue, Saturation, Brightness)** represents how humans perceive color:
- **Hue ($H \in [0.0, 1.0]$)**: The color family (0.0 = Red, 0.33 = Green, 0.67 = Blue, 1.0 = Red).
- **Saturation ($S \in [0.0, 1.0]$)**: The color purity (0.0 = Grayscale, 1.0 = Pure vibrant color).
- **Brightness ($B \in [0.0, 1.0]$)**: The light intensity (0.0 = Pure black, 1.0 = Full brightness).

GPUs do not natively display HSB, so we convert HSB to RGB using a branchless conversion function:

```glsl
vec3 hsb2rgb(in vec3 c) {
    vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
    rgb = rgb * rgb * (3.0 - 2.0 * rgb); // Smoothstep polynomial
    return c.z * mix(vec3(1.0), rgb, c.y);
}
```

With `hsb2rgb`, creating a dynamic spectrum is as simple as:

```glsl
// st.x controls the Hue, Saturation=1.0, Brightness=1.0
vec3 rainbow = hsb2rgb(vec3(st.x, 1.0, 1.0));
```

---

### 4. Polar Coordinates & Radiant Color Wheels

By converting Cartesian coordinates $(x, y)$ into Polar coordinates $(\text{angle}, \text{radius})$, you can map Hue to angle and Saturation to distance from the center:

```glsl
precision mediump float;
uniform vec2 u_resolution;

#define TWO_PI 6.28318530718

vec3 hsb2rgb(in vec3 c) {
    vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
    rgb = rgb * rgb * (3.0 - 2.0 * rgb);
    return c.z * mix(vec3(1.0), rgb, c.y);
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    
    // Shift origin to the center of the canvas (-0.5 to +0.5)
    vec2 toCenter = vec2(0.5) - st;

    // Angle: atan(y, x) returns [-PI, +PI], normalize to [0.0, 1.0]
    float angle = atan(toCenter.y, toCenter.x);
    float radius = length(toCenter) * 2.0;

    // Map: Angle -> Hue, Radius -> Saturation, Brightness = 1.0
    vec3 color = hsb2rgb(vec3((angle / TWO_PI) + 0.5, radius, 1.0));

    gl_FragColor = vec4(color, 1.0);
}
```

---

### 5. Procedural Cosine Palettes (Inigo Quilez Palettes)

A celebrated technique invented by graphics pioneer **Inigo Quilez** uses cosine oscillations to generate infinite procedural color palettes:

$$\text{color}(t) = a + b \cdot \cos(2\pi(c \cdot t + d))$$

Where:
- $a$: Baseline brightness offset (`vec3`)
- $b$: Color amplitude / contrast (`vec3`)
- $c$: Frequency of oscillation per color channel (`vec3`)
- $d$: Phase shift offset per color channel (`vec3`)

```glsl
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;

#define TWO_PI 6.28318530718

vec3 cosinePalette(in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d) {
    return a + b * cos(TWO_PI * (c * t + d));
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;

    // Example: Rainbow / Sunset Palette
    vec3 a = vec3(0.5, 0.5, 0.5);
    vec3 b = vec3(0.5, 0.5, 0.5);
    vec3 c = vec3(1.0, 1.0, 1.0);
    vec3 d = vec3(0.00, 0.33, 0.67);

    vec3 color = cosinePalette(st.x + u_time * 0.1, a, b, c, d);

    gl_FragColor = vec4(color, 1.0);
}
```

By tweaking vectors $a, b, c, d$, you can create neon cyberpunk gradients, pastel dreamy clouds, metallic golds, or desert sunsets with just four vectors.

---

## Key Takeaways

1. **`mix(a, b, t)`** is your fundamental color blending tool.
2. Modulating the **blend factor $t$** with shaping functions (`smoothstep`, `pow`) eliminates muddy transitions.
3. **HSB** makes generative color selection intuitive: shift Hue for rainbows, modulate Saturation for tints, modulate Brightness for shadows.
4. **Polar Coordinates** (`atan` + `length`) translate 2D spatial positions into radial and rotational color gradients.
5. **Cosine Palettes** provide an analytical way to create procedural color schemes with zero textures.

---

## Next Steps

Now that you have mastered color manipulation, in **Chapter 05: 2D Shapes**, you will combine shaping functions with distance fields to draw lines, circles, polygons, and complex antialiased geometries!
