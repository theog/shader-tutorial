// Chapter 03: pow()
// Power curves bend the linear ramp.
// n > 1: concentrates values near 0 (darker midtones)
// n < 1: concentrates values near 1 (brighter midtones)

precision mediump float;
uniform vec2 u_resolution;

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    
    // Compare three power curves vertically
    float value;
    
    if (st.y > 0.66) {
        value = pow(st.x, 0.4);   // top: sqrt-like (bright)
    } else if (st.y > 0.33) {
        value = st.x;              // middle: linear
    } else {
        value = pow(st.x, 3.0);   // bottom: cubic (dark)
    }
    
    gl_FragColor = vec4(vec3(value), 1.0);
}
