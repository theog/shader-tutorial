// Chapter 03: smoothstep()
// S-curve transition between two edges.
// The soft, anti-aliased alternative to step().

precision mediump float;
uniform vec2 u_resolution;

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    
    // smoothstep(edge0, edge1, x)
    // 0 when x <= edge0, 1 when x >= edge1
    // Hermite S-curve between: 3t^2 - 2t^3
    float value = smoothstep(0.3, 0.7, st.x);
    
    gl_FragColor = vec4(vec3(value), 1.0);
}
