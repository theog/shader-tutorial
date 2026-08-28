/**
 * Chapter 02: Hello World — Your First Shader
 * Interactive app focused on uniforms, coordinate spaces, and gradients.
 *
 * Features:
 * - Live shader editor
 * - Coordinate space visualizer (pixel vs normalized vs centered)
 * - Uniform inspector showing real-time values
 * - Multiple gradient presets
 */

const { useState, useEffect, useRef, useCallback } = React;

// ============================================================
// ShaderCanvas — renders a fragment shader via WebGL
// ============================================================
function ShaderCanvas({ fragmentSource, width = 400, height = 400, onMouseInfo }) {
    const canvasRef = useRef(null);
    const glRef = useRef(null);
    const programRef = useRef(null);
    const animFrameRef = useRef(null);
    const startTimeRef = useRef(Date.now());
    const mouseRef = useRef([0, 0]);

    const vertexShaderSource = `
        attribute vec2 a_position;
        void main() {
            gl_Position = vec4(a_position, 0.0, 1.0);
        }
    `;

    const compileShader = useCallback((gl, type, source) => {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            const error = gl.getShaderInfoLog(shader);
            gl.deleteShader(shader);
            return { shader: null, error };
        }
        return { shader, error: null };
    }, []);

    const buildProgram = useCallback((gl, fragSrc) => {
        const { shader: vs, error: vsErr } = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
        if (vsErr) return { program: null, error: `Vertex: ${vsErr}` };

        const { shader: fs, error: fsErr } = compileShader(gl, gl.FRAGMENT_SHADER, fragSrc);
        if (fsErr) { gl.deleteShader(vs); return { program: null, error: fsErr }; }

        const program = gl.createProgram();
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            const error = gl.getProgramInfoLog(program);
            gl.deleteProgram(program);
            return { program: null, error };
        }

        return { program, error: null };
    }, [compileShader]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (!gl) return;
        glRef.current = gl;

        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            -1, -1, 1, -1, -1, 1,
            -1, 1, 1, -1, 1, 1
        ]), gl.STATIC_DRAW);

        return () => {
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        };
    }, []);

    useEffect(() => {
        const gl = glRef.current;
        if (!gl) return;

        if (programRef.current) gl.deleteProgram(programRef.current);

        const { program, error } = buildProgram(gl, fragmentSource);
        if (error) {
            console.warn('Shader compile error:', error);
            return;
        }

        programRef.current = program;
        startTimeRef.current = Date.now();

        const render = () => {
            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
            gl.clearColor(0, 0, 0, 1);
            gl.clear(gl.COLOR_BUFFER_BIT);

            gl.useProgram(program);

            const uRes = gl.getUniformLocation(program, 'u_resolution');
            const uTime = gl.getUniformLocation(program, 'u_time');
            const uMouse = gl.getUniformLocation(program, 'u_mouse');

            if (uRes) gl.uniform2f(uRes, gl.canvas.width, gl.canvas.height);
            if (uTime) gl.uniform1f(uTime, (Date.now() - startTimeRef.current) / 1000.0);
            if (uMouse) gl.uniform2f(uMouse, mouseRef.current[0], mouseRef.current[1]);

            const aPos = gl.getAttribLocation(program, 'a_position');
            gl.enableVertexAttribArray(aPos);
            gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

            gl.drawArrays(gl.TRIANGLES, 0, 6);
            animFrameRef.current = requestAnimationFrame(render);
        };

        render();
        return () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current); };
    }, [fragmentSource, buildProgram]);

    const handleMouseMove = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        const px = e.clientX - rect.left;
        const py = height - (e.clientY - rect.top);
        mouseRef.current = [px, py];
        if (onMouseInfo) {
            onMouseInfo({
                pixel: [Math.round(px), Math.round(py)],
                normalized: [px / width, py / height],
                centered: [(px / width) * 2 - 1, (py / height) * 2 - 1],
            });
        }
    };

    return (
        <canvas
            ref={canvasRef}
            width={width}
            height={height}
            onMouseMove={handleMouseMove}
            style={{ borderRadius: '8px', border: '1px solid #333', cursor: 'crosshair' }}
        />
    );
}

