// Chapter 03: abs() mirror
// Absolute value creates V-shape symmetry.
// Combined with centering, creates peaks in the middle.

precision mediump float;
uniform vec2 u_resolution;

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    
    // Remap 0..1 to -1..+1 (center = 0)
    // abs() mirrors: both sides become positive
    // Invert: 1.0 - abs(...) gives peak at center
    float value = 1.0 - abs(st.x * 2.0 - 1.0);
    
    gl_FragColor = vec4(vec3(value), 1.0);
}
