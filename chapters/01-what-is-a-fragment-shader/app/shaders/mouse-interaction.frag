// Chapter 01: Mouse Interaction
// The shader reacts to mouse position via the u_mouse uniform.
// Move your cursor over the canvas to see the bright spot follow.

precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;   // Mouse position in pixels
uniform float u_time;

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    
    // Normalize mouse position to 0–1
    vec2 mouse = u_mouse / u_resolution;
    
    // Compute distance from this pixel to the mouse
    float dist = distance(st, mouse);
    
    // Create a bright spot: full brightness at mouse, fading out
    float brightness = 1.0 - smoothstep(0.0, 0.3, dist);
    
    // Tint the brightness with position-based color
    gl_FragColor = vec4(
        brightness * st.x,
        brightness * st.y,
        brightness,
        1.0
    );
}