// ============================================================
// ShaderEditor
// ============================================================
function ShaderEditor({ value, onChange }) {
    return (
        <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            spellCheck={false}
            style={{
                width: '100%',
                height: '300px',
                fontFamily: "'SF Mono', 'Fira Code', monospace",
                fontSize: '12px',
                backgroundColor: '#0d1117',
                color: '#c9d1d9',
                border: '1px solid #333',
                borderRadius: '8px',
                padding: '12px',
                resize: 'vertical',
                lineHeight: '1.6',
                tabSize: 4,
            }}
        />
    );
}

// ============================================================
// Coordinate Inspector — shows live coordinate values
// ============================================================
function CoordinateInspector({ mouseInfo }) {
    if (!mouseInfo) return (
        <div style={{ fontSize: '12px', color: '#555', padding: '12px', background: '#161b22', borderRadius: '8px', border: '1px solid #30363d' }}>
            Hover over the canvas to see coordinate values...
        </div>
    );

    const { pixel, normalized, centered } = mouseInfo;
    return (
        <div style={{ fontSize: '12px', padding: '12px', background: '#161b22', borderRadius: '8px', border: '1px solid #30363d' }}>
            <div style={{ marginBottom: '6px' }}>
                <span style={{ color: '#f85149' }}>Pixel space:</span>{' '}
                <code style={{ color: '#c9d1d9' }}>gl_FragCoord = ({pixel[0]}, {pixel[1]})</code>
            </div>
            <div style={{ marginBottom: '6px' }}>
                <span style={{ color: '#3fb950' }}>Normalized:</span>{' '}
                <code style={{ color: '#c9d1d9' }}>st = ({normalized[0].toFixed(3)}, {normalized[1].toFixed(3)})</code>
            </div>
            <div>
                <span style={{ color: '#58a6ff' }}>Centered:</span>{' '}
                <code style={{ color: '#c9d1d9' }}>pos = ({centered[0].toFixed(3)}, {centered[1].toFixed(3)})</code>
            </div>
        </div>
    );
}

// ============================================================
// Uniform Monitor — shows current uniform values
// ============================================================
function UniformMonitor() {
    const [time, setTime] = useState(0);
    const startRef = useRef(Date.now());

    useEffect(() => {
        const interval = setInterval(() => {
            setTime(((Date.now() - startRef.current) / 1000).toFixed(2));
        }, 100);
        return () => clearInterval(interval);
    }, []);

    return (
        <div style={{ fontSize: '12px', padding: '12px', background: '#161b22', borderRadius: '8px', border: '1px solid #30363d', marginTop: '8px' }}>
            <div style={{ color: '#888', marginBottom: '4px', fontWeight: 'bold' }}>Live Uniforms:</div>
            <div><code style={{ color: '#ff7b72' }}>u_resolution</code> = <code style={{ color: '#c9d1d9' }}>vec2(400.0, 400.0)</code></div>
            <div><code style={{ color: '#ff7b72' }}>u_time</code> = <code style={{ color: '#c9d1d9' }}>{time}s</code></div>
            <div style={{ color: '#555', marginTop: '4px', fontStyle: 'italic' }}>These values are sent from JS every frame</div>
        </div>
    );
}

