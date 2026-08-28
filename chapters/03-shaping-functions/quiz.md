# Quiz — Chapter 03: Shaping Functions

Test your understanding of step, smoothstep, pow, sin, and function composition.

---

## Multiple Choice

### Q1: What does `step(0.3, 0.5)` return?

- [ ] A) 0.3
- [ ] B) 0.5
- [ ] C) 0.0
- [ ] D) 1.0

### Q2: What is the visual difference between `smoothstep(0.2, 0.8, st.x)` and `smoothstep(0.49, 0.51, st.x)`?

- [ ] A) The first is brighter than the second
- [ ] B) The first has a wide soft transition, the second is nearly a hard edge
- [ ] C) The second is animated, the first is static
- [ ] D) There is no visual difference

### Q3: What does `pow(0.5, 2.0)` evaluate to?

- [ ] A) 1.0
- [ ] B) 0.5
- [ ] C) 0.25
- [ ] D) 2.5

---

## True or False

### Q4: `fract(3.7)` returns `3.0`.

- [ ] True
- [ ] False

### Q5: `smoothstep(0.0, 1.0, x)` produces the same result as a linear ramp (`y = x`) for values between 0 and 1.

- [ ] True
- [ ] False

---

## Code Challenges

### Q6: Symmetric Gradient

Write a shader that creates a gradient which is brightest at the horizontal center (`st.x = 0.5`) and darkest at both edges. Use `abs()` and centered coordinates.

```glsl
precision mediump float;
uniform vec2 u_resolution;

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    vec3 color = vec3(0.0);

    // TODO: brightest at center (x=0.5), dark at edges
    // Hint: remap st.x to -1..+1, then use abs()

    gl_FragColor = vec4(color, 1.0);
}
```

### Q7: Animated Sine Stripes

Write a shader that shows vertical stripes that animate (scroll) over time. Use `sin()`, `st.x`, and `u_time`. The stripes should transition smoothly between black and white.

```glsl
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;

    // TODO: create animated vertical sine stripes

    gl_FragColor = vec4(0.0);
}
```

---

## Answers

<details>
<summary>Click to reveal answers</summary>

1. **D) 1.0** — `step(edge, x)` returns 1.0 when x >= edge. Here 0.5 >= 0.3, so it's 1.0.

2. **B)** The first has a wide soft transition (spanning 60% of the screen), the second is nearly a hard edge (spanning only 2% of the screen). The gap between the two edge parameters controls transition width.

3. **C) 0.25** — `pow(0.5, 2.0)` = 0.5² = 0.25.

4. **False** — `fract()` returns the *fractional* part. `fract(3.7) = 0.7`. (`floor()` would give you 3.0.)

5. **False** — `smoothstep(0.0, 1.0, x)` produces an S-curve (Hermite interpolation: `3x² - 2x³`), not a straight line. It starts slow, speeds up in the middle, and slows at the end.

6. Solution:
```glsl
precision mediump float;
uniform vec2 u_resolution;

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;

    // Remap x from 0..1 to -1..+1
    float x = st.x * 2.0 - 1.0;

    // abs gives V-shape (0 at center, 1 at edges)
    // Invert: 1.0 - abs gives peak at center
    float brightness = 1.0 - abs(x);

    gl_FragColor = vec4(vec3(brightness), 1.0);
}
```

7. Solution:
```glsl
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;

#define PI 3.14159265359

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;

    // sin() for smooth oscillation
    // Multiply st.x for frequency, add u_time for scrolling
    // Remap from -1..+1 to 0..1
    float stripes = 0.5 + 0.5 * sin(st.x * 20.0 * PI + u_time * 4.0);

    gl_FragColor = vec4(vec3(stripes), 1.0);
}
```

</details>
