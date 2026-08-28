// Chapter 03: sin() wave
// Smooth periodic oscillation. Animated with u_time.

precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;

#define PI 3.14159265359

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    
    // sin() oscillates -1 to +1
    // Remap to 0..1: 0.5 + 0.5 * sin(...)
    // Multiply x for frequency, add time for animation
    float freq = 6.0;
    float wave = 0.5 + 0.5 * sin(st.x * freq * PI + u_time * 3.0);
    
    gl_FragColor = vec4(vec3(wave), 1.0);
}