// ============================================================
// Presets
// ============================================================
const PRESETS = [
    {
        name: '1. Solid Color',
        description: 'Every pixel outputs the same color. The simplest shader possible.',
        code: `precision mediump float;

void main() {
    // Try changing these values (0.0 to 1.0)
    // vec4(Red, Green, Blue, Alpha)
    gl_FragColor = vec4(0.0, 0.8, 0.6, 1.0);
}`
    },
    {
        name: '2. Normalized Coordinates',
        description: 'Map position to color — the fundamental technique for everything that follows.',
        code: `precision mediump float;
uniform vec2 u_resolution;

void main() {
    // Normalize: pixel coords -> 0.0 to 1.0
    vec2 st = gl_FragCoord.xy / u_resolution.xy;

    // Position becomes color
    // Left=dark, Right=red, Top=green, TopRight=yellow
    gl_FragColor = vec4(st.x, st.y, 0.0, 1.0);
}`
    },
    {
        name: '3. Centered Coordinates',
        description: 'Remap to -1..+1 with origin at center. Essential for radial effects.',
        code: `precision mediump float;
uniform vec2 u_resolution;

void main() {
    // Remap from 0..1 to -1..+1 (center = origin)
    vec2 st = (gl_FragCoord.xy / u_resolution.xy) * 2.0 - 1.0;

    // Fix aspect ratio so circles aren't ovals
    st.x *= u_resolution.x / u_resolution.y;

    // Distance from center
    float d = length(st);

    // Radial gradient: white at center, black at edges
    float brightness = 1.0 - d;

    gl_FragColor = vec4(vec3(brightness), 1.0);
}`
    },
    {
        name: '4. mix() Gradients',
        description: 'Linear interpolation between two colors using mix(). The core blending tool.',
        code: `precision mediump float;
uniform vec2 u_resolution;

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;

    // Define two endpoint colors
    vec3 sunset = vec3(0.9, 0.3, 0.1);   // warm orange
    vec3 night  = vec3(0.05, 0.0, 0.2);  // deep purple

    // mix(a, b, t): returns a*(1-t) + b*t
    // st.y=0 (bottom) -> night, st.y=1 (top) -> sunset
    vec3 color = mix(night, sunset, st.y);

    gl_FragColor = vec4(color, 1.0);
}`
    },
    {
        name: '5. Time Animation',
        description: 'u_time drives oscillation. sin() maps time to smooth back-and-forth motion.',
        code: `precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;

    // Three colors that cycle over time
    vec3 a = vec3(0.2, 0.6, 0.9);  // sky blue
    vec3 b = vec3(0.9, 0.2, 0.4);  // coral
    vec3 c = vec3(0.1, 0.9, 0.5);  // mint

    // Oscillate blend factor between 0 and 1
    float t = 0.5 + 0.5 * sin(u_time);

    // Blend based on position AND time
    vec3 color = mix(
        mix(a, b, st.x),   // horizontal blend
        c,                   // target
        t                    // time-driven mix
    );

    gl_FragColor = vec4(color, 1.0);
}`
    },
    {
        name: '6. Mouse Reactive',
        description: 'u_mouse creates interactivity. Distance from cursor controls brightness.',
        code: `precision mediump float;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    vec2 mouse = u_mouse / u_resolution;

    // Distance from pixel to mouse (normalized)
    float d = distance(st, mouse);

    // Smooth falloff: bright near mouse, dark far away
    float glow = smoothstep(0.4, 0.0, d);

    // Color the glow with time-shifting hue
    vec3 color = glow * vec3(
        0.5 + 0.5 * sin(u_time),
        0.5 + 0.5 * sin(u_time + 2.094),
        0.5 + 0.5 * sin(u_time + 4.189)
    );

    gl_FragColor = vec4(color, 1.0);
}`
    },
    {
        name: '7. Scrolling Gradient',
        description: 'fract() creates repetition. Combined with time, patterns scroll infinitely.',
        code: `precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;

    // fract() returns fractional part: fract(2.7) = 0.7
    // Adding time makes it scroll, fract keeps it looping 0->1
    float t = fract(st.x * 3.0 - u_time * 0.3);

    vec3 deep = vec3(0.0, 0.1, 0.4);
    vec3 bright = vec3(1.0, 0.8, 0.2);

    // Smooth the transition with smoothstep instead of linear mix
    float blend = smoothstep(0.0, 0.5, t) - smoothstep(0.5, 1.0, t);
    vec3 color = mix(deep, bright, blend);

    gl_FragColor = vec4(color, 1.0);
}`
    },
];

