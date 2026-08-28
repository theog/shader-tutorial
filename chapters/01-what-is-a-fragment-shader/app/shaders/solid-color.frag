// Chapter 01: Solid Color
// The simplest possible fragment shader — every pixel is the same color.

precision mediump float;

void main() {
    // vec4(Red, Green, Blue, Alpha) — values from 0.0 to 1.0
    // Try changing these values!
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}
