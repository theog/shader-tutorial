/**
 * Interactive Quiz Database for 2D Shader Tutorial
 * Covers all questions, choices, code challenges, hints, and explanations.
 */

const QUIZ_DATABASE = {
    '01': {
        chapterNum: '01',
        title: 'What Is a Fragment Shader?',
        part: 'Part I — Foundations',
        questions: [
            {
                id: '01-q1',
                type: 'multiple_choice',
                title: 'Fragment Shader Output',
                question: 'What does a fragment shader compute?',
                options: [
                    'A) The position of vertices in 3D space',
                    'B) The color of a single pixel (fragment)',
                    'C) The physics simulation for each frame',
                    'D) The draw order of 3D geometry'
                ],
                correctIndex: 1,
                explanation: 'A fragment shader is a program running per-pixel on the GPU whose sole responsibility is computing the final RGBA color of each rasterized pixel.'
            },
            {
                id: '01-q2',
                type: 'multiple_choice',
                title: 'Pixel Position Register',
                question: 'What does the built-in variable `gl_FragCoord` contain?',
                options: [
                    'A) The final output color of the pixel',
                    'B) The canvas resolution in pixels',
                    'C) The pixel\'s position in window/screen coordinates',
                    'D) The mouse cursor coordinate'
                ],
                correctIndex: 2,
                explanation: '`gl_FragCoord` is a built-in read-only vector containing the window-relative coordinates (x, y) of the fragment currently being evaluated.'
            },
            {
                id: '01-q3',
                type: 'multiple_choice',
                title: 'Coordinate Normalization',
                question: 'Why do we divide `gl_FragCoord.xy` by `u_resolution.xy`?',
                options: [
                    'A) To make the shader run faster',
                    'B) To invert the vertical Y axis',
                    'C) To normalize coordinates to the 0.0–1.0 range regardless of canvas size',
                    'D) To convert integers into floating-point numbers'
                ],
                correctIndex: 2,
                explanation: 'Dividing physical pixel coordinates by total canvas resolution maps the coordinate space to [0.0, 1.0], making all shader equations resolution-independent across screens.'
            },
            {
                id: '01-q4',
                type: 'true_false',
                title: 'Inter-Pixel Communication',
                question: 'A fragment shader can directly read the color value that a neighboring pixel computed during the same rendering pass.',
                correctValue: false,
                explanation: 'False. GPU threads execute in isolated parallel hardware lanes without inter-thread communication or shared state.'
            },
            {
                id: '01-q5',
                type: 'true_false',
                title: 'Uniform Variables',
                question: 'The `uniform` keyword means the variable has a unique, different value for each pixel.',
                correctValue: false,
                explanation: 'False. `uniform` variables are constant (uniform) across all fragment threads during a single draw call, sent from the CPU host.'
            },
            {
                id: '01-q6',
                type: 'code_challenge',
                title: 'Vertical Grayscale Gradient',
                question: 'Write a fragment shader that creates a smooth grayscale gradient from black at the bottom to white at the top.',
                hint: 'In normalized space, st.y goes from 0.0 at the bottom to 1.0 at the top.',
                starterCode: 'precision mediump float;\nuniform vec2 u_resolution;\n\nvoid main() {\n    vec2 st = gl_FragCoord.xy / u_resolution.xy;\n    vec3 color = vec3(0.0);\n\n    // TODO: assign vertical grayscale ramp\n\n    gl_FragColor = vec4(color, 1.0);\n}',
                solutionCode: 'precision mediump float;\nuniform vec2 u_resolution;\n\nvoid main() {\n    vec2 st = gl_FragCoord.xy / u_resolution.xy;\n    vec3 color = vec3(st.y);\n    gl_FragColor = vec4(color, 1.0);\n}',
                explanation: 'Assigning `vec3(st.y)` sets Red, Green, and Blue equally to the normalized vertical coordinate, smoothly going from black (0.0) at the bottom to white (1.0) at the top.'
            },
            {
                id: '01-q7',
                type: 'code_challenge',
                title: 'Pulsing RGB Wave',
                question: 'Write a fragment shader where Red = st.x, Green = st.y, and Blue pulses between 0.0 and 1.0 over time using sin(u_time).',
                hint: 'sin(u_time) ranges from -1.0 to +1.0. Use 0.5 + 0.5 * sin(u_time) to remap it to 0.0 -> 1.0.',
                starterCode: 'precision mediump float;\nuniform vec2 u_resolution;\nuniform float u_time;\n\nvoid main() {\n    vec2 st = gl_FragCoord.xy / u_resolution.xy;\n\n    // TODO: assign r, g, b\n\n    gl_FragColor = vec4(0.0);\n}',
                solutionCode: 'precision mediump float;\nuniform vec2 u_resolution;\nuniform float u_time;\n\nvoid main() {\n    vec2 st = gl_FragCoord.xy / u_resolution.xy;\n    float blue = 0.5 + 0.5 * sin(u_time);\n    gl_FragColor = vec4(st.x, st.y, blue, 1.0);\n}',
                explanation: '`0.5 + 0.5 * sin(u_time)` maps the sinusoidal wave into the valid [0.0, 1.0] color domain, combining static spatial coordinates with temporal animation.'
            }
        ]
    },
    '02': {
        chapterNum: '02',
        title: 'Hello World — Your First Shader',
        part: 'Part I — Foundations',
        questions: [
            {
                id: '02-q1',
                type: 'multiple_choice',
                title: 'Linear Interpolation mix()',
                question: 'What does the built-in function `mix(a, b, 0.25)` return?',
                options: [
                    'A) 25% of `a` plus 75% of `b`',
                    'B) 75% of `a` plus 25% of `b`',
                    'C) The average of `a` and `b`',
                    'D) Either `a` or `b` depending on which is larger'
                ],
                correctIndex: 1,
                explanation: '`mix(a, b, t)` evaluates to `a * (1.0 - t) + b * t`. At t = 0.25, you get 0.75 * a + 0.25 * b (75% a + 25% b).'
            },
            {
                id: '02-q2',
                type: 'multiple_choice',
                title: 'Normalized Canvas Center',
                question: 'If a canvas is 800×400 pixels, what is `gl_FragCoord.xy / u_resolution.xy` at the exact canvas center?',
                options: [
                    'A) vec2(400.0, 200.0)',
                    'B) vec2(0.5, 0.5)',
                    'C) vec2(1.0, 1.0)',
                    'D) vec2(0.0, 0.0)'
                ],
                correctIndex: 1,
                explanation: 'The center pixel is at (400, 200). Dividing by (800, 400) results in (0.5, 0.5).'
            },
            {
                id: '02-q3',
                type: 'multiple_choice',
                title: 'Unset Uniform Values',
                question: 'What happens if you declare `uniform float u_time;` in GLSL but never set its value from JavaScript?',
                options: [
                    'A) The shader fails to compile',
                    'B) It defaults to 0.0 without compiler error',
                    'C) It throws a WebGL runtime exception',
                    'D) It automatically reads the CPU clock'
                ],
                correctIndex: 1,
                explanation: 'Unset uniforms in WebGL default to 0.0. The shader compiles and runs, but time-dependent animations will remain static.'
            },
            {
                id: '02-q4',
                type: 'true_false',
                title: 'Shorthand Vector Constructors',
                question: '`vec3(0.5)` is valid GLSL shorthand for `vec3(0.5, 0.5, 0.5)`.',
                correctValue: true,
                explanation: 'True. GLSL vector constructors accept a single scalar float and replicate it across all vector components.'
            },
            {
                id: '02-q5',
                type: 'true_false',
                title: 'Cursor Uniform Streaming',
                question: 'The `u_mouse` uniform automatically updates itself from browser events without JavaScript setting it.',
                correctValue: false,
                explanation: 'False. WebGL has no built-in DOM event listeners. Your JavaScript host must capture `mousemove` events and call `gl.uniform2f()`.'
            },
            {
                id: '02-q6',
                type: 'code_challenge',
                title: 'Centered Radial Glow',
                question: 'Write a fragment shader that creates a white radial glow centered at (0.5, 0.5) that fades smoothly to black at the canvas edges using distance().',
                hint: 'Calculate distance from st to vec2(0.5) and invert it with 1.0 - distance.',
                starterCode: 'precision mediump float;\nuniform vec2 u_resolution;\n\nvoid main() {\n    vec2 st = gl_FragCoord.xy / u_resolution.xy;\n    // TODO: compute distance from center and create glow\n    vec3 color = vec3(0.0);\n    gl_FragColor = vec4(color, 1.0);\n}',
                solutionCode: 'precision mediump float;\nuniform vec2 u_resolution;\n\nvoid main() {\n    vec2 st = gl_FragCoord.xy / u_resolution.xy;\n    float d = distance(st, vec2(0.5));\n    float brightness = clamp(1.0 - d * 2.0, 0.0, 1.0);\n    gl_FragColor = vec4(vec3(brightness), 1.0);\n}',
                explanation: '`distance(st, vec2(0.5))` computes Euclidean distance. Subtracting from 1.0 and clamping produces an inverse radial falloff.'
            },
            {
                id: '02-q7',
                type: 'code_challenge',
                title: 'Scrolling Horizontal Gradient',
                question: 'Write a fragment shader that blends between deep blue vec3(0.0, 0.1, 0.4) and warm orange vec3(1.0, 0.5, 0.0) using fract(st.x + u_time * 0.2).',
                hint: 'Use fract() to wrap the moving coordinate, then pass it as the t parameter to mix().',
                starterCode: 'precision mediump float;\nuniform vec2 u_resolution;\nuniform float u_time;\n\nvoid main() {\n    vec2 st = gl_FragCoord.xy / u_resolution.xy;\n    // TODO: scrolling gradient\n    gl_FragColor = vec4(0.0);\n}',
                solutionCode: 'precision mediump float;\nuniform vec2 u_resolution;\nuniform float u_time;\n\nvoid main() {\n    vec2 st = gl_FragCoord.xy / u_resolution.xy;\n    vec3 blue = vec3(0.0, 0.1, 0.4);\n    vec3 orange = vec3(1.0, 0.5, 0.0);\n    float t = fract(st.x + u_time * 0.2);\n    vec3 color = mix(blue, orange, t);\n    gl_FragColor = vec4(color, 1.0);\n}',
                explanation: 'Adding `u_time` translates the coordinate space continuously, while `fract()` wraps the values periodically between 0.0 and 1.0.'
            }
        ]
    },
    '03': {
        chapterNum: '03',
        title: 'Shaping Functions',
        part: 'Part I — Foundations',
        questions: [
            {
                id: '03-q1',
                type: 'multiple_choice',
                title: 'Step Function Output',
                question: 'What is the output of `step(0.7, 0.5)`?',
                options: [
                    'A) 0.0',
                    'B) 1.0',
                    'C) 0.5',
                    'D) 0.7'
                ],
                correctIndex: 0,
                explanation: '`step(edge, x)` returns 0.0 when x < edge and 1.0 when x >= edge. Since 0.5 < 0.7, it returns 0.0.'
            },
            {
                id: '03-q2',
                type: 'multiple_choice',
                title: 'Smoothstep Polynomial',
                question: 'What mathematical curve does `smoothstep(edge0, edge1, x)` compute between its thresholds?',
                options: [
                    'A) Linear interpolation (y = x)',
                    'B) Cubic Hermite polynomial (3t² - 2t³)',
                    'C) Sine wave oscillation',
                    'D) Exponential decay curve'
                ],
                correctIndex: 1,
                explanation: '`smoothstep` uses the cubic Hermite polynomial 3t² - 2t³ (where t is normalized between edge0 and edge1), guaranteeing smooth 0-velocity tangents at both boundaries.'
            },
            {
                id: '03-q3',
                type: 'multiple_choice',
                title: 'Power Curve Visual Effect',
                question: 'For an input x in [0.0, 1.0], what visual effect does `pow(x, 3.0)` create compared to a linear ramp?',
                options: [
                    'A) Compresses shadows (darks stay darker) with a steep rise at the high end',
                    'B) Makes the entire image uniformly brighter',
                    'C) Inverts the color spectrum',
                    'D) Creates a repeating sawtooth wave'
                ],
                correctIndex: 0,
                explanation: 'Powers greater than 1.0 compress lower numbers towards zero, widening shadow contrast before rising steeply towards 1.0.'
            },
            {
                id: '03-q4',
                type: 'true_false',
                title: 'Sawtooth Repetition',
                question: '`fract(x * 5.0)` creates 5 repeating linear ramps from 0.0 to 1.0 across the unit interval.',
                correctValue: true,
                explanation: 'True. `fract(x)` computes x - floor(x). Multiplying by 5.0 scales the coordinate so it wraps 5 times within [0.0, 1.0].'
            },
            {
                id: '03-q5',
                type: 'true_false',
                title: 'Bilateral Mirror Symmetry',
                question: '`abs(st.x * 2.0 - 1.0)` produces bilateral mirror symmetry with the reflection axis at the canvas center.',
                correctValue: true,
                explanation: 'True. Remapping [0, 1] to [-1, +1] places 0.0 at the center; taking the absolute value mirrors both negative and positive halves.'
            },
            {
                id: '03-q6',
                type: 'code_challenge',
                title: 'Single-Pixel Antialiased Line',
                question: 'Use smoothstep and pixel size `1.0 / u_resolution.y` to draw an antialiased horizontal line at y = 0.5.',
                hint: 'Compute line = smoothstep(px, 0.0, abs(st.y - 0.5)) where px = 1.0 / u_resolution.y.',
                starterCode: 'precision mediump float;\nuniform vec2 u_resolution;\n\nvoid main() {\n    vec2 st = gl_FragCoord.xy / u_resolution.xy;\n    // TODO: antialiased horizontal line at y = 0.5\n    vec3 color = vec3(0.0);\n    gl_FragColor = vec4(color, 1.0);\n}',
                solutionCode: 'precision mediump float;\nuniform vec2 u_resolution;\n\nvoid main() {\n    vec2 st = gl_FragCoord.xy / u_resolution.xy;\n    float px = 1.0 / u_resolution.y;\n    float line = smoothstep(px * 2.0, 0.0, abs(st.y - 0.5));\n    gl_FragColor = vec4(vec3(line), 1.0);\n}',
                explanation: 'Using the physical pixel size `1.0 / u_resolution.y` in smoothstep ensures the transition matches exact display pixels, delivering sub-pixel antialiasing.'
            },
            {
                id: '03-q7',
                type: 'code_challenge',
                title: 'Symmetric Light Pulse',
                question: 'Subtract two smoothsteps to create an isolated light bump centered at 0.5 with width 0.1.',
                hint: 'pulse = smoothstep(center - width, center, st.x) - smoothstep(center, center + width, st.x).',
                starterCode: 'precision mediump float;\nuniform vec2 u_resolution;\n\nvoid main() {\n    vec2 st = gl_FragCoord.xy / u_resolution.xy;\n    // TODO: subtract two smoothstep edges\n    gl_FragColor = vec4(0.0);\n}',
                solutionCode: 'precision mediump float;\nuniform vec2 u_resolution;\n\nvoid main() {\n    vec2 st = gl_FragCoord.xy / u_resolution.xy;\n    float center = 0.5;\n    float width = 0.1;\n    float pulse = smoothstep(center - width, center, st.x) - smoothstep(center, center + width, st.x);\n    gl_FragColor = vec4(vec3(pulse), 1.0);\n}',
                explanation: 'Subtracting a delayed rising edge from an earlier rising edge creates an isolated, smooth Gaussian-like pulse.'
            }
        ]
    },
    '04': {
        chapterNum: '04',
        title: 'Colors & Color Spaces',
        part: 'Part II — Colors & Shapes',
        questions: [
            {
                id: '04-q1',
                type: 'multiple_choice',
                title: 'Color Vector Mixing',
                question: 'In the built-in function `mix(colorA, colorB, t)`, what is returned when t = 0.75?',
                options: [
                    'A) 25% of colorA and 75% of colorB',
                    'B) 75% of colorA and 25% of colorB',
                    'C) 100% of colorB',
                    'D) The average of colorA and colorB'
                ],
                correctIndex: 0,
                explanation: '`mix(A, B, t)` evaluates to `A * (1.0 - t) + B * t`. At t = 0.75, you get 0.25 * colorA + 0.75 * colorB.'
            },
            {
                id: '04-q2',
                type: 'multiple_choice',
                title: 'HSB Color Advantage',
                question: 'Why is the HSB (Hue, Saturation, Brightness) color model often preferred over RGB for generative art?',
                options: [
                    'A) GPUs compute HSB faster than RGB',
                    'B) You can cycle through colors by rotating a single Hue variable while keeping saturation and brightness constant',
                    'C) RGB cannot represent primary colors like Red, Green, and Blue',
                    'D) HSB does not require floating-point numbers'
                ],
                correctIndex: 1,
                explanation: 'In HSB, Hue is a continuous 1D circular angle ($0.0 \\to 1.0$), making smooth rainbow spectrum rotation and procedural tinting effortless.'
            },
            {
                id: '04-q3',
                type: 'multiple_choice',
                title: 'Polar Coordinate Angle',
                question: 'Which GLSL function computes the polar angle from canvas center for drawing a color wheel?',
                options: [
                    'A) length(toCenter)',
                    'B) distance(toCenter, vec2(0.0))',
                    'C) atan(toCenter.y, toCenter.x)',
                    'D) dot(toCenter, vec2(1.0))'
                ],
                correctIndex: 2,
                explanation: '`atan(y, x)` (two-argument arctangent) calculates the polar angle in radians $[-\\pi, +\\pi]$ from coordinate vectors.'
            },
            {
                id: '04-q4',
                type: 'true_false',
                title: 'Linear RGB Perceived Brightness',
                question: 'Linear RGB interpolation (`mix(vec3(1,0,0), vec3(0,1,0), st.x)`) maintains constant perceived brightness across the entire transition.',
                correctValue: false,
                explanation: 'False. Linear RGB interpolation typically produces a "dark muddy middle" because human brightness perception is non-linear.'
            },
            {
                id: '04-q5',
                type: 'true_false',
                title: 'Cosine Palette Frequencies',
                question: 'In Inigo Quilez\'s cosine palette formula `a + b * cos(2*PI*(c*t + d))`, vector `c` controls the frequency of oscillation for each color channel.',
                correctValue: true,
                explanation: 'True. Vector `c` dictates how rapidly Red, Green, and Blue oscillate as parameter `t` advances, creating rich color combinations.'
            },
            {
                id: '04-q6',
                type: 'code_challenge',
                title: 'Diagonal Two-Tone Gradient',
                question: 'Write a fragment shader creating a smooth diagonal gradient from purple vec3(0.2, 0.0, 0.4) to cyan vec3(0.0, 0.9, 0.9) using smoothstep.',
                hint: 'Diagonal position can be computed via (st.x + st.y) * 0.5.',
                starterCode: 'precision mediump float;\nuniform vec2 u_resolution;\n\nvoid main() {\n    vec2 st = gl_FragCoord.xy / u_resolution.xy;\n    // TODO: diagonal smooth gradient\n    gl_FragColor = vec4(0.0);\n}',
                solutionCode: 'precision mediump float;\nuniform vec2 u_resolution;\n\nvoid main() {\n    vec2 st = gl_FragCoord.xy / u_resolution.xy;\n    vec3 colorA = vec3(0.2, 0.0, 0.4);\n    vec3 colorB = vec3(0.0, 0.9, 0.9);\n    float t = smoothstep(0.1, 0.9, (st.x + st.y) * 0.5);\n    vec3 color = mix(colorA, colorB, t);\n    gl_FragColor = vec4(color, 1.0);\n}',
                explanation: 'Summing `st.x + st.y` creates a diagonal progression, and `smoothstep` produces a non-linear S-curve transition.'
            },
            {
                id: '04-q7',
                type: 'code_challenge',
                title: 'Pulsing Radial Rainbow',
                question: 'Map distance from center to Hue with an outward temporal wave using the provided hsb2rgb function.',
                hint: 'float dist = length(st - vec2(0.5)); float hue = fract(dist * 3.0 - u_time * 0.5);',
                starterCode: 'precision mediump float;\nuniform vec2 u_resolution;\nuniform float u_time;\n\nvec3 hsb2rgb(in vec3 c) {\n    vec3 rgb = clamp(abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0, 0.0, 1.0);\n    rgb = rgb*rgb*(3.0-2.0*rgb);\n    return c.z * mix(vec3(1.0), rgb, c.y);\n}\n\nvoid main() {\n    vec2 st = gl_FragCoord.xy / u_resolution.xy;\n    // TODO: radial hue mapping\n    gl_FragColor = vec4(0.0);\n}',
                solutionCode: 'precision mediump float;\nuniform vec2 u_resolution;\nuniform float u_time;\n\nvec3 hsb2rgb(in vec3 c) {\n    vec3 rgb = clamp(abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0, 0.0, 1.0);\n    rgb = rgb*rgb*(3.0-2.0*rgb);\n    return c.z * mix(vec3(1.0), rgb, c.y);\n}\n\nvoid main() {\n    vec2 st = gl_FragCoord.xy / u_resolution.xy;\n    float dist = length(st - vec2(0.5));\n    float hue = fract(dist * 3.0 - u_time * 0.5);\n    vec3 color = hsb2rgb(vec3(hue, 1.0, 1.0));\n    gl_FragColor = vec4(color, 1.0);\n}',
                explanation: '`length(st - vec2(0.5))` computes radial distance from center, while subtracting `u_time * 0.5` causes concentric rainbow rings to pulse outward.'
            }
        ]
    }
};

