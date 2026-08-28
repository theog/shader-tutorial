/**
 * Chapter 03: Shaping Functions
 * Interactive function plotter + shader canvas.
 * Shows 1D function graph alongside the 2D shader output.
 *
 * Features:
 * - Function graph canvas (plots y=f(x) curves)
 * - Live shader editor
 * - Slider controls for key parameters
 * - Multiple preset shaping functions
 */

const { useState, useEffect, useRef, useCallback } = React;

// ============================================================
// ShaderCanvas — renders a fragment shader via WebGL
// ============================================================
function ShaderCanvas({ fragmentSource, width = 380, height = 380 }) {
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
            style={{ borderRadius: '8px', border: '1px solid #333' }} />
    );
}

// ============================================================
// FunctionGraph — plots a 1D function as a graph using Canvas2D
// ============================================================
function FunctionGraph({ func, label, width = 380, height = 200, color = '#3fb950' }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, width, height);

        // Background
        ctx.fillStyle = '#0d1117';
        ctx.fillRect(0, 0, width, height);

        // Grid lines
        ctx.strokeStyle = '#1c2128';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 4; i++) {
            const x = (i / 4) * width;
            const y = (i / 4) * height;
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
        }

        // Axis labels
        ctx.fillStyle = '#555';
        ctx.font = '10px monospace';
        ctx.fillText('0', 4, height - 4);
        ctx.fillText('1', width - 12, height - 4);
        ctx.fillText('1', 4, 12);

        // Plot function
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        for (let px = 0; px < width; px++) {
            const x = px / width; // 0..1
            const y = Math.max(0, Math.min(1, func(x)));
            const canvasY = height - y * height;
            if (px === 0) ctx.moveTo(px, canvasY);
            else ctx.lineTo(px, canvasY);
        }
        ctx.stroke();

        // Label
        ctx.fillStyle = color;
        ctx.font = 'bold 12px monospace';
        ctx.fillText(label, 8, 20);

    }, [func, label, width, height, color]);

    return (
        <canvas ref={canvasRef} width={width} height={height}
            style={{ borderRadius: '6px', border: '1px solid #30363d' }} />
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
                width: '100%', height: '260px',
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
            <label style={{ fontSize: '11px', color: '#888' }}>
                {label}: <strong style={{ color: '#58a6ff' }}>{value.toFixed(3)}</strong>
            </label>
            <input type="range" min={min} max={max} step={step} value={value}
                onChange={(e) => onChange(parseFloat(e.target.value))}
                style={{ width: '100%', marginTop: '2px' }} />
        </div>
    );
}

