// Chapter 02: Mouse Reactive Glow
// u_mouse enables interactivity.
// Distance from pixel to cursor controls brightness.

precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    
    // Normalize mouse to same 0..1 space
    vec2 mouse = u_mouse / u_resolution;
    
    // Distance from this pixel to the mouse cursor
    float d = distance(st, mouse);
    
    // smoothstep creates a soft falloff
    // smoothstep(edge0, edge1, x): returns 0 when x<edge0, 1 when x>edge1
    // Here: full glow (1.0) when d=0, fading to 0 at d=0.4
    float glow = smoothstep(0.4, 0.0, d);
    
    // Shift hue over time using offset sin waves
    vec3 color = glow * vec3(
        0.5 + 0.5 * sin(u_time),           // R oscillates
        0.5 + 0.5 * sin(u_time + 2.094),   // G offset by 2pi/3
        0.5 + 0.5 * sin(u_time + 4.189)    // B offset by 4pi/3
    );
    
    gl_FragColor = vec4(color, 1.0);
}
