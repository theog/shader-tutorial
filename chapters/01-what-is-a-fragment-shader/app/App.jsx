/**
 * Chapter 01: What Is a Fragment Shader?
 * Interactive app demonstrating the per-pixel parallel nature of shaders.
 *
 * Features:
 * - Live shader editor with instant compilation
 * - Multiple preset examples to explore
 * - CPU vs GPU visualization comparison
 * - Uniform sliders
 */

const { useState, useEffect, useRef, useCallback } = React;

// ============================================================
// ShaderCanvas — renders a fragment shader via WebGL
// ============================================================
function ShaderCanvas({ fragmentSource, width = 400, height = 400, className = '' }) {
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

        return () => {
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        };
    }, [fragmentSource, buildProgram]);

    const handleMouseMove = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        mouseRef.current = [
            e.clientX - rect.left,
            height - (e.clientY - rect.top)
        ];
    };

    return (
        <canvas
            ref={canvasRef}
            width={width}
            height={height}
            className={className}
            onMouseMove={handleMouseMove}
            style={{ borderRadius: '8px', border: '1px solid #333' }}
        />
    );
}

// ============================================================
// ShaderEditor — textarea with live editing
// ============================================================
function ShaderEditor({ value, onChange }) {
    return (
        <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            spellCheck={false}
            style={{
                width: '100%',
                height: '320px',
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
// CPUSimulation — shows the sequential pixel-by-pixel approach
// ============================================================
function CPUSimulation({ width = 50, height = 50 }) {
    const canvasRef = useRef(null);
    const [progress, setProgress] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const intervalRef = useRef(null);

    const startSimulation = () => {
        setProgress(0);
        setIsRunning(true);
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, width, height);

        let pixel = 0;
        const totalPixels = width * height;
        const batchSize = 20; // pixels per frame for visible animation

        intervalRef.current = setInterval(() => {
            for (let i = 0; i < batchSize && pixel < totalPixels; i++) {
                const x = pixel % width;
                const y = Math.floor(pixel / width);
                const r = Math.floor((x / width) * 255);
                const g = Math.floor((y / height) * 255);
                ctx.fillStyle = `rgb(${r}, ${g}, 0)`;
                ctx.fillRect(x, y, 1, 1);
                pixel++;
            }
            setProgress(Math.floor((pixel / totalPixels) * 100));
            if (pixel >= totalPixels) {
                clearInterval(intervalRef.current);
                setIsRunning(false);
            }
        }, 16);
    };

    useEffect(() => {
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, []);

    return (
        <div style={{ textAlign: 'center' }}>
            <canvas
                ref={canvasRef}
                width={width}
                height={height}
                style={{
                    width: '200px',
                    height: '200px',
                    borderRadius: '8px',
                    border: '1px solid #333',
                    imageRendering: 'pixelated',
                }}
            />
            <div style={{ marginTop: '8px' }}>
                <button
                    onClick={startSimulation}
                    disabled={isRunning}
                    style={{
                        padding: '6px 16px',
                        borderRadius: '4px',
                        border: 'none',
                        background: isRunning ? '#333' : '#58a6ff',
                        color: '#fff',
                        cursor: isRunning ? 'default' : 'pointer',
                        fontSize: '12px',
                    }}
                >
                    {isRunning ? `Drawing... ${progress}%` : 'Run CPU (sequential)'}
                </button>
            </div>
            <p style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
                One pixel at a time, {width * height} total
            </p>
        </div>
    );
}

// ============================================================
// Preset shaders for this chapter
// ============================================================
const PRESETS = [
    {
        name: '1. Solid Color',
        description: 'The simplest shader — every pixel is the same color.',
        code: `precision mediump float;

void main() {
    // Every pixel becomes this exact red color.
    // Change the values (0.0 to 1.0) and see what happens!
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}`
    },
    {
        name: '2. Position → Color',
        description: 'Each pixel uses its position to determine its color. This is the "hello world" of shaders.',
        code: `precision mediump float;

uniform vec2 u_resolution;

void main() {
    // Normalize pixel coordinates to 0.0 - 1.0
    vec2 st = gl_FragCoord.xy / u_resolution.xy;

    // X position controls red, Y position controls green
    gl_FragColor = vec4(st.x, st.y, 0.0, 1.0);
}`
    },
    {
        name: '3. Adding Time',
        description: 'The blue channel oscillates with time. Same logic per pixel, but animated.',
        code: `precision mediump float;

uniform vec2 u_resolution;
uniform float u_time;

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;

    // sin() oscillates between -1 and 1
    // We remap to 0-1 with: 0.5 + 0.5 * sin(...)
    float blue = 0.5 + 0.5 * sin(u_time);

    gl_FragColor = vec4(st.x, st.y, blue, 1.0);
}`
    },
    {
        name: '4. Mouse Interaction',
        description: 'The shader reacts to your mouse position. Move your cursor over the canvas!',
        code: `precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;

    // Normalize mouse to 0-1 range
    vec2 mouse = u_mouse / u_resolution;

    // Distance from this pixel to the mouse
    float dist = distance(st, mouse);

    // Create a bright spot near the mouse
    float brightness = 1.0 - smoothstep(0.0, 0.3, dist);

    gl_FragColor = vec4(brightness * st.x, brightness * st.y, brightness, 1.0);
}`
    },
    {
        name: '5. Parallel Proof',
        description: 'Every pixel computes independently. Stripes prove no pixel knows about its neighbors.',
        code: `precision mediump float;

uniform vec2 u_resolution;
uniform float u_time;

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;

    // Each pixel independently decides if it's in a stripe
    // No pixel communicates with its neighbors!
    float stripes = step(0.5, fract(st.x * 10.0 + u_time));

    vec3 color = mix(
        vec3(0.1, 0.1, 0.3),  // dark blue
        vec3(0.9, 0.6, 0.1),  // gold
        stripes
    );

    gl_FragColor = vec4(color, 1.0);
}`
    },
];

// ============================================================
// ChapterNav — Top navigation bar for chapter apps
// ============================================================
function ChapterNav({ currentChapterNum = '01' }) {
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
// Main App
// ============================================================
function App() {
    const [shaderSource, setShaderSource] = useState(PRESETS[0].code);
    const [activePreset, setActivePreset] = useState(0);
    const [compileError, setCompileError] = useState(null);

    const loadPreset = (index) => {
        setActivePreset(index);
        setShaderSource(PRESETS[index].code);
        setCompileError(null);
    };

    return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Top Navigation */}
            <ChapterNav currentChapterNum="01" />

            {/* Header */}
            <header style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '24px', color: '#58a6ff', marginBottom: '4px' }}>
                    Chapter 01: What Is a Fragment Shader?
                </h1>
                <p style={{ color: '#888' }}>
                    A fragment shader runs once per pixel, in parallel. Edit the code below and see the result instantly.
                </p>
            </header>

            {/* CPU vs GPU comparison */}
            <section style={{
                marginBottom: '32px',
                padding: '20px',
                background: '#161b22',
                borderRadius: '12px',
                border: '1px solid #30363d'
            }}>
                <h2 style={{ fontSize: '16px', marginBottom: '12px', color: '#c9d1d9' }}>
                    CPU (Sequential) vs GPU (Parallel)
                </h2>
                <p style={{ fontSize: '13px', color: '#888', marginBottom: '16px' }}>
                    The CPU draws pixels one by one. The GPU runs the same shader for all pixels simultaneously.
                    Click "Run CPU" to see the sequential version fill in — then compare with the instant GPU output.
                </p>
                <div style={{ display: 'flex', gap: '40px', justifyContent: 'center', alignItems: 'flex-start' }}>
                    <div>
                        <h3 style={{ fontSize: '13px', color: '#f85149', marginBottom: '8px', textAlign: 'center' }}>
                            CPU: One pixel at a time
                        </h3>
                        <CPUSimulation width={50} height={50} />
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <h3 style={{ fontSize: '13px', color: '#3fb950', marginBottom: '8px' }}>
                            GPU: All pixels at once
                        </h3>
                        <ShaderCanvas
                            fragmentSource={PRESETS[1].code}
                            width={200}
                            height={200}
                        />
                        <p style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
                            Instant — every pixel computed in parallel
                        </p>
                    </div>
                </div>
            </section>

            {/* Preset selector */}
            <section style={{ marginBottom: '16px' }}>
                <h3 style={{ fontSize: '14px', color: '#aaa', marginBottom: '8px' }}>
                    Examples (click to load):
                </h3>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {PRESETS.map((preset, i) => (
                        <button
                            key={i}
                            onClick={() => loadPreset(i)}
                            style={{
                                padding: '6px 12px',
                                borderRadius: '6px',
                                border: activePreset === i ? '1px solid #58a6ff' : '1px solid #333',
                                background: activePreset === i ? '#1f3a5f' : '#161b22',
                                color: activePreset === i ? '#58a6ff' : '#aaa',
                                cursor: 'pointer',
                                fontSize: '12px',
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
                        Fragment Shader Code
                    </h3>
                    <ShaderEditor value={shaderSource} onChange={setShaderSource} />
                    <p style={{ fontSize: '11px', color: '#555', marginTop: '6px' }}>
                        Edit the code above — changes apply instantly. Try changing color values or math expressions.
                    </p>
                </div>
                <div>
                    <h3 style={{ marginBottom: '8px', fontSize: '14px', color: '#aaa' }}>
                        GPU Output (400×400 = 160,000 pixels)
                    </h3>
                    <ShaderCanvas fragmentSource={shaderSource} width={400} height={400} />
                    <p style={{ fontSize: '11px', color: '#555', marginTop: '6px' }}>
                        Each of the 160,000 pixels runs your shader independently and simultaneously.
                    </p>
                </div>
            </div>

            {/* Key takeaways */}
            <section style={{
                marginTop: '32px',
                padding: '20px',
                background: '#0d1117',
                borderRadius: '12px',
                border: '1px solid #30363d'
            }}>
                <h3 style={{ fontSize: '14px', color: '#58a6ff', marginBottom: '12px' }}>Key Takeaways</h3>
                <ul style={{ fontSize: '13px', color: '#c9d1d9', lineHeight: '2', paddingLeft: '20px' }}>
                    <li><code>gl_FragCoord</code> gives you the pixel's position</li>
                    <li>Divide by <code>u_resolution</code> to normalize to 0.0–1.0</li>
                    <li><code>gl_FragColor</code> is the output — a <code>vec4(R, G, B, A)</code></li>
                    <li>Every pixel runs the <strong>same code</strong> with different coordinates</li>
                    <li><code>uniform</code> values are shared inputs (time, resolution, mouse)</li>
                    <li>No pixel can see what another pixel computed — they're fully independent</li>
                </ul>
            </section>

            <footer style={{ marginTop: '32px', color: '#333', fontSize: '11px', textAlign: 'center' }}>
                Shader Tutorial — Chapter 01 | Move your mouse over the canvas for interactive examples
            </footer>
        </div>
    );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