// ============================================================
// Presets — each has a shader, a JS graph function, and description
// ============================================================
const PRESETS = [
    {
        name: '1. step()',
        description: 'Hard binary cutoff. Everything below the edge is 0, above is 1.',
        graphFunc: (x, params) => x >= params.edge ? 1 : 0,
        graphLabel: 'step(edge, x)',
        params: { edge: 0.5 },
        sliders: [{ key: 'edge', label: 'Edge threshold', min: 0, max: 1 }],
        code: `precision mediump float;
uniform vec2 u_resolution;

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;

    // step(edge, x): returns 0 below, 1 above
    float value = step(0.5, st.x);

    gl_FragColor = vec4(vec3(value), 1.0);
}`
    },
    {
        name: '2. smoothstep()',
        description: 'S-curve transition between two edges. The soft version of step().',
        graphFunc: (x, params) => {
            const t = Math.max(0, Math.min(1, (x - params.edge0) / (params.edge1 - params.edge0)));
            return t * t * (3 - 2 * t);
        },
        graphLabel: 'smoothstep(edge0, edge1, x)',
        params: { edge0: 0.3, edge1: 0.7 },
        sliders: [
            { key: 'edge0', label: 'Edge 0 (start)', min: 0, max: 1 },
            { key: 'edge1', label: 'Edge 1 (end)', min: 0, max: 1 },
        ],
        code: `precision mediump float;
uniform vec2 u_resolution;

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;

    // smoothstep(edge0, edge1, x)
    // Soft transition from edge0 to edge1
    float value = smoothstep(0.3, 0.7, st.x);

    gl_FragColor = vec4(vec3(value), 1.0);
}`
    },
    {
        name: '3. pow()',
        description: 'Power curve. Exponent > 1 darkens (slow start), < 1 brightens (fast start).',
        graphFunc: (x, params) => Math.pow(x, params.exponent),
        graphLabel: 'pow(x, exponent)',
        params: { exponent: 2.0 },
        sliders: [{ key: 'exponent', label: 'Exponent', min: 0.1, max: 5.0, step: 0.1 }],
        code: `precision mediump float;
uniform vec2 u_resolution;

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;

    // pow(x, n): reshapes the linear ramp
    // n=1: linear, n=2: quadratic, n=0.5: sqrt
    float value = pow(st.x, 2.0);

    gl_FragColor = vec4(vec3(value), 1.0);
}`
    },
    {
        name: '4. sin() wave',
        description: 'Smooth oscillation. Frequency controls how many waves fit, remapped to 0-1.',
        graphFunc: (x, params) => 0.5 + 0.5 * Math.sin(x * params.frequency * Math.PI),
        graphLabel: '0.5 + 0.5 * sin(x * freq * PI)',
        params: { frequency: 4.0 },
        sliders: [{ key: 'frequency', label: 'Frequency', min: 1, max: 20, step: 0.5 }],
        code: `precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;

#define PI 3.14159265359

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;

    // Animated sine wave
    float freq = 4.0;
    float wave = 0.5 + 0.5 * sin(st.x * freq * PI + u_time * 2.0);

    gl_FragColor = vec4(vec3(wave), 1.0);
}`
    },
    {
        name: '5. fract() sawtooth',
        description: 'Fractional part creates repeating ramps. Foundation of tiling.',
        graphFunc: (x, params) => (x * params.repeats) % 1,
        graphLabel: 'fract(x * repeats)',
        params: { repeats: 5.0 },
        sliders: [{ key: 'repeats', label: 'Repeats', min: 1, max: 15, step: 1 }],
        code: `precision mediump float;
uniform vec2 u_resolution;

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;

    // fract() creates sawtooth repetition
    float value = fract(st.x * 5.0);

    gl_FragColor = vec4(vec3(value), 1.0);
}`
    },
    {
        name: '6. abs() mirror',
        description: 'Absolute value creates V-shape symmetry. Peak at center when inverted.',
        graphFunc: (x, params) => 1.0 - Math.abs(x * 2.0 - 1.0),
        graphLabel: '1.0 - abs(x * 2.0 - 1.0)',
        params: {},
        sliders: [],
        code: `precision mediump float;
uniform vec2 u_resolution;

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;

    // Center coordinates: remap 0..1 to -1..+1
    // abs() mirrors: V-shape
    // Invert: peak at center
    float value = 1.0 - abs(st.x * 2.0 - 1.0);

    gl_FragColor = vec4(vec3(value), 1.0);
}`
    },
    {
        name: '7. Pulse (composed)',
        description: 'Two smoothsteps subtracted = a soft bump. Width controls pulse size.',
        graphFunc: (x, params) => {
            const c = 0.5, w = params.width;
            const s1 = Math.max(0, Math.min(1, (x - (c - w)) / (w * 0.5)));
            const s2 = Math.max(0, Math.min(1, (x - c) / (w * 0.5)));
            return (s1*s1*(3-2*s1)) - (s2*s2*(3-2*s2));
        },
        graphLabel: 'smoothstep(c-w, c, x) - smoothstep(c, c+w, x)',
        params: { width: 0.2 },
        sliders: [{ key: 'width', label: 'Pulse width', min: 0.02, max: 0.5 }],
        code: `precision mediump float;
uniform vec2 u_resolution;

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;

    // Pulse = two smoothsteps subtracted
    float center = 0.5;
    float width = 0.2;
    float pulse = smoothstep(center - width, center, st.x)
                - smoothstep(center, center + width, st.x);

    gl_FragColor = vec4(vec3(pulse), 1.0);
}`
    },
    {
        name: '8. Ping-pong',
        description: 'Triangle wave: bounces between 0 and 1. Combines fract() and abs().',
        graphFunc: (x, params) => Math.abs(((x * params.repeats) % 1) * 2.0 - 1.0),
        graphLabel: 'abs(fract(x * n) * 2.0 - 1.0)',
        params: { repeats: 3.0 },
        sliders: [{ key: 'repeats', label: 'Repeats', min: 1, max: 10, step: 1 }],
        code: `precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;

    // Ping-pong (triangle wave): up then down
    // abs(fract(x) * 2.0 - 1.0)
    float value = abs(fract(st.x * 3.0 + u_time * 0.5) * 2.0 - 1.0);

    gl_FragColor = vec4(vec3(value), 1.0);
}`
    },
];

