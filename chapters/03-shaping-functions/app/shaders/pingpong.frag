// Chapter 03: Ping-pong (triangle wave)
// Combines fract() and abs() to create a bouncing pattern.
// Goes up 0→1 then back down 1→0, repeating.

precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    
    // Triangle wave formula:
    // abs(fract(x) * 2.0 - 1.0)
    //   fract: creates sawtooth 0→1
    //   * 2 - 1: remap to -1→+1
    //   abs: fold negatives up → triangle shape
    
    float value = abs(fract(st.x * 3.0 + u_time * 0.5) * 2.0 - 1.0);
    
    gl_FragColor = vec4(vec3(value), 1.0);
}
