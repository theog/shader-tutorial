# Quiz — Chapter 04: Colors & Color Spaces

Test your understanding of color spaces, interpolation, polar mappings, and cosine palettes.

---

## Multiple Choice

### Q1: In the built-in function `mix(colorA, colorB, t)`, what is returned when $t = 0.75$?

- [ ] A) 25% of `colorA` and 75% of `colorB`
- [ ] B) 75% of `colorA` and 25% of `colorB`
- [ ] C) 100% of `colorB`
- [ ] D) The average of `colorA` and `colorB`

---

### Q2: Why is the HSB (Hue, Saturation, Brightness) color model often preferred over RGB for generative art?

- [ ] A) GPUs execute HSB calculations faster than RGB
- [ ] B) HSB allows you to cycle through colors by simply rotating a single variable (Hue) while keeping saturation and brightness constant
- [ ] C) RGB cannot represent primary colors like Red, Green, and Blue
- [ ] D) HSB does not require floating point numbers

---

### Q3: When converting coordinates to polar form to draw a color wheel, which GLSL function computes the angle from the center?

- [ ] A) `length(toCenter)`
- [ ] B) `distance(toCenter, vec2(0.0))`
- [ ] C) `atan(toCenter.y, toCenter.x)`
- [ ] D) `dot(toCenter, vec2(1.0))`

---

## True or False

### Q4: Linear RGB interpolation (`mix(vec3(1,0,0), vec3(0,1,0), st.x)`) maintains constant perceived brightness across the entire transition.

- [ ] True
- [ ] False

---

### Q5: In Inigo Quilez's cosine palette formula `a + b * cos(2.0 * PI * (c * t + d))`, vector `c` controls the frequency of oscillation for each color channel.

- [ ] True
- [ ] False

---

## Code Challenges

### Q6: Two-Tone Diagonal Gradient
Write a fragment shader that creates a smooth diagonal gradient from deep purple `vec3(0.2, 0.0, 0.4)` in the bottom-left to bright cyan `vec3(0.0, 0.9, 0.9)` in the top-right using `smoothstep()`.

```glsl
precision mediump float;
uniform vec2 u_resolution;

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    
    // Hint: diagonal progression can be found with (st.x + st.y) * 0.5
    // Write your code below:
    
}
```

---

### Q7: Pulsing Rainbow Center
Using `hsb2rgb()`, write a fragment shader where the color is determined by distance from canvas center, pulsing outward over time `u_time`.

```glsl
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;

#define TWO_PI 6.28318530718

vec3 hsb2rgb(in vec3 c) {
    vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
    rgb = rgb * rgb * (3.0 - 2.0 * rgb);
    return c.z * mix(vec3(1.0), rgb, c.y);
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    vec2 center = vec2(0.5);
    
    // Write your code below:
    
}
```

---

## Answers & Explanations

<details>
<summary>Click to view answers</summary>

### Q1: A
`mix(A, B, t)` evaluates to $A \cdot (1 - t) + B \cdot t$. At $t = 0.75$, you get $0.25 \cdot A + 0.75 \cdot B$.

### Q2: B
In HSB, Hue is a continuous 1D circular value from 0.0 to 1.0. You can iterate or animate through the entire rainbow spectrum by merely advancing the Hue component.

### Q3: C
`atan(y, x)` (two-argument arc-tangent) computes the polar angle in radians in the range $[-\pi, +\pi]$.

### Q4: False
Linear RGB interpolation often suffers from a "dark muddy middle" because human brightness perception is non-linear and RGB color components are additive rather than perceptual.

### Q5: True
Vector `c` represents the frequency multipliers for $(r, g, b)$ channels. Varying `c` across channels causes Red, Green, and Blue to oscillate at different rates, producing rich palette diversity.

### Q6 Solution:
```glsl
precision mediump float;
uniform vec2 u_resolution;

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    vec3 colorA = vec3(0.2, 0.0, 0.4); // Deep purple
    vec3 colorB = vec3(0.0, 0.9, 0.9); // Bright cyan
    
    float t = (st.x + st.y) * 0.5;
    float smoothT = smoothstep(0.1, 0.9, t);
    
    vec3 color = mix(colorA, colorB, smoothT);
    gl_FragColor = vec4(color, 1.0);
}
```

### Q7 Solution:
```glsl
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;

vec3 hsb2rgb(in vec3 c) {
    vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
    rgb = rgb * rgb * (3.0 - 2.0 * rgb);
    return c.z * mix(vec3(1.0), rgb, c.y);
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    float dist = length(st - vec2(0.5));
    float hue = fract(dist * 3.0 - u_time * 0.5);
    vec3 color = hsb2rgb(vec3(hue, 1.0, 1.0));
    gl_FragColor = vec4(color, 1.0);
}
```
</details>
