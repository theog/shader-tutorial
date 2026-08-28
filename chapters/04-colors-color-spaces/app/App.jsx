/**
 * Chapter 04: Colors & Color Spaces
 * Interactive app for RGB mixing, HSB polar wheels, and Inigo Quilez Cosine Palettes.
 *
 * Features:
 * - Live WebGL canvas with instant compilation
 * - Real-time slider controls for HSB, RGB mixing, and Cosine palette parameters
 * - Dynamic GLSL code synchronization
 * - 5 Interactive visual presets
 */

const { useState, useEffect, useRef, useCallback } = React;

// ============================================================
// ShaderCanvas — WebGL Fragment Renderer
// ============================================================
function ShaderCanvas({ fragmentSource, width = 400, height = 400 }) {
    const canvasRef = useRef(null);
    const glRef = useRef(null);
    const programRef = useRef(null);
    const animFrameRef = useRef(null);
    const startTimeRef = useRef(Date.now());
    const mouseRef = useRef([0, 0]);

    const vertexShaderSource = `
        attribute vec2 a_position;
        void main() { gl_Position = vec4(a_position, 0.0, 1.0); }
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
        if (vsErr) return { program: null, error: vsErr };
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
            -1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1
        ]), gl.STATIC_DRAW);
        return () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current); };
    }, []);

    useEffect(() => {
        const gl = glRef.current;
        if (!gl) return;
        if (programRef.current) gl.deleteProgram(programRef.current);
        const { program, error } = buildProgram(gl, fragmentSource);
        if (error) { console.warn('Shader error:', error); return; }
        programRef.current = program;
        startTimeRef.current = Date.now();

        const render = () => {
            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
            gl.clearColor(0,0,0,1); gl.clear(gl.COLOR_BUFFER_BIT);
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
        mouseRef.current = [e.clientX - rect.left, height - (e.clientY - rect.top)];
    };

    return (
        <canvas ref={canvasRef} width={width} height={height}
            onMouseMove={handleMouseMove}
            style={{ borderRadius: '8px', border: '1px solid #30363d', width: '100%', maxWidth: `${width}px` }} />
    );
}

// ============================================================
// ShaderEditor
// ============================================================
function ShaderEditor({ value, onChange }) {
    return (
        <textarea value={value} onChange={(e) => onChange(e.target.value)}
            spellCheck={false}
            style={{
                width: '100%', height: '340px',
                fontFamily: "'SF Mono', 'Fira Code', monospace",
                fontSize: '12px', backgroundColor: '#0d1117',
                color: '#c9d1d9', border: '1px solid #333',
                borderRadius: '8px', padding: '12px',
                resize: 'vertical', lineHeight: '1.6', tabSize: 4,
            }} />
    );
}

// ============================================================
// Slider
// ============================================================
function Slider({ label, min = 0, max = 1, step = 0.01, value, onChange }) {
    return (
        <div style={{ marginBottom: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#888' }}>
                <span>{label}</span>
                <strong style={{ color: '#58a6ff' }}>{Number(value).toFixed(2)}</strong>
            </div>
            <input type="range" min={min} max={max} step={step} value={value}
                onChange={(e) => onChange(parseFloat(e.target.value))}
                style={{ width: '100%', marginTop: '2px' }} />
        </div>
    );
}

// ============================================================
// ChapterNav — Top navigation bar for chapter apps
// ============================================================
function ChapterNav({ currentChapterNum = '04' }) {
    const chapters = [
        { num: '01', slug: '01-what-is-a-fragment-shader', title: 'Chapter 01: What Is a Fragment Shader?' },
        { num: '02', slug: '02-hello-world-your-first-shader', title: 'Chapter 02: Hello World' },
        { num: '03', slug: '03-shaping-functions', title: 'Chapter 03: Shaping Functions' },
        { num: '04', slug: '04-colors-color-spaces', title: 'Chapter 04: Colors & Color Spaces' },
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
// Presets Configuration
// ============================================================
const PRESETS = [
    {
        name: '1. Smooth Gradient Mix',
        description: 'Blends between two colors using smoothstep transition shaping.',
        params: { smoothness: 0.8, angleOffset: 0.2 },
        sliders: [
            { key: 'smoothness', label: 'Transition Curve Width', min: 0.1, max: 1.0, step: 0.05 },
            { key: 'angleOffset', label: 'Wave Distortion', min: 0.0, max: 0.5, step: 0.02 },
        ],
        getCode: (p) => `precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;

    vec3 colorA = vec3(0.149, 0.141, 0.912); // Deep blue
    vec3 colorB = vec3(1.000, 0.833, 0.224); // Warm gold

    // Smoothstep transition with sine wave distortion
    float wave = ${Number(p.angleOffset).toFixed(2)} * sin(st.y * 6.28 + u_time);
    float width = ${Number(p.smoothness).toFixed(2)};
    float pct = smoothstep(0.5 - width*0.5, 0.5 + width*0.5, st.x + wave);

    vec3 color = mix(colorA, colorB, pct);

    gl_FragColor = vec4(color, 1.0);
}`
    },
    {
        name: '2. HSB Polar Color Wheel',
        description: 'Converts Cartesian coords to Polar space (Angle & Radius) to draw a continuous hue wheel.',
        params: { saturationScale: 1.2, speed: 0.2 },
        sliders: [
            { key: 'saturationScale', label: 'Saturation Multiplier', min: 0.2, max: 2.0, step: 0.1 },
            { key: 'speed', label: 'Rotation Speed', min: 0.0, max: 1.0, step: 0.05 },
        ],
        getCode: (p) => `precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;

