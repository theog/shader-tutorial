// Chapter 03: Pulse (composed function)
// Two smoothsteps subtracted = a soft bump/band.
// This is how you draw soft lines in shaders.

precision mediump float;
uniform vec2 u_resolution;

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    
    // Pulse centered at 0.5 with controllable width
    float center = 0.5;
    float width = 0.15;
    
    // Rise from 0 to 1...
    float rise = smoothstep(center - width, center, st.x);
    // ...then fall from 1 to 0
    float fall = smoothstep(center, center + width, st.x);
    
    // Subtract: creates a bump
    float pulse = rise - fall;
    
    gl_FragColor = vec4(vec3(pulse), 1.0);
}
