precision mediump float;

uniform vec2 u_resolution;
uniform float u_time;

#define TWO_PI 6.28318530718

vec3 cosinePalette(in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d) {
    return a + b * cos(TWO_PI * (c * t + d));
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;

    // Cosine palette configuration
    vec3 a = vec3(0.5, 0.5, 0.5);
    vec3 b = vec3(0.5, 0.5, 0.5);
    vec3 c = vec3(1.0, 1.0, 1.0);
    vec3 d = vec3(0.00, 0.33, 0.67);

    vec3 color = cosinePalette(st.x + u_time * 0.1, a, b, c, d);

    gl_FragColor = vec4(color, 1.0);
}