// ============================================================
// ChapterNav — Top navigation bar for chapter apps
// ============================================================
function ChapterNav({ currentChapterNum = '03' }) {
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
                    href="../../index.html"
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
                            window.location.href = `../../chapters/${e.target.value}/app/index.html`;
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
                        href={`../../chapters/${prevChapter.slug}/app/index.html`}
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
                        href={`../../chapters/${nextChapter.slug}/app/index.html`}
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
    const [activePreset, setActivePreset] = useState(0);
    const [shaderSource, setShaderSource] = useState(PRESETS[0].code);
    const [params, setParams] = useState(PRESETS[0].params);

    const loadPreset = (index) => {
        setActivePreset(index);
        setShaderSource(PRESETS[index].code);
        setParams({ ...PRESETS[index].params });
    };

    const updateParam = (key, value) => {
        setParams(prev => ({ ...prev, [key]: value }));
    };

    const preset = PRESETS[activePreset];

    return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Top Navigation */}
            <ChapterNav currentChapterNum="03" />

            {/* Header */}
            <header style={{ marginBottom: '20px' }}>
                <h1 style={{ fontSize: '24px', color: '#58a6ff', marginBottom: '4px' }}>
                    Chapter 03: Shaping Functions
                </h1>
                <p style={{ color: '#888' }}>
                    The building blocks of all shader visuals. Each function reshapes a 0–1 input into a different curve.
                </p>
            </header>

            {/* Preset buttons */}
            <section style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {PRESETS.map((p, i) => (
                        <button key={i} onClick={() => loadPreset(i)}
                            style={{
                                padding: '5px 10px', borderRadius: '6px',
                                border: activePreset === i ? '1px solid #58a6ff' : '1px solid #333',
                                background: activePreset === i ? '#1f3a5f' : '#161b22',
                                color: activePreset === i ? '#58a6ff' : '#aaa',
                                cursor: 'pointer', fontSize: '11px',
                            }}>
                            {p.name}
                        </button>
                    ))}
                </div>
                <p style={{ fontSize: '12px', color: '#666', marginTop: '6px' }}>
                    {preset.description}
                </p>
            </section>

            {/* Function Graph + Sliders */}
            <section style={{
                marginBottom: '20px', padding: '16px',
                background: '#161b22', borderRadius: '12px',
                border: '1px solid #30363d'
            }}>
                <h3 style={{ fontSize: '13px', color: '#aaa', marginBottom: '10px' }}>
                    1D Function Graph — <span style={{ color: '#3fb950' }}>{preset.graphLabel}</span>
                </h3>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                    <FunctionGraph
                        func={(x) => preset.graphFunc(x, params)}
                        label={preset.graphLabel}
                        width={380}
                        height={180}
                    />
                    <div style={{ minWidth: '200px' }}>
                        {preset.sliders.map(s => (
                            <Slider key={s.key}
                                label={s.label}
                                min={s.min} max={s.max}
                                step={s.step || 0.01}
                                value={params[s.key] || 0}
                                onChange={(v) => updateParam(s.key, v)} />
                        ))}
                        {preset.sliders.length === 0 && (
                            <p style={{ fontSize: '11px', color: '#555' }}>
                                No parameters for this function.
                            </p>
                        )}
                        <div style={{ marginTop: '12px', padding: '10px', background: '#0d1117', borderRadius: '6px' }}>
                            <p style={{ fontSize: '11px', color: '#666' }}>
                                The graph shows <code>y = f(x)</code> where x goes from 0 to 1.
                                The shader below applies this same function to <code>st.x</code> and outputs it as brightness.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Editor + Shader Canvas */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start' }}>
                <div>
                    <h3 style={{ marginBottom: '8px', fontSize: '13px', color: '#aaa' }}>
                        Shader Code
                    </h3>
                    <ShaderEditor value={shaderSource} onChange={setShaderSource} />
                </div>
                <div>
                    <h3 style={{ marginBottom: '8px', fontSize: '13px', color: '#aaa' }}>
                        2D Output (function applied per-pixel)
                    </h3>
                    <ShaderCanvas fragmentSource={shaderSource} width={380} height={380} />
                </div>
            </div>

            {/* Cheat sheet */}
            <section style={{
                marginTop: '24px', padding: '20px',
                background: '#0d1117', borderRadius: '12px',
                border: '1px solid #30363d'
            }}>
                <h3 style={{ fontSize: '14px', color: '#58a6ff', marginBottom: '12px' }}>
                    Function Cheat Sheet
                </h3>
                <div style={{
                    display: 'grid', gridTemplateColumns: '1fr 1fr',
                    gap: '8px', fontSize: '12px'
                }}>
                    <div><code style={{ color: '#ff7b72' }}>step(e, x)</code> <span style={{ color: '#666' }}>→ 0 or 1 (hard edge)</span></div>
                    <div><code style={{ color: '#ff7b72' }}>smoothstep(a, b, x)</code> <span style={{ color: '#666' }}>→ S-curve 0..1</span></div>
                    <div><code style={{ color: '#ff7b72' }}>pow(x, n)</code> <span style={{ color: '#666' }}>→ bend the ramp</span></div>
                    <div><code style={{ color: '#ff7b72' }}>sin(x) / cos(x)</code> <span style={{ color: '#666' }}>→ oscillate -1..+1</span></div>
                    <div><code style={{ color: '#ff7b72' }}>fract(x)</code> <span style={{ color: '#666' }}>→ sawtooth repeat</span></div>
                    <div><code style={{ color: '#ff7b72' }}>abs(x)</code> <span style={{ color: '#666' }}>→ V-shape mirror</span></div>
                    <div><code style={{ color: '#ff7b72' }}>clamp(x, 0, 1)</code> <span style={{ color: '#666' }}>→ cap to range</span></div>
                    <div><code style={{ color: '#ff7b72' }}>floor(x) / ceil(x)</code> <span style={{ color: '#666' }}>→ staircase</span></div>
                </div>
            </section>

            <footer style={{ marginTop: '32px', color: '#333', fontSize: '11px', textAlign: 'center' }}>
                Shader Tutorial — Chapter 03 | Adjust sliders to see how parameters change the curve
            </footer>
        </div>
    );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