// ============================================================
// ChapterNav — Top navigation bar for chapter apps
// ============================================================
function ChapterNav({ currentChapterNum = '02' }) {
    const chapters = [
        { num: '01', slug: '01-what-is-a-fragment-shader', title: 'Chapter 01: What Is a Fragment Shader?' },
        { num: '02', slug: '02-hello-world-your-first-shader', title: 'Chapter 02: Hello World' },
        { num: '03', slug: '03-shaping-functions', title: 'Chapter 03: Shaping Functions' },
    ];
    const currentIndex = chapters.findIndex(c => c.num === currentChapterNum);
    const prevChapter = currentIndex > 0 ? chapters[currentIndex - 1] : null;
    const nextChapter = currentIndex < chapters.length - 1 ? chapters[currentIndex + 1] : null;

    return (
        <nav style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            padding: '12px 18px',
            marginBottom: '24px',
            background: 'rgba(22, 27, 34, 0.9)',
            backdropFilter: 'blur(8px)',
            borderRadius: '10px',
            border: '1px solid #30363d',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <a
                    href="../../../index.html"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        background: '#21262d',
                        color: '#58a6ff',
                        border: '1px solid #30363d',
                        borderRadius: '6px',
                        textDecoration: 'none',
                        fontSize: '13px',
                        fontWeight: '500',
                        transition: 'all 0.2s ease'
                    }}
                >
                    <span>←</span> All Chapters
                </a>
                <span style={{ color: '#8b949e', fontSize: '13px' }}>/</span>
                <span style={{ color: '#e6edf3', fontSize: '13px', fontWeight: '600' }}>
                    {chapters[currentIndex]?.title || `Chapter ${currentChapterNum}`}
                </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <select
                    value={chapters[currentIndex]?.slug || ''}
                    onChange={(e) => {
                        if (e.target.value) {
                            window.location.href = `../../../chapters/${e.target.value}/app/index.html`;
                        }
                    }}
                    style={{
                        background: '#0d1117',
                        color: '#c9d1d9',
                        border: '1px solid #30363d',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        outline: 'none'
                    }}
                >
                    {chapters.map(c => (
                        <option key={c.num} value={c.slug}>
                            {c.title}
                        </option>
                    ))}
                </select>

                {prevChapter ? (
                    <a
                        href={`../../../chapters/${prevChapter.slug}/app/index.html`}
                        style={{
                            padding: '6px 12px',
                            background: '#21262d',
                            color: '#c9d1d9',
                            border: '1px solid #30363d',
                            borderRadius: '6px',
                            textDecoration: 'none',
                            fontSize: '12px',
                            fontWeight: '500'
                        }}
                    >
                        ← Prev
                    </a>
                ) : (
                    <span style={{
                        padding: '6px 12px',
                        background: '#161b22',
                        color: '#484f58',
                        border: '1px solid #21262d',
                        borderRadius: '6px',
                        fontSize: '12px',
                        cursor: 'not-allowed'
                    }}>
                        ← Prev
                    </span>
                )}

                {nextChapter ? (
                    <a
                        href={`../../../chapters/${nextChapter.slug}/app/index.html`}
                        style={{
                            padding: '6px 12px',
                            background: '#238636',
                            color: '#ffffff',
                            border: '1px solid rgba(240,246,252,0.1)',
                            borderRadius: '6px',
                            textDecoration: 'none',
                            fontSize: '12px',
                            fontWeight: '600'
                        }}
                    >
                        Next →
                    </a>
                ) : (
                    <span style={{
                        padding: '6px 12px',
                        background: '#161b22',
                        color: '#484f58',
                        border: '1px solid #21262d',
                        borderRadius: '6px',
                        fontSize: '12px',
                        cursor: 'not-allowed'
                    }}>
                        Next →
                    </span>
                )}
            </div>
        </nav>
    );
}

