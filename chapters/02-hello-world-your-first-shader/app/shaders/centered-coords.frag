// Chapter 02: Centered Coordinates
// Remap to -1..+1 with origin at center.
// Essential for circles, radial effects, rotations.

precision mediump float;

uniform vec2 u_resolution;

void main() {
    // Step 1: normalize to 0..1
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    
    // Step 2: remap to -1..+1 (center becomes origin)
    st = st * 2.0 - 1.0;
    
    // Step 3: fix aspect ratio (circles stay round)
    st.x *= u_resolution.x / u_resolution.y;
    
    // Distance from center (origin)
    float d = length(st);
    
    // White at center, fading to black
    float brightness = 1.0 - d;
    
    gl_FragColor = vec4(vec3(brightness), 1.0);
}
