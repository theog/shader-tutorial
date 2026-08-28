// Chapter 02: Scrolling Gradient
// fract() creates infinite repetition.
// Adding u_time makes patterns scroll.

precision mediump float;

uniform vec2 u_resolution;
uniform float u_time;

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    
    // fract() returns the fractional part:
    //   fract(0.7) = 0.7
    //   fract(1.7) = 0.7
    //   fract(2.7) = 0.7
    // This creates repetition!
    
    // Multiply st.x by 3 = three repetitions across width
    // Subtract time = scroll to the right
    float t = fract(st.x * 3.0 - u_time * 0.3);
    
    vec3 deep   = vec3(0.0, 0.1, 0.4);
    vec3 bright = vec3(1.0, 0.8, 0.2);
    
    // Create a soft bump shape instead of linear ramp
    float blend = smoothstep(0.0, 0.5, t) - smoothstep(0.5, 1.0, t);
    vec3 color = mix(deep, bright, blend);
    
    gl_FragColor = vec4(color, 1.0);
}