// ============================================================
// Main App
// ============================================================
function App() {
    const [shaderSource, setShaderSource] = useState(PRESETS[1].code);
    const [activePreset, setActivePreset] = useState(1);
    const [mouseInfo, setMouseInfo] = useState(null);

    const loadPreset = (index) => {
        setActivePreset(index);
        setShaderSource(PRESETS[index].code);
    };

    return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Top Navigation */}
            <ChapterNav currentChapterNum="02" />

            {/* Header */}
            <header style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '24px', color: '#58a6ff', marginBottom: '4px' }}>
                    Chapter 02: Hello World — Your First Shader
                </h1>
                <p style={{ color: '#888' }}>
                    Explore uniforms, coordinate spaces, and gradients. Hover over the canvas to see live coordinate values.
                </p>
            </header>

            {/* Preset selector */}
            <section style={{ marginBottom: '16px' }}>
                <h3 style={{ fontSize: '14px', color: '#aaa', marginBottom: '8px' }}>
                    Examples — Progressive Complexity:
                </h3>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {PRESETS.map((preset, i) => (
                        <button
                            key={i}
                            onClick={() => loadPreset(i)}
                            style={{
                                padding: '5px 10px',
                                borderRadius: '6px',
                                border: activePreset === i ? '1px solid #58a6ff' : '1px solid #333',
                                background: activePreset === i ? '#1f3a5f' : '#161b22',
                                color: activePreset === i ? '#58a6ff' : '#aaa',
                                cursor: 'pointer',
                                fontSize: '11px',
                            }}
                        >
                            {preset.name}
                        </button>
                    ))}
                </div>
                <p style={{ fontSize: '12px', color: '#666', marginTop: '6px' }}>
                    {PRESETS[activePreset].description}
                </p>
            </section>

            {/* Editor + Canvas */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>
                <div>
                    <h3 style={{ marginBottom: '8px', fontSize: '14px', color: '#aaa' }}>
                        Shader Code
                    </h3>
                    <ShaderEditor value={shaderSource} onChange={setShaderSource} />
                    <UniformMonitor />
                </div>
                <div>
                    <h3 style={{ marginBottom: '8px', fontSize: '14px', color: '#aaa' }}>
                        Output — hover for coordinates
                    </h3>
                    <ShaderCanvas
                        fragmentSource={shaderSource}
                        width={400}
                        height={400}
                        onMouseInfo={setMouseInfo}
                    />
                    <div style={{ marginTop: '8px' }}>
                        <CoordinateInspector mouseInfo={mouseInfo} />
                    </div>
                </div>
            </div>

            {/* Concept cards */}
            <section style={{
                marginTop: '32px',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '12px'
            }}>
                <div style={{ padding: '16px', background: '#161b22', borderRadius: '8px', border: '1px solid #30363d' }}>
                    <h4 style={{ fontSize: '13px', color: '#f85149', marginBottom: '6px' }}>u_resolution</h4>
                    <p style={{ fontSize: '11px', color: '#888', lineHeight: '1.6' }}>
                        Canvas size in pixels. Divide <code>gl_FragCoord</code> by this to normalize coordinates to 0–1.
                    </p>
                </div>
                <div style={{ padding: '16px', background: '#161b22', borderRadius: '8px', border: '1px solid #30363d' }}>
                    <h4 style={{ fontSize: '13px', color: '#3fb950', marginBottom: '6px' }}>u_time</h4>
                    <p style={{ fontSize: '11px', color: '#888', lineHeight: '1.6' }}>
                        Seconds since start. Use with <code>sin()</code> for oscillation, or add to coordinates for scrolling.
                    </p>
                </div>
                <div style={{ padding: '16px', background: '#161b22', borderRadius: '8px', border: '1px solid #30363d' }}>
                    <h4 style={{ fontSize: '13px', color: '#58a6ff', marginBottom: '6px' }}>u_mouse</h4>
                    <p style={{ fontSize: '11px', color: '#888', lineHeight: '1.6' }}>
                        Cursor position in pixels. Normalize by dividing by <code>u_resolution</code> to use with <code>distance()</code>.
                    </p>
                </div>
            </section>

            {/* Key formula reference */}
            <section style={{
                marginTop: '16px',
                padding: '20px',
                background: '#0d1117',
                borderRadius: '12px',
                border: '1px solid #30363d'
            }}>
                <h3 style={{ fontSize: '14px', color: '#58a6ff', marginBottom: '12px' }}>Quick Reference</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12px' }}>
                    <div>
                        <code style={{ color: '#ff7b72' }}>vec2 st = gl_FragCoord.xy / u_resolution.xy;</code>
                        <p style={{ color: '#666', marginTop: '2px' }}>Normalize to 0..1</p>
                    </div>
                    <div>
                        <code style={{ color: '#ff7b72' }}>vec2 pos = st * 2.0 - 1.0;</code>
                        <p style={{ color: '#666', marginTop: '2px' }}>Center to -1..+1</p>
                    </div>
                    <div>
                        <code style={{ color: '#ff7b72' }}>mix(a, b, t)</code>
                        <p style={{ color: '#666', marginTop: '2px' }}>Blend: a*(1-t) + b*t</p>
                    </div>
                    <div>
                        <code style={{ color: '#ff7b72' }}>0.5 + 0.5 * sin(u_time)</code>
                        <p style={{ color: '#666', marginTop: '2px' }}>Oscillate 0..1</p>
                    </div>
                </div>
            </section>

            <footer style={{ marginTop: '32px', color: '#333', fontSize: '11px', textAlign: 'center' }}>
                Shader Tutorial — Chapter 02 | Hover over canvas to inspect coordinates
            </footer>
        </div>
    );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
