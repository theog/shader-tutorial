// Chapter 02: Solid Color
// The absolute minimum shader — every pixel is identical.
// No uniforms needed.

precision mediump float;

void main() {
    // vec4(Red, Green, Blue, Alpha)
    // All values range from 0.0 to 1.0
    gl_FragColor = vec4(0.0, 0.8, 0.6, 1.0);
}