#define TWO_PI 6.28318530718

vec3 hsb2rgb(in vec3 c) {
    vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
    rgb = rgb * rgb * (3.0 - 2.0 * rgb);
    return c.z * mix(vec3(1.0), rgb, c.y);
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    vec2 toCenter = vec2(0.5) - st;

    float angle = atan(toCenter.y, toCenter.x);
    float radius = length(toCenter) * 2.0;

    float hue = (angle / TWO_PI) + 0.5 + u_time * ${Number(p.speed).toFixed(2)};
    float sat = clamp(radius * ${Number(p.saturationScale).toFixed(2)}, 0.0, 1.0);

    vec3 color = hsb2rgb(vec3(hue, sat, 1.0));

    gl_FragColor = vec4(color, 1.0);
}`
    },
    {
        name: '3. Cosine Palettes (Inigo Quilez)',
        description: 'Infinite procedural harmonic palettes generated using trigonometric cosine curves.',
        params: { freq: 1.0, phaseShift: 0.33, speed: 0.15 },
        sliders: [
            { key: 'freq', label: 'Oscillation Frequency', min: 0.5, max: 3.0, step: 0.1 },
            { key: 'phaseShift', label: 'RGB Phase Separation', min: 0.0, max: 1.0, step: 0.05 },
            { key: 'speed', label: 'Animation Speed', min: 0.0, max: 0.5, step: 0.05 },
        ],
        getCode: (p) => `precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;

#define TWO_PI 6.28318530718

// Inigo Quilez Cosine Palette Formula: a + b * cos(2*PI*(c*t + d))
vec3 cosinePalette(in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d) {
    return a + b * cos(TWO_PI * (c * t + d));
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;

    vec3 a = vec3(0.5, 0.5, 0.5); // Brightness offset
    vec3 b = vec3(0.5, 0.5, 0.5); // Contrast amplitude
    vec3 c = vec3(${Number(p.freq).toFixed(2)}); // Frequency
    vec3 d = vec3(0.0, ${Number(p.phaseShift).toFixed(2)}, ${Number(p.phaseShift * 2.0).toFixed(2)}); // Phase

    float t = st.x + u_time * ${Number(p.speed).toFixed(2)};
    vec3 color = cosinePalette(t, a, b, c, d);

    gl_FragColor = vec4(color, 1.0);
}`
    },
    {
        name: '4. Per-Channel Shaping',
        description: 'Applies different shaping curves to Red, Green, and Blue channels for vibrant transitions.',
        params: { redCurve: 2.0, greenFreq: 3.14 },
        sliders: [
            { key: 'redCurve', label: 'Red Power Exponent', min: 0.5, max: 4.0, step: 0.1 },
            { key: 'greenFreq', label: 'Green Sine Frequency', min: 1.0, max: 6.28, step: 0.2 },
        ],
        getCode: (p) => `precision mediump float;
uniform vec2 u_resolution;

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;

    vec3 colorA = vec3(0.1, 0.05, 0.4); // Indigo
    vec3 colorB = vec3(1.0, 0.8, 0.2);  // Amber

    // Independent per-channel transition curves
    vec3 pct;
    pct.r = pow(st.x, ${Number(p.redCurve).toFixed(2)});
    pct.g = sin(st.x * ${Number(p.greenFreq).toFixed(2)});
    pct.b = smoothstep(0.2, 0.8, st.x);

    vec3 color = mix(colorA, colorB, pct);

    gl_FragColor = vec4(color, 1.0);
}`
    },
    {
        name: '5. Radial Color Sunburst',
        description: 'Multi-armed color spectrum with radial pulse and angular repetition.',
        params: { arms: 6.0, pulseSpeed: 1.5 },
        sliders: [
            { key: 'arms', label: 'Color Star Arms', min: 2.0, max: 12.0, step: 1.0 },
            { key: 'pulseSpeed', label: 'Pulse Frequency', min: 0.5, max: 3.0, step: 0.1 },
        ],
        getCode: (p) => `precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;

#define TWO_PI 6.28318530718

