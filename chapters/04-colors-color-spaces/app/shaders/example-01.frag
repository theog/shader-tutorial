// Chapter 04: Colors {{CHAPTER_TITLE}} Color Spaces
// {{SHADER_DESCRIPTION}}

precision mediump float;

uniform vec2 u_resolution;  // Canvas size in pixels
uniform float u_time;        // Time in seconds since load
uniform vec2 u_mouse;        // Mouse position in pixels

void main() {
    // Normalize pixel coordinates to 0.0 - 1.0
    vec2 st = gl_FragCoord.xy / u_resolution.xy;

    // Default: black
    vec3 color = vec3(0.0);

    // --- Your shader code here ---



    // --- End shader code ---

    gl_FragColor = vec4(color, 1.0);
}
