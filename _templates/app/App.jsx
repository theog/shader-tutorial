/**
 * Chapter {{CHAPTER_NUM}}: {{CHAPTER_TITLE}}
 * Interactive Shader Tutorial App
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

        // Full-screen quad
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

            // Uniforms
            const uRes = gl.getUniformLocation(program, 'u_resolution');
            const uTime = gl.getUniformLocation(program, 'u_time');
            const uMouse = gl.getUniformLocation(program, 'u_mouse');

            if (uRes) gl.uniform2f(uRes, gl.canvas.width, gl.canvas.height);
            if (uTime) gl.uniform1f(uTime, (Date.now() - startTimeRef.current) / 1000.0);
            if (uMouse) gl.uniform2f(uMouse, mouseRef.current[0], mouseRef.current[1]);

            // Attribute
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
                height: '300px',
                fontFamily: "'SF Mono', 'Fira Code', monospace",
                fontSize: '13px',
                backgroundColor: '#0d1117',
                color: '#c9d1d9',
                border: '1px solid #333',
                borderRadius: '8px',
                padding: '12px',
                resize: 'vertical',
                lineHeight: '1.5',
                tabSize: 4,
            }}
        />
    );
}

// ============================================================
// Slider control for uniform values
// ============================================================
function UniformSlider({ label, min = 0, max = 1, step = 0.01, value, onChange }) {
    return (
        <div style={{ marginBottom: '8px' }}>
            <label style={{ fontSize: '12px', color: '#888' }}>
                {label}: <strong style={{ color: '#58a6ff' }}>{value.toFixed(3)}</strong>
            </label>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(parseFloat(e.target.value))}
                style={{ width: '100%', marginTop: '4px' }}
            />
        </div>
    );
}

// ============================================================
// ChapterNav — Top navigation bar for chapter apps
// ============================================================
function ChapterNav({ currentChapterNum = '{{CHAPTER_NUM}}' }) {
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
                    Chapter {{CHAPTER_NUM}}: {{CHAPTER_TITLE}}
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
const DEFAULT_SHADER = `precision mediump float;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    vec3 color = vec3(st.x, st.y, abs(sin(u_time)));
    gl_FragColor = vec4(color, 1.0);
}`;

function App() {
    const [shaderSource, setShaderSource] = useState(DEFAULT_SHADER);

    return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Top Navigation */}
            <ChapterNav currentChapterNum="{{CHAPTER_NUM}}" />

            <header style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '24px', color: '#58a6ff' }}>
                    Chapter {{CHAPTER_NUM}}: {{CHAPTER_TITLE}}
                </h1>
                <p style={{ color: '#888', marginTop: '4px' }}>
                    {{APP_DESCRIPTION}}
                </p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>
                <div>
                    <h3 style={{ marginBottom: '8px', fontSize: '14px', color: '#aaa' }}>Shader Code</h3>
                    <ShaderEditor value={shaderSource} onChange={setShaderSource} />
                </div>
                <div>
                    <h3 style={{ marginBottom: '8px', fontSize: '14px', color: '#aaa' }}>Output</h3>
                    <ShaderCanvas fragmentSource={shaderSource} width={400} height={400} />
                </div>
            </div>

            <footer style={{ marginTop: '32px', color: '#555', fontSize: '12px' }}>
                Shader Tutorial — Interactive WebGL Playground
            </footer>
        </div>
    );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
