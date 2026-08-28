/**
 * Unified 18-Chapter Registry for 2D Shader Tutorial
 * Metadata, concept tags, preview shaders, and interactive presets.
 */

const CHAPTERS_REGISTRY = [
    {
        id: '01',
        number: '01',
        slug: '01-what-is-a-fragment-shader',
        part: 'Part I — Foundations',
        title: 'What Is a Fragment Shader?',
        subtitle: 'GPU Architecture, SIMD Parallelism & gl_FragCoord',
        description: 'Understand the radical difference between CPU loops and GPU SIMD execution. Learn how millions of pixel instances run simultaneously, how gl_FragCoord works, and how to normalize coordinates.',
        concepts: ['SIMD Parallelism', 'gl_FragCoord', 'gl_FragColor', 'Coordinate Normalization', 'Float Precision'],
        difficulty: 'Beginner',
        isReady: true,
        previewShader: `
            precision mediump float;
            uniform vec2 u_resolution;
            uniform float u_time;
            void main() {
                vec2 st = gl_FragCoord.xy / u_resolution.xy;
                vec3 color = vec3(st.x, st.y, 0.5 + 0.5 * sin(u_time * 2.0));
                gl_FragColor = vec4(color, 1.0);
            }
        `,
        presets: [
            {
                id: 'solid-red',
                name: 'Solid Red',
                desc: 'Every pixel outputs the exact same color vector vec4(1.0, 0.0, 0.0, 1.0).',
                code: `precision mediump float;\n\nvoid main() {\n    // Output solid pure red (R=1, G=0, B=0, A=1)\n    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n}`
            },
            {
                id: 'uv-gradient',
                name: 'UV Gradient',
                desc: 'Normalized coordinates map directly into Red and Green color channels.',
                code: `precision mediump float;\nuniform vec2 u_resolution;\n\nvoid main() {\n    // Normalize coordinates to [0.0, 1.0]\n    vec2 st = gl_FragCoord.xy / u_resolution.xy;\n\n    // Map X to Red, Y to Green\n    vec3 color = vec3(st.x, st.y, 0.0);\n    gl_FragColor = vec4(color, 1.0);\n}`
            },
            {
                id: 'pulsing-rgb',
                name: 'Pulsing RGB',
                desc: 'Combines spatial UV mapping with temporal oscillation using sin(u_time).',
                code: `precision mediump float;\nuniform vec2 u_resolution;\nuniform float u_time;\n\nvoid main() {\n    vec2 st = gl_FragCoord.xy / u_resolution.xy;\n\n    float r = st.x;\n    float g = st.y;\n    float b = 0.5 + 0.5 * sin(u_time * 2.0);\n\n    gl_FragColor = vec4(r, g, b, 1.0);\n}`
            }
        ]
    },
    {
        id: '02',
        number: '02',
        slug: '02-hello-world-your-first-shader',
        part: 'Part I — Foundations',
        title: 'Hello World — Your First Shader',
        subtitle: 'Uniform Inputs, Host Bridge & Aspect-Corrected Spaces',
        description: 'Bridge JavaScript with GLSL. Master continuous uniform streaming (u_resolution, u_time, u_mouse) and learn the 3 primary coordinate spaces: Pixel space, Normalized UV, and Centered aspect-corrected space.',
        concepts: ['Uniform Streams', 'u_resolution', 'u_time', 'u_mouse', 'Aspect Ratio Correction', 'Vector Swizzling'],
        difficulty: 'Beginner',
        isReady: true,
        previewShader: `
            precision mediump float;
            uniform vec2 u_resolution;
            uniform float u_time;
            void main() {
                vec2 st = gl_FragCoord.xy / u_resolution.xy;
                vec2 center = vec2(0.5);
                float d = length(st - center);
                vec3 col = vec3(0.1, 0.4, 0.9) * (1.0 - d * 1.5) + vec3(sin(u_time + st.x * 6.28) * 0.2);
                gl_FragColor = vec4(col, 1.0);
            }
        `,
        presets: [
            {
                id: 'animated-gradient',
                name: 'Animated Gradient',
                desc: 'Smooth horizontal color flow driven by u_time and fract().',
                code: `precision mediump float;\nuniform vec2 u_resolution;\nuniform float u_time;\n\nvoid main() {\n    vec2 st = gl_FragCoord.xy / u_resolution.xy;\n\n    vec3 blue = vec3(0.05, 0.2, 0.6);\n    vec3 gold = vec3(1.0, 0.7, 0.2);\n\n    float t = fract(st.x + u_time * 0.2);\n    vec3 color = mix(blue, gold, t);\n\n    gl_FragColor = vec4(color, 1.0);\n}`
            },
            {
                id: 'mouse-spotlight',
                name: 'Interactive Mouse Spotlight',
                desc: 'Dynamic light beam following the real-time mouse position.',
                code: `precision mediump float;\nuniform vec2 u_resolution;\nuniform vec2 u_mouse;\n\nvoid main() {\n    vec2 st = gl_FragCoord.xy / u_resolution.xy;\n    vec2 mouse = u_mouse / u_resolution.xy;\n\n    float d = distance(st, mouse);\n    float light = smoothstep(0.3, 0.0, d);\n\n    vec3 bg = vec3(0.08, 0.1, 0.15);\n    vec3 spotColor = vec3(1.0, 0.9, 0.6);\n\n    vec3 color = mix(bg, spotColor, light);\n    gl_FragColor = vec4(color, 1.0);\n}`
            },
            {
                id: 'centered-circle',
                name: 'Aspect-Corrected Circle',
                desc: 'Draws a perfectly round circle regardless of rectangular canvas proportions.',
                code: `precision mediump float;\nuniform vec2 u_resolution;\n\nvoid main() {\n    vec2 st = gl_FragCoord.xy / u_resolution.xy;\n\n    // Correct aspect ratio\n    st.x *= u_resolution.x / u_resolution.y;\n    vec2 center = vec2(0.5 * (u_resolution.x / u_resolution.y), 0.5);\n\n    float d = distance(st, center);\n    float circle = 1.0 - smoothstep(0.25, 0.26, d);\n\n    gl_FragColor = vec4(vec3(circle), 1.0);\n}`
            }
        ]
    },
    {
        id: '03',
        number: '03',
        slug: '03-shaping-functions',
        part: 'Part I — Foundations',
        title: 'Shaping Functions',
        subtitle: 'Continuous Transfer Functions, Step, Smoothstep & Hermite Curves',
        description: 'Explore the mathematical DNA of procedural graphics. Master 1D shaping functions ($y = f(x)$) including step, smoothstep, pow, sin, fract, and abs with a live side-by-side 1D/2D curve visualizer.',
        concepts: ['step()', 'smoothstep()', 'Cubic Hermite Polynomials', 'Power Curves', 'Periodic Waves', 'Sawtooth fract()', 'Mirror abs()'],
        difficulty: 'Intermediate',
        isReady: true,
        hasGraph: true,
        previewShader: `
            precision mediump float;
            uniform vec2 u_resolution;
            uniform float u_time;
            void main() {
                vec2 st = gl_FragCoord.xy / u_resolution.xy;
                float y = smoothstep(0.2, 0.8, st.x);
                float pct = smoothstep(0.02, 0.0, abs(st.y - y));
                vec3 color = mix(vec3(0.08, 0.11, 0.18), vec3(0.35, 0.75, 1.0), pct);
                gl_FragColor = vec4(color, 1.0);
            }
        `,
        presets: [
            {
                id: 'step',
                name: 'Binary Step',
                fnName: 'step(edge, x)',
                desc: 'Binary threshold cutoff for hard silhouettes and sharp borders.',
                params: { edge: 0.5 },
                paramDefs: [{ name: 'edge', label: 'Edge Threshold', min: 0.0, max: 1.0, step: 0.01 }],
                fn: (x, p) => (x >= p.edge ? 1.0 : 0.0),
                getCode: (p) => `precision mediump float;\nuniform vec2 u_resolution;\n\nfloat plot(vec2 st, float pct) {\n    return smoothstep(0.015, 0.0, abs(st.y - pct));\n}\n\nvoid main() {\n    vec2 st = gl_FragCoord.xy / u_resolution.xy;\n\n    // Step shaping function\n    float y = step(${p.edge.toFixed(2)}, st.x);\n\n    vec3 bg = vec3(st.x * 0.2);\n    vec3 line = vec3(0.2, 0.8, 0.4);\n    vec3 color = mix(bg, line, plot(st, y));\n\n    gl_FragColor = vec4(color, 1.0);\n}`
            },
            {
                id: 'smoothstep',
                name: 'Smoothstep (Hermite)',
                fnName: 'smoothstep(edge0, edge1, x)',
                desc: 'Cubic Hermite S-curve interpolation (3t² - 2t³) with zero slope at boundaries.',
                params: { edge0: 0.2, edge1: 0.8 },
                paramDefs: [
                    { name: 'edge0', label: 'Lower Edge', min: 0.0, max: 1.0, step: 0.01 },
                    { name: 'edge1', label: 'Upper Edge', min: 0.0, max: 1.0, step: 0.01 }
                ],
                fn: (x, p) => {
                    const t = Math.max(0, Math.min(1, (x - p.edge0) / (p.edge1 - p.edge0 || 0.0001)));
                    return t * t * (3 - 2 * t);
                },
                getCode: (p) => `precision mediump float;\nuniform vec2 u_resolution;\n\nfloat plot(vec2 st, float pct) {\n    return smoothstep(0.015, 0.0, abs(st.y - pct));\n}\n\nvoid main() {\n    vec2 st = gl_FragCoord.xy / u_resolution.xy;\n\n    // Smoothstep cubic Hermite curve\n    float y = smoothstep(${p.edge0.toFixed(2)}, ${p.edge1.toFixed(2)}, st.x);\n\n    vec3 bg = vec3(y * 0.3);\n    vec3 line = vec3(0.35, 0.75, 1.0);\n    vec3 color = mix(bg, line, plot(st, y));\n\n    gl_FragColor = vec4(color, 1.0);\n}`
            },
            {
                id: 'power',
                name: 'Power Curve',
                fnName: 'pow(x, exponent)',
                desc: 'Non-linear acceleration curve for gamma correction and contrast shaping.',
                params: { exponent: 3.0 },
                paramDefs: [{ name: 'exponent', label: 'Exponent', min: 0.1, max: 8.0, step: 0.1 }],
                fn: (x, p) => Math.pow(Math.max(0, x), p.exponent),
                getCode: (p) => `precision mediump float;\nuniform vec2 u_resolution;\n\nfloat plot(vec2 st, float pct) {\n    return smoothstep(0.015, 0.0, abs(st.y - pct));\n}\n\nvoid main() {\n    vec2 st = gl_FragCoord.xy / u_resolution.xy;\n\n    // Power shaping curve\n    float y = pow(st.x, ${p.exponent.toFixed(2)});\n\n    vec3 bg = vec3(y * 0.25);\n    vec3 line = vec3(1.0, 0.6, 0.2);\n    vec3 color = mix(bg, line, plot(st, y));\n\n    gl_FragColor = vec4(color, 1.0);\n}`
            },
            {
                id: 'sine',
                name: 'Sine Oscillation',
                fnName: '0.5 + 0.5 * sin(x * freq)',
                desc: 'Periodic wave scaled to the normalized unit interval [0.0, 1.0].',
                params: { frequency: 6.28, phase: 0.0 },
                paramDefs: [
                    { name: 'frequency', label: 'Frequency', min: 1.0, max: 20.0, step: 0.1 },
                    { name: 'phase', label: 'Phase Offset', min: 0.0, max: 6.28, step: 0.1 }
                ],
                fn: (x, p) => 0.5 + 0.5 * Math.sin(x * p.frequency + p.phase),
                getCode: (p) => `precision mediump float;\nuniform vec2 u_resolution;\n\nfloat plot(vec2 st, float pct) {\n    return smoothstep(0.015, 0.0, abs(st.y - pct));\n}\n\nvoid main() {\n    vec2 st = gl_FragCoord.xy / u_resolution.xy;\n\n    // Normalized Sine wave\n    float y = 0.5 + 0.5 * sin(st.x * ${p.frequency.toFixed(2)} + ${p.phase.toFixed(2)});\n\n    vec3 bg = vec3(0.08, 0.1, 0.15);\n    vec3 line = vec3(0.8, 0.3, 0.9);\n    vec3 color = mix(bg, line, plot(st, y));\n\n    gl_FragColor = vec4(color, 1.0);\n}`
            },
            {
                id: 'fract',
                name: 'Sawtooth fract()',
                fnName: 'fract(x * count)',
                desc: 'Modulo fractional arithmetic creating periodic sawtooth ramps.',
                params: { count: 3.0 },
                paramDefs: [{ name: 'count', label: 'Repetition Count', min: 1.0, max: 8.0, step: 1.0 }],
                fn: (x, p) => (x * p.count) % 1.0,
                getCode: (p) => `precision mediump float;\nuniform vec2 u_resolution;\n\nfloat plot(vec2 st, float pct) {\n    return smoothstep(0.015, 0.0, abs(st.y - pct));\n}\n\nvoid main() {\n    vec2 st = gl_FragCoord.xy / u_resolution.xy;\n\n    // Sawtooth modulo repetition\n    float y = fract(st.x * ${p.count.toFixed(1)});\n\n    vec3 bg = vec3(0.1);\n    vec3 line = vec3(0.2, 0.9, 0.8);\n    vec3 color = mix(bg, line, plot(st, y));\n\n    gl_FragColor = vec4(color, 1.0);\n}`
            }
        ]
    },
    {
        id: '04',
        number: '04',
        slug: '04-colors-color-spaces',
        part: 'Part II — Colors & Shapes',
        title: 'Colors & Color Spaces',
        subtitle: 'RGB Channel Blending, HSB Polar Wheels & Inigo Quilez Cosine Palettes',
        description: 'Learn the secrets of procedural color. Master multi-channel mix(), branchless HSB-to-RGB transformations, polar angle hue wheels, and mathematical cosine palettes by Inigo Quilez.',
        concepts: ['RGB Color Cube', 'HSB / HSV Model', 'Branchless hsb2rgb', 'Polar Hue Wheels', 'Cosine Palettes', 'Color Gradients'],
        difficulty: 'Intermediate',
        isReady: true,
        previewShader: `
            precision mediump float;
            uniform vec2 u_resolution;
            uniform float u_time;
            vec3 pal(in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d) {
                return a + b * cos(6.28318 * (c * t + d));
            }
            void main() {
                vec2 st = gl_FragCoord.xy / u_resolution.xy;
                vec3 col = pal(st.x + u_time * 0.1, vec3(0.5), vec3(0.5), vec3(1.0), vec3(0.0, 0.33, 0.67));
                gl_FragColor = vec4(col, 1.0);
            }
        `,
        presets: [
            {
                id: 'linear-gradient',
                name: 'Linear Gradient & mix()',
                desc: 'Two-point color interpolation across a custom diagonal angle.',
                code: `precision mediump float;\nuniform vec2 u_resolution;\n\nvoid main() {\n    vec2 st = gl_FragCoord.xy / u_resolution.xy;\n\n    vec3 colorA = vec3(0.15, 0.05, 0.35); // Deep Purple\n    vec3 colorB = vec3(0.0, 0.85, 0.85);  // Bright Cyan\n\n    float t = smoothstep(0.1, 0.9, (st.x + st.y) * 0.5);\n    vec3 color = mix(colorA, colorB, t);\n\n    gl_FragColor = vec4(color, 1.0);\n}`
            },
            {
                id: 'hsb-wheel',
                name: 'HSB Polar Color Wheel',
                desc: 'Polar coordinates (atan + length) mapped to continuous Hue and Saturation.',
                code: `precision mediump float;\nuniform vec2 u_resolution;\nuniform float u_time;\n\n#define TWO_PI 6.28318530718\n\nvec3 hsb2rgb(in vec3 c) {\n    vec3 rgb = clamp(abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0, 0.0, 1.0);\n    rgb = rgb*rgb*(3.0-2.0*rgb);\n    return c.z * mix(vec3(1.0), rgb, c.y);\n}\n\nvoid main() {\n    vec2 st = gl_FragCoord.xy / u_resolution.xy;\n    vec2 toCenter = vec2(0.5) - st;\n\n    float angle = atan(toCenter.y, toCenter.x) + u_time * 0.5;\n    float radius = length(toCenter) * 2.0;\n\n    float hue = angle / TWO_PI + 0.5;\n    vec3 color = hsb2rgb(vec3(hue, radius, 1.0));\n\n    // Soft circular edge\n    color *= smoothstep(1.0, 0.98, radius);\n\n    gl_FragColor = vec4(color, 1.0);\n}`
            },
            {
                id: 'cosine-rainbow',
                name: 'IQ Cosine Rainbow',
                desc: 'Inigo Quilez standard rainbow cosine palette (a+b*cos(2π(c*t+d))).',
                code: `precision mediump float;\nuniform vec2 u_resolution;\nuniform float u_time;\n\nvec3 palette(in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d) {\n    return a + b * cos(6.28318 * (c * t + d));\n}\n\nvoid main() {\n    vec2 st = gl_FragCoord.xy / u_resolution.xy;\n\n    vec3 a = vec3(0.5, 0.5, 0.5);\n    vec3 b = vec3(0.5, 0.5, 0.5);\n    vec3 c = vec3(1.0, 1.0, 1.0);\n    vec3 d = vec3(0.00, 0.33, 0.67);\n\n    vec3 color = palette(st.x + u_time * 0.1, a, b, c, d);\n    gl_FragColor = vec4(color, 1.0);\n}`
            },
            {
                id: 'cosine-neon',
                name: 'IQ Neon Cyberpunk',
                desc: 'High-contrast cyan, magenta, and gold procedural cosine palette.',
                code: `precision mediump float;\nuniform vec2 u_resolution;\nuniform float u_time;\n\nvec3 palette(in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d) {\n    return a + b * cos(6.28318 * (c * t + d));\n}\n\nvoid main() {\n    vec2 st = gl_FragCoord.xy / u_resolution.xy;\n\n    vec3 a = vec3(0.8, 0.5, 0.4);\n    vec3 b = vec3(0.2, 0.4, 0.2);\n    vec3 c = vec3(2.0, 1.0, 1.0);\n    vec3 d = vec3(0.00, 0.25, 0.25);\n\n    vec3 color = palette(st.x * 2.0 - u_time * 0.15, a, b, c, d);\n    gl_FragColor = vec4(color, 1.0);\n}`
            }
        ]
    },
    {
        id: '05',
        number: '05',
        slug: '05-shapes-and-sdfs',
        part: 'Part II — Colors & Shapes',
        title: '2D Shapes & Basic SDFs',
        subtitle: 'Signed Distance Fields, Circles, Rectangles & Analytical Antialiasing',
        description: 'Transition from pixel coordinates to distance fields. Learn why Signed Distance Fields (SDFs) are the foundation of GPU vector graphics, and create crisp circles, boxes, and rings.',
        concepts: ['Signed Distance Fields', 'Circle SDF', 'Box SDF', 'fwidth() Antialiasing', 'Annular Rings', 'Boolean Ops'],
        difficulty: 'Intermediate',
        isReady: false
    },
    {
        id: '06',
        number: '06',
        slug: '06-matrices-and-transforms',
        part: 'Part II — Colors & Shapes',
        title: 'Matrices & Transforms',
        subtitle: '2D Affine Transformations, Translation, Rotation & Scaling',
        description: 'Master 2D coordinate transformations in GLSL. Learn how translating, rotating, and scaling the coordinate space transforms the resulting geometry.',
        concepts: ['2D Transformation Matrices', 'mat2 / mat3', 'Space Translation', 'Rotation Matrices', 'Non-Uniform Scaling', 'Pivot Points'],
        difficulty: 'Intermediate',
        isReady: false
    },
    {
        id: '07',
        number: '07',
        slug: '07-patterns-and-tiling',
        part: 'Part III — Noise & Patterns',
        title: 'Patterns & Tiling',
        subtitle: 'Periodic Grid Instancing, Brick Tiling & Truchet Tiles',
        description: 'Tessellate 2D space infinitely using fract() and floor(). Build infinite grids, alternating brick patterns, and complex Truchet maze labyrinths.',
        concepts: ['Domain Repetition', 'Grid Cells (fract/floor)', 'Offset Brick Patterns', 'Truchet Tiles', 'Sub-Cell Coordinates'],
        difficulty: 'Intermediate',
        isReady: false
    },
    {
        id: '08',
        number: '08',
        slug: '08-pseudo-randomness',
        part: 'Part III — Noise & Patterns',
        title: 'Pseudo-Randomness',
        subtitle: 'Deterministic Hash Functions, Sine Scramblers & White Noise',
        description: 'Demystify randomness on deterministic GPU hardware. Build 1D and 2D pseudo-random hash functions using fractional sine multipliers and golden ratios.',
        concepts: ['Deterministic Hashing', 'fract(sin(dot()))', 'White Noise', 'Hash Distribution', 'GPU Precision Quirks'],
        difficulty: 'Intermediate',
        isReady: false
    },
    {
        id: '09',
        number: '09',
        slug: '09-value-noise',
        part: 'Part III — Noise & Patterns',
        title: 'Value Noise',
        subtitle: 'Grid Interpolation, Bilinear Blending & Smooth Randomness',
        description: 'Bridge discrete random grid cells into continuous organic textures using 2D bilinear interpolation and cubic Hermite smoothing.',
        concepts: ['Lattice Grids', 'Bilinear Interpolation', 'Hermite Smoothing Curves', 'Organic Terrain', 'Procedural Textures'],
        difficulty: 'Intermediate',
        isReady: false
    },
    {
        id: '10',
        number: '10',
        slug: '10-gradient-noise',
        part: 'Part III — Noise & Patterns',
        title: 'Gradient & Perlin Noise',
        subtitle: 'Ken Perlin’s Algorithm, Random Unit Vectors & Quintic Interpolation',
        description: 'Master standard Perlin and Simplex gradient noise. Understand how directional gradient vectors eliminate axis-aligned artifacts for hyper-realistic textures.',
        concepts: ['Perlin Noise Algorithm', 'Gradient Vectors', 'Quintic Smoothing (6t⁵-15t⁴+10t³)', 'Simplex Grid Gradients', 'Wood & Marble Textures'],
        difficulty: 'Advanced',
        isReady: false
    },
    {
        id: '11',
        number: '11',
        slug: '11-cellular-noise',
        part: 'Part III — Noise & Patterns',
        title: 'Cellular & Voronoi Noise',
        subtitle: 'Worley Noise, Euclidean Distance Fields & Biological Patterns',
        description: 'Generate natural cellular structures, cracked mud, water caustics, and reptilian scales using Worley distance fields and 3x3 neighbor cell searches.',
        concepts: ['Worley Cellular Noise', 'Voronoi Diagrams', 'Feature Point Searches', 'F1 vs F2 Metric Differences', 'Water Caustics'],
        difficulty: 'Advanced',
        isReady: false
    },
    {
        id: '12',
        number: '12',
        slug: '12-fractional-brownian-motion',
        part: 'Part III — Noise & Patterns',
        title: 'Fractional Brownian Motion (fBm)',
        subtitle: 'Octaves, Lacunarity, Gain & Multi-Scale Procedural Fractals',
        description: 'Layer multiple frequency octaves of noise together to create hyper-detailed procedural terrain, turbulent smoke clouds, and planetary surfaces.',
        concepts: ['Harmonic Summation', 'Octaves', 'Lacunarity', 'Gain / Persistence', 'Turbulence abs(noise)', 'Ridge Noise'],
        difficulty: 'Advanced',
        isReady: false
    },
    {
        id: '13',
        number: '13',
        slug: '13-domain-warping',
        part: 'Part IV — FX & Generative Art',
        title: 'Domain Warping & Fluid Distortion',
        subtitle: 'Nested Function Distortion & Turbulent Liquid Textures',
        description: 'Feed noise functions into the coordinates of other noise functions to produce organic swirls, fluid marbling, liquid smoke, and oil slicks.',
        concepts: ['Domain Warping', 'Vector Field Distortion', 'Multi-Layered Turbulence', 'Procedural Marbling', 'Organic Fluid Aesthetics'],
        difficulty: 'Advanced',
        isReady: false
    },
    {
        id: '14',
        number: '14',
        slug: '14-image-processing-and-filters',
        part: 'Part IV — FX & Generative Art',
        title: 'Image Processing & 2D Convolutions',
        subtitle: 'Kernel Matrices, Gaussian Blur, Sobel Edge Detection & CRT Shaders',
        description: 'Apply spatial convolution kernels to textures and procedural buffers. Build Gaussian blurs, Sobel edge detectors, sharpen filters, and retro CRT screen effects.',
        concepts: ['Convolution Kernels', 'Gaussian Blur', 'Sobel Edge Gradients', 'Sharpen & Emboss', 'Scanlines & Chromatic Aberration'],
        difficulty: 'Intermediate',
        isReady: false
    },
    {
        id: '15',
        number: '15',
        slug: '15-generative-art-project',
        part: 'Part IV — FX & Generative Art',
        title: 'Capstone: Generative Art Showcase',
        subtitle: 'Composing Audio-Reactive Audio Visualizers, Neon Cyberpunk & HUDs',
        description: 'Synthesize all previous techniques into production-grade generative art pieces: a neon sci-fi heads-up display, procedural celestial black hole, and audio-reactive ripples.',
        concepts: ['Complex Composition', 'Layer Blending Modes', 'Color Grading', 'Glow & Bloom Techniques', 'Performance Optimization'],
        difficulty: 'Advanced',
        isReady: false
    },
    {
        id: '16',
        number: '16',
        slug: '16-2d-lighting-and-shadows',
        part: 'Part V — Advanced 2D Techniques',
        title: '2D Lighting, Soft Shadows & Raymarching',
        subtitle: '2D SDF Raymarching, Penumbra Soft Shadows & Normal Gradients',
        description: 'Bring 3D illumination concepts into 2D space. Cast 2D rays against Signed Distance Fields, calculate surface normal gradients, and render realistic soft penumbra shadows.',
        concepts: ['2D Raymarching', 'SDF Normal Derivation', 'Diffuse & Specular Shading', 'Penumbra Soft Shadows', 'Occlusion Testing'],
        difficulty: 'Master',
        isReady: false
    },
    {
        id: '17',
        number: '17',
        slug: '17-2d-fractals-and-kifs',
        part: 'Part V — Advanced 2D Techniques',
        title: '2D Fractals, Complex Numbers & KIFS',
        subtitle: 'Mandelbrot, Julia Sets, Orbit Traps & Kaleidoscopic Iterated Function Systems',
        description: 'Perform complex number arithmetic in GLSL to render the Mandelbrot set, Julia sets, smooth escape-time coloring, and kaleidoscopic folding systems (KIFS).',
        concepts: ['Complex Numbers', 'Mandelbrot Set', 'Julia Sets', 'Orbit Traps', 'KIFS Folding'],
        difficulty: 'Master',
        isReady: false
    },
    {
        id: '18',
        number: '18',
        slug: '18-multipass-simulation',
        part: 'Part V — Advanced 2D Techniques',
        title: 'Multi-Pass Shaders & Simulation',
        subtitle: 'FBO Double-Buffering, Game of Life & Reaction-Diffusion',
        description: 'Harness Framebuffer Objects (FBOs) and ping-pong render targets to maintain state across frames, creating Conway’s Game of Life, fluid trails, and Gray-Scott reaction-diffusion.',
        concepts: ['Framebuffer Objects', 'Ping-Pong Buffering', 'State Persistence', 'Conway Game of Life', 'Reaction-Diffusion'],
        difficulty: 'Master',
        isReady: false
    }
];

// Helper to look up chapter by ID or Number
function getChapterByNumber(num) {
    const formatted = String(num).padStart(2, '0');
    return CHAPTERS_REGISTRY.find(c => c.number === formatted || c.id === formatted) || null;
}
