/**
 * Reusable WebGL Shader Canvas Component
 * Encapsulates WebGL initialization, compile/link pipelines, uniform streams, animation loops, and mouse tracking.
 */

const { useState, useEffect, useRef, useCallback } = React;

function WebGLCanvas({
    fragmentSource,
    uniforms = {},
    params = {},
    isPaused = false,
    resetTimeTrigger = 0,
    onError = null,
    onFPS = null,
    width = null,
    height = null,
    style = {},
    className = ''
}) {
    const canvasRef = useRef(null);
    const glRef = useRef(null);
    const programRef = useRef(null);
    const animIdRef = useRef(null);
    const startTimeRef = useRef(performance.now());
    const pausedTimeRef = useRef(0);
    const lastFrameTimeRef = useRef(performance.now());
    const frameCountRef = useRef(0);
    const mousePosRef = useRef([0.0, 0.0]);

    // Handle reset time trigger
    useEffect(() => {
        startTimeRef.current = performance.now();
        pausedTimeRef.current = 0;
    }, [resetTimeTrigger]);

    // Initialize WebGL & Full-screen Quad Geometry
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const gl = canvas.getContext('webgl', { preserveDrawingBuffer: true, alpha: false }) ||
                   canvas.getContext('experimental-webgl');

        if (!gl) {
            if (onError) onError('WebGL is not supported in this browser.');
            return;
        }

        glRef.current = gl;

        // Vertex buffer for a full-screen 2D quad
        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        const positions = new Float32Array([
            -1.0, -1.0,
             1.0, -1.0,
            -1.0,  1.0,
            -1.0,  1.0,
             1.0, -1.0,
             1.0,  1.0
        ]);
        gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

        return () => {
            if (gl && positionBuffer) {
                gl.deleteBuffer(positionBuffer);
            }
        };
    }, []);

    // Vertex Shader Source
    const vertexShaderSource = `
        attribute vec2 a_position;
        void main() {
            gl_Position = vec4(a_position, 0.0, 1.0);
        }
    `;

    // Compile Shader Helper
    const createShader = (gl, type, source) => {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            const info = gl.getShaderInfoLog(shader);
            gl.deleteShader(shader);
            throw new Error(info || 'Shader compilation failed');
        }
        return shader;
    };

    // Recompile Fragment Shader on Source Change
    useEffect(() => {
        const gl = glRef.current;
        if (!gl || !fragmentSource) return;

        try {
            const vertShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
            const fragShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);

            const program = gl.createProgram();
            gl.attachShader(program, vertShader);
            gl.attachShader(program, fragShader);
            gl.linkProgram(program);

            if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
                const info = gl.getProgramInfoLog(program);
                gl.deleteProgram(program);
                throw new Error(info || 'Shader linking failed');
            }

            // Cleanup previous program
            if (programRef.current) {
                gl.deleteProgram(programRef.current);
            }

            programRef.current = program;
            if (onError) onError(null); // Clear errors
        } catch (err) {
            if (onError) onError(err.message);
        }
    }, [fragmentSource]);

    // Handle Mouse Move
    const handleMouseMove = useCallback((e) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) * (canvas.width / rect.width);
        const y = (canvas.height - (e.clientY - rect.top) * (canvas.height / rect.height)); // Flip Y to match WebGL
        mousePosRef.current = [x, y];
    }, []);

    // Render / Animation Loop
    useEffect(() => {
        const canvas = canvasRef.current;
        const gl = glRef.current;
        if (!canvas || !gl) return;

        let isRunning = true;

        const render = () => {
            if (!isRunning) return;

            if (programRef.current) {
                const program = programRef.current;
                gl.useProgram(program);

                // Setup position attribute
                const posAttr = gl.getAttribLocation(program, 'a_position');
                if (posAttr !== -1) {
                    gl.enableVertexAttribArray(posAttr);
                    gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0);
                }

                // Adjust canvas resolution dynamically
                const displayWidth = canvas.clientWidth * (window.devicePixelRatio || 1);
                const displayHeight = canvas.clientHeight * (window.devicePixelRatio || 1);
                if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
                    canvas.width = displayWidth;
                    canvas.height = displayHeight;
                    gl.viewport(0, 0, canvas.width, canvas.height);
                }

                // Calculate Time
                const now = performance.now();
                if (!isPaused) {
                    pausedTimeRef.current = (now - startTimeRef.current) / 1000.0;
                }
                const currentTime = pausedTimeRef.current;

                // FPS calculation
                frameCountRef.current++;
                if (now - lastFrameTimeRef.current >= 1000) {
                    if (onFPS) onFPS(frameCountRef.current);
                    frameCountRef.current = 0;
                    lastFrameTimeRef.current = now;
                }

                // Standard Built-in Uniforms
                const uRes = gl.getUniformLocation(program, 'u_resolution');
                if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);

                const uTime = gl.getUniformLocation(program, 'u_time');
                if (uTime) gl.uniform1f(uTime, currentTime);

                const uMouse = gl.getUniformLocation(program, 'u_mouse');
                if (uMouse) gl.uniform2f(uMouse, mousePosRef.current[0], mousePosRef.current[1]);

                // Arbitrary Uniforms dictionary
                Object.entries(uniforms).forEach(([name, val]) => {
                    const loc = gl.getUniformLocation(program, name);
                    if (loc !== null) {
                        if (typeof val === 'number') gl.uniform1f(loc, val);
                        else if (Array.isArray(val)) {
                            if (val.length === 2) gl.uniform2f(loc, val[0], val[1]);
                            else if (val.length === 3) gl.uniform3f(loc, val[0], val[1], val[2]);
                            else if (val.length === 4) gl.uniform4f(loc, val[0], val[1], val[2], val[3]);
                        }
                    }
                });

                // Custom params dictionary
                Object.entries(params).forEach(([name, val]) => {
                    const loc = gl.getUniformLocation(program, `u_${name}`) || gl.getUniformLocation(program, name);
                    if (loc !== null && typeof val === 'number') {
                        gl.uniform1f(loc, val);
                    }
                });

                // Draw Quad
                gl.drawArrays(gl.TRIANGLES, 0, 6);
            }

            animIdRef.current = requestAnimationFrame(render);
        };

        animIdRef.current = requestAnimationFrame(render);

        return () => {
            isRunning = false;
            if (animIdRef.current) cancelAnimationFrame(animIdRef.current);
        };
    }, [isPaused, uniforms, params, onFPS]);

    return (
        <canvas
            ref={canvasRef}
            onMouseMove={handleMouseMove}
            className={className}
            style={{
                width: width || '100%',
                height: height || '100%',
                display: 'block',
                background: '#090d13',
                ...style
            }}
        />
    );
}

window.WebGLCanvas = WebGLCanvas;
