// Chapter 01: Position → Color
// Each pixel uses its screen position to determine its color.
// This is the "hello world" of fragment shaders.

precision mediump float;

uniform vec2 u_resolution;  // Canvas width and height in pixels

void main() {
    // Normalize pixel coordinates from [0, resolution] to [0.0, 1.0]
    // This makes the shader resolution-independent.
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    
    // st.x goes 0→1 from left to right   → maps to Red
    // st.y goes 0→1 from bottom to top   → maps to Green
    // Blue is fixed at 0
    gl_FragColor = vec4(st.x, st.y, 0.0, 1.0);
}
