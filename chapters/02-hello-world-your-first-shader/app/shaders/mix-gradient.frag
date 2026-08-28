// Chapter 02: mix() Gradient
// Linear interpolation between two colors.
// mix(a, b, t) = a * (1.0 - t) + b * t

precision mediump float;

uniform vec2 u_resolution;

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    
    // Define two colors
    vec3 sunset = vec3(0.9, 0.3, 0.1);   // warm orange
    vec3 night  = vec3(0.05, 0.0, 0.2);  // deep purple
    
    // Vertical gradient: night at bottom, sunset at top
    // st.y = 0.0 at bottom -> night
    // st.y = 1.0 at top    -> sunset
    vec3 color = mix(night, sunset, st.y);
    
    gl_FragColor = vec4(color, 1.0);
}
