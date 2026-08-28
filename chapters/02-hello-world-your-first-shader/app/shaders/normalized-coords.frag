// Chapter 02: Normalized Coordinates
// The classic position-to-color mapping.
// Demonstrates u_resolution and coordinate normalization.

precision mediump float;

uniform vec2 u_resolution;

void main() {
    // gl_FragCoord.xy = pixel position (e.g. 234.5, 178.5)
    // u_resolution.xy = canvas size (e.g. 400.0, 400.0)
    // Dividing gives us 0.0 to 1.0 on each axis
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    
    // Map x to red, y to green
    gl_FragColor = vec4(st.x, st.y, 0.0, 1.0);
}
