precision mediump float;

uniform vec2 u_resolution;
uniform float u_time;

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;

    vec3 colorA = vec3(0.149, 0.141, 0.912); // Blue
    vec3 colorB = vec3(1.000, 0.833, 0.224); // Gold

    // Smoothstep transition curve
    float pct = smoothstep(0.1, 0.9, st.x + 0.1 * sin(st.y * 6.0 + u_time));

    vec3 color = mix(colorA, colorB, pct);

    gl_FragColor = vec4(color, 1.0);
}
