# Quiz — Chapter 02: Hello World — Your First Shader

Test your understanding of uniforms, coordinate spaces, and basic shader construction.

---

## Multiple Choice

### Q1: What does `mix(a, b, 0.25)` return?

- [ ] A) 25% of `a` plus 75% of `b`
- [ ] B) 75% of `a` plus 25% of `b`
- [ ] C) The average of `a` and `b`
- [ ] D) Either `a` or `b` depending on which is larger

### Q2: If a canvas is 800×400 pixels, what is `gl_FragCoord.xy / u_resolution.xy` at the exact center?

- [ ] A) `vec2(400.0, 200.0)`
- [ ] B) `vec2(0.5, 0.5)`
- [ ] C) `vec2(1.0, 1.0)`
- [ ] D) `vec2(0.0, 0.0)`

### Q3: What happens if you declare `uniform float u_time;` in GLSL but never set it from JavaScript?

- [ ] A) The shader won't compile
- [ ] B) It defaults to 0.0
- [ ] C) It throws a runtime error
- [ ] D) It uses the system clock automatically

---

## True or False

### Q4: `vec3(0.5)` is shorthand for `vec3(0.5, 0.5, 0.5)`.

- [ ] True
- [ ] False

### Q5: The `u_mouse` uniform automatically updates itself — you don't need JavaScript to set it.

- [ ] True
- [ ] False

---

## Code Challenges

### Q6: Centered Circle Glow

Write a fragment shader that creates a white glow at the center of the screen that fades to black at the edges. Use `distance()` from the center point `vec2(0.5, 0.5)`.

```glsl
precision mediump float;
uniform vec2 u_resolution;

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    vec3 color = vec3(0.0);

    // TODO: compute distance from center, use it for brightness

    gl_FragColor = vec4(color, 1.0);
}
```

### Q7: Two-Color Animated Gradient

Write a shader that blends between deep blue `vec3(0.0, 0.1, 0.4)` and warm orange `vec3(1.0, 0.5, 0.0)` using a horizontal gradient that scrolls over time.

```glsl
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;

    // TODO: create a scrolling gradient using mix, fract, and u_time

    gl_FragColor = vec4(0.0);
}
```

---

## Answers

<details>
<summary>Click to reveal answers</summary>

1. **B)** 75% of `a` plus 25% of `b`. `mix(a, b, t)` returns `a * (1.0 - t) + b * t`. When t=0.25, you get 75% a + 25% b.

2. **B)** `vec2(0.5, 0.5)`. The center pixel is at (400, 200), divided by (800, 400) = (0.5, 0.5).

3. **B)** It defaults to 0.0. Unset uniforms are initialized to zero — the shader compiles and runs fine, you just won't get animation.

4. **True** — GLSL constructors allow a single value to fill all components.

5. **False** — All uniforms must be explicitly set from JavaScript each frame using `gl.uniform*()` calls.

6. Solution:
```glsl
precision mediump float;
uniform vec2 u_resolution;

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;

    float d = distance(st, vec2(0.5));
    float brightness = 1.0 - d * 2.0;  // fade to black at edges
    brightness = clamp(brightness, 0.0, 1.0);

    gl_FragColor = vec4(vec3(brightness), 1.0);
}
```

7. Solution:
```glsl
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;

    vec3 blue = vec3(0.0, 0.1, 0.4);
    vec3 orange = vec3(1.0, 0.5, 0.0);

    float t = fract(st.x + u_time * 0.2);
    vec3 color = mix(blue, orange, t);

    gl_FragColor = vec4(color, 1.0);
}
```

</details>
