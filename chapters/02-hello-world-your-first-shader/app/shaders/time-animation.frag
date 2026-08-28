// Chapter 02: Time Animation
// u_time drives smooth color cycling.
// sin(u_time) oscillates -1..+1, remap to 0..1 with 0.5 + 0.5*sin(...)

precision mediump float;

uniform vec2 u_resolution;
uniform float u_time;

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    
    // Three colors
    vec3 a = vec3(0.2, 0.6, 0.9);  // sky blue
    vec3 b = vec3(0.9, 0.2, 0.4);  // coral
    vec3 c = vec3(0.1, 0.9, 0.5);  // mint
    
    // Time-based blend factor (0..1, oscillating)
    float t = 0.5 + 0.5 * sin(u_time);
    
    // Spatial blend (left=a, right=b) then mix with c over time
    vec3 color = mix(mix(a, b, st.x), c, t);
    
    gl_FragColor = vec4(color, 1.0);
}