// Helper storage functions
function getSavedQuizScores() {
    try {
        const raw = localStorage.getItem('shader_tutorial_quiz_scores');
        return raw ? JSON.parse(raw) : {};
    } catch (e) {
        return {};
    }
}

function saveQuizScoreToStorage(chapterNum, scoreData) {
    try {
        const existing = getSavedQuizScores();
        existing[chapterNum] = {
            ...scoreData,
            updatedAt: new Date().toISOString()
        };
        localStorage.setItem('shader_tutorial_quiz_scores', JSON.stringify(existing));
        return existing;
    } catch (e) {
        console.warn('Failed to save quiz score to localStorage:', e);
        return {};
    }
}

function getSavedQuizProgress(chapterNum) {
    try {
        const raw = localStorage.getItem(`shader_tutorial_quiz_progress_${chapterNum}`);
        return raw ? JSON.parse(raw) : null;
    } catch (e) {
        return null;
    }
}

function saveQuizProgressToStorage(chapterNum, progressData) {
    try {
        localStorage.setItem(`shader_tutorial_quiz_progress_${chapterNum}`, JSON.stringify(progressData));
    } catch (e) {
        console.warn('Failed to save in-progress quiz state:', e);
    }
}

function clearQuizProgressFromStorage(chapterNum) {
    try {
        localStorage.removeItem(`shader_tutorial_quiz_progress_${chapterNum}`);
    } catch (e) {}
}

