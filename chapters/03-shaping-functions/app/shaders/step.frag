// Chapter 03: step()
// Hard binary cutoff. Everything below edge = black, above = white.

precision mediump float;
uniform vec2 u_resolution;

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    
    // step(edge, x): 0 when x < edge, 1 when x >= edge
    // Try changing 0.5 to other values
    float value = step(0.5, st.x);
    
    gl_FragColor = vec4(vec3(value), 1.0);
}
