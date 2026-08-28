// Chapter 01: Adding Time
// The blue channel oscillates with u_time, creating animation.
// Every pixel reads the same u_time value — coherent animation emerges.

precision mediump float;

uniform vec2 u_resolution;
uniform float u_time;  // Seconds since shader started

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    
    // sin() oscillates between -1 and 1.
    // Remap to 0–1 with: 0.5 + 0.5 * sin(...)
    float blue = 0.5 + 0.5 * sin(u_time);
    
    gl_FragColor = vec4(st.x, st.y, blue, 1.0);
}
