// Chapter 03: fract() sawtooth
// Fractional part creates repeating ramps.
// Foundation of tiling and patterns.

precision mediump float;
uniform vec2 u_resolution;

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    
    // fract(x) = x - floor(x)
    // When x goes 0→5, fract repeats 0→1 five times
    float value = fract(st.x * 5.0);
    
    gl_FragColor = vec4(vec3(value), 1.0);
}
