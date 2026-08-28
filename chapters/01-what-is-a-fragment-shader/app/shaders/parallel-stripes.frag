// Chapter 01: Parallel Proof — Animated Stripes
// Each pixel independently decides if it's in a stripe.
// No pixel communicates with its neighbors — yet a coherent pattern emerges.

precision mediump float;

uniform vec2 u_resolution;
uniform float u_time;

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    
    // fract() returns the fractional part: fract(2.7) = 0.7
    // Multiplying st.x by 10 creates 10 repetitions across the width
    // Adding u_time makes them scroll
    // step(0.5, ...) turns it into hard on/off stripes
    float stripes = step(0.5, fract(st.x * 10.0 + u_time));
    
    // mix() blends between two colors based on the stripe value (0 or 1)
    vec3 color = mix(
        vec3(0.1, 0.1, 0.3),  // dark blue  (stripe = 0)
        vec3(0.9, 0.6, 0.1),  // gold       (stripe = 1)
        stripes
    );
    
    gl_FragColor = vec4(color, 1.0);
}