vec3 hsb2rgb(in vec3 c) {
    vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
    rgb = rgb * rgb * (3.0 - 2.0 * rgb);
    return c.z * mix(vec3(1.0), rgb, c.y);
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    vec2 toCenter = vec2(0.5) - st;

    float angle = atan(toCenter.y, toCenter.x);
    float radius = length(toCenter) * 2.0;

    // Modulate hue by star arm count
    float armCount = ${Number(p.arms).toFixed(1)};
    float hue = fract((angle / TWO_PI) * armCount + u_time * 0.1);
    float glow = 1.0 - smoothstep(0.0, 1.0, radius);
    float pulse = 0.8 + 0.2 * sin(radius * 10.0 - u_time * ${Number(p.pulseSpeed).toFixed(2)});

    vec3 color = hsb2rgb(vec3(hue, 0.9, glow * pulse));

    gl_FragColor = vec4(color, 1.0);
}`
    }
];

// ============================================================
// Main App Component
// ============================================================
function App() {
    const [activePreset, setActivePreset] = useState(0);
    const [params, setParams] = useState(PRESETS[0].params);
    const [shaderSource, setShaderSource] = useState(PRESETS[0].getCode(PRESETS[0].params));

    const loadPreset = (index) => {
        setActivePreset(index);
        const nextParams = { ...PRESETS[index].params };
        setParams(nextParams);
        setShaderSource(PRESETS[index].getCode(nextParams));
    };

    const updateParam = (key, value) => {
        setParams(prev => {
            const nextParams = { ...prev, [key]: value };
            if (PRESETS[activePreset]?.getCode) {
                setShaderSource(PRESETS[activePreset].getCode(nextParams));
            }
            return nextParams;
        });
    };

    const preset = PRESETS[activePreset];

    return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Navigation Header */}
            <ChapterNav currentChapterNum="04" />

            {/* Title Header */}
            <header style={{ marginBottom: '20px' }}>
                <h1 style={{ fontSize: '24px', color: '#58a6ff', marginBottom: '4px' }}>
                    Chapter 04: Colors & Color Spaces
                </h1>
                <p style={{ color: '#8b949e', fontSize: '14px' }}>
                    Explore RGB channel interpolation, HSB polar color wheels, and procedural cosine palettes.
                </p>
            </header>

            {/* Preset selector */}
            <section style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                    {PRESETS.map((p, i) => (
                        <button key={i} onClick={() => loadPreset(i)}
                            style={{
                                padding: '6px 12px', borderRadius: '6px',
                                border: activePreset === i ? '1px solid #58a6ff' : '1px solid #30363d',
                                background: activePreset === i ? '#1f3a5f' : '#161b22',
                                color: activePreset === i ? '#58a6ff' : '#c9d1d9',
                                cursor: 'pointer', fontSize: '12px', fontWeight: '500'
                            }}>
                            {p.name}
                        </button>
                    ))}
                </div>
                <p style={{ fontSize: '12px', color: '#8b949e' }}>
                    {preset.description}
                </p>
            </section>

            {/* Sliders Panel */}
            <section style={{
                marginBottom: '20px', padding: '16px',
                background: '#161b22', borderRadius: '12px',
                border: '1px solid #30363d'
            }}>
                <h3 style={{ fontSize: '13px', color: '#79c0ff', marginBottom: '12px' }}>
                    Interactive Parameter Controls (Real-Time Synchronized)
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                    {preset.sliders.map(s => (
                        <Slider key={s.key}
                            label={s.label}
                            min={s.min} max={s.max}
                            step={s.step || 0.01}
                            value={params[s.key] || 0}
                            onChange={(v) => updateParam(s.key, v)} />
                    ))}
                </div>
            </section>

            {/* Main Interactive Grid: Editor vs Output */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start' }}>
                <div>
                    <h3 style={{ marginBottom: '8px', fontSize: '13px', color: '#aaa' }}>
                        Fragment Shader Code (GLSL)
                    </h3>
                    <ShaderEditor value={shaderSource} onChange={setShaderSource} />
                </div>
                <div>
                    <h3 style={{ marginBottom: '8px', fontSize: '13px', color: '#aaa' }}>
                        2D GPU Visual Output
                    </h3>
                    <ShaderCanvas fragmentSource={shaderSource} width={400} height={340} />
                </div>
            </div>

            {/* Key concepts card */}
            <section style={{
                marginTop: '24px', padding: '20px',
                background: '#0d1117', borderRadius: '12px',
                border: '1px solid #30363d'
            }}>
                <h3 style={{ fontSize: '14px', color: '#58a6ff', marginBottom: '12px' }}>
                    Color Cheatsheet & Formulas
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12px', color: '#c9d1d9' }}>
                    <div><code style={{ color: '#ff7b72' }}>mix(A, B, t)</code> — Interpolates color vectors from A to B</div>
                    <div><code style={{ color: '#ff7b72' }}>hsb2rgb(vec3(H,S,B))</code> — Maps polar HSB to screen RGB</div>
                    <div><code style={{ color: '#ff7b72' }}>atan(y, x)</code> — Computes polar angle for color wheels</div>
                    <div><code style={{ color: '#ff7b72' }}>a + b*cos(2π(c*t + d))</code> — Analytical Cosine palette generator</div>
                </div>
            </section>

            <footer style={{ marginTop: '32px', color: '#6e7681', fontSize: '11px', textAlign: 'center' }}>
                Shader Tutorial — Chapter 04 | Move sliders or edit code directly for instant WebGL compilation
            </footer>
        </div>
    );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
