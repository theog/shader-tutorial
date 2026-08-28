# Quiz — Chapter 01: What Is a Fragment Shader?

Test your understanding of GPU rendering and fragment shader basics.

---

## Multiple Choice

### Q1: What does a fragment shader compute?

- [ ] A) The position of vertices in 3D space
- [ ] B) The color of a single pixel
- [ ] C) The physics simulation for each frame
- [ ] D) The order in which pixels are drawn

### Q2: What does `gl_FragCoord` contain?

- [ ] A) The final output color of the pixel
- [ ] B) The canvas resolution in pixels
- [ ] C) The pixel's position in screen coordinates
- [ ] D) The mouse position

### Q3: Why do we divide `gl_FragCoord.xy` by `u_resolution.xy`?

- [ ] A) To make the shader run faster
- [ ] B) To flip the Y axis
- [ ] C) To normalize coordinates to the 0.0–1.0 range regardless of canvas size
- [ ] D) To convert from integers to floats

---

## True or False

### Q4: A fragment shader can read the color that a neighboring pixel computed.

- [ ] True
- [ ] False

### Q5: The `uniform` keyword means the value is different for each pixel.

- [ ] True
- [ ] False

---

## Code Challenges

### Q6: Vertical Gradient

Write a fragment shader that creates a gradient from **black at the bottom** to **white at the top** (grayscale, no color).

```glsl
// Your shader here
precision mediump float;
uniform vec2 u_resolution;

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    vec3 color = vec3(0.0);

    // TODO: make color go from black (bottom) to white (top)

    gl_FragColor = vec4(color, 1.0);
}
```

### Q7: Pulsing Circle of Color

Write a fragment shader where:
- The red channel equals the normalized x position
- The green channel equals the normalized y position
- The blue channel oscillates between 0.0 and 1.0 using `sin(u_time)`

```glsl
// Your shader here
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;

    // TODO: assign r, g, b

    gl_FragColor = vec4(0.0);
}
```

---

## Answers

<details>
<summary>Click to reveal answers</summary>

1. **B)** The color of a single pixel — that's the entire job of a fragment shader.

2. **C)** The pixel's position in screen coordinates — this is the built-in input telling each thread which pixel it's responsible for.

3. **C)** To normalize coordinates to 0.0–1.0 — this makes the shader resolution-independent.

4. **False** — Each fragment shader instance is completely isolated. There's no way to read another pixel's output during the same pass.

5. **False** — `uniform` means the value is the *same* for every pixel (uniform across all threads). It's set once from the CPU side.

6. Solution:
```glsl
precision mediump float;
uniform vec2 u_resolution;

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    vec3 color = vec3(st.y);  // y goes 0→1 from bottom→top
    gl_FragColor = vec4(color, 1.0);
}
```

7. Solution:
```glsl
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    float r = st.x;
    float g = st.y;
    float b = 0.5 + 0.5 * sin(u_time);  // oscillate 0→1
    gl_FragColor = vec4(r, g, b, 1.0);
}
```

</details>



My Questions:
1) I dont understand the  u_resolution. where does it come from and what effect does divide have.
  vec2 st = gl_FragCoord.xy / u_resolution.xy;