// Lesson completion storage helpers
function getCompletedLessons() {
    try {
        const raw = localStorage.getItem('shader_tutorial_completed_lessons');
        return raw ? JSON.parse(raw) : {};
    } catch (e) {
        return {};
    }
}

function saveLessonCompletedToStorage(chapterNum, isCompleted = true) {
    try {
        const existing = getCompletedLessons();
        existing[chapterNum] = isCompleted;
        localStorage.setItem('shader_tutorial_completed_lessons', JSON.stringify(existing));
        return existing;
    } catch (e) {
        console.warn('Failed to save completed lesson to localStorage:', e);
        return {};
    }
}

function getAllQuizProgresses() {
    const result = {};
    if (typeof QUIZ_DATABASE === 'undefined') return result;
    const scores = getSavedQuizScores();

    Object.keys(QUIZ_DATABASE).forEach(chNum => {
        const qData = QUIZ_DATABASE[chNum];
        const total = qData.questions?.length || 0;
        const score = scores[chNum];
        const inProgress = getSavedQuizProgress(chNum);
        const answeredCount = inProgress?.answers ? Object.keys(inProgress.answers).length : 0;

        result[chNum] = {
            total,
            answeredCount,
            hasStarted: answeredCount > 0,
            isCompleted: !!(score && score.completed),
            score: score || null
        };
    });

    return result;
}


