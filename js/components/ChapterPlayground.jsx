/**
 * Reusable Chapter Playground Workspace Component
 * Synchronizes presets, code editor, live parameter sliders, 1D function graph, and 2D WebGL canvas.
 */

function ChapterPlayground({
    chapterNum,
    quizScore = null,
    onScoreUpdated = null,
    isLessonRead = false,
    onLessonCompleted = null
}) {
    const chapter = CHAPTERS_REGISTRY.find(c => c.number === chapterNum) || CHAPTERS_REGISTRY[0];

    const presets = chapter.presets || [];
    const [selectedPresetId, setSelectedPresetId] = React.useState(presets[0]?.id || 'default');
    const activePreset = presets.find(p => p.id === selectedPresetId) || presets[0];

    const [params, setParams] = React.useState(activePreset?.params || {});
    const [code, setCode] = React.useState(() => {
        if (activePreset?.getCode) return activePreset.getCode(activePreset.params || {});
        return activePreset?.code || '';
    });
    const [compileError, setCompileError] = React.useState(null);
    const [isPaused, setIsPaused] = React.useState(false);
    const [fps, setFps] = React.useState(60);
    const [resetTimeCount, setResetTimeCount] = React.useState(0);

    const [lessonOpen, setLessonOpen] = React.useState(false);
    const [quizOpen, setQuizOpen] = React.useState(false);

    // Switch Preset
    const handleSelectPreset = (preset) => {
        setSelectedPresetId(preset.id);
        const initialParams = preset.params || {};
        setParams(initialParams);
        if (preset.getCode) {
            setCode(preset.getCode(initialParams));
        } else {
            setCode(preset.code || '');
        }
        setCompileError(null);
    };

    // Update Param from Slider
    const handleParamChange = (name, value) => {
        const nextParams = { ...params, [name]: value };
        setParams(nextParams);

        if (activePreset?.getCode) {
            setCode(activePreset.getCode(nextParams));
        }
    };

    // Reset current preset
    const handleResetPreset = () => {
        if (activePreset) {
            handleSelectPreset(activePreset);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#090d13' }}>
            {/* Top Navigation */}
            <ChapterNavbar
                chapter={chapter}
                onOpenLesson={() => setLessonOpen(true)}
                onOpenQuiz={() => setQuizOpen(true)}
                quizScore={quizScore}
                isLessonRead={isLessonRead}
            />

            {/* Presets Toolbar */}
            {presets.length > 0 && (
                <div style={{
                    padding: '10px 20px',
                    background: '#0d1117',
                    borderBottom: '1px solid #21262d',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    overflowX: 'auto'
                }}>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>
                        Presets:
                    </span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {presets.map(preset => {
                            const isSelected = preset.id === selectedPresetId;
                            return (
                                <button
                                    key={preset.id}
                                    onClick={() => handleSelectPreset(preset)}
                                    style={{
                                        padding: '6px 14px',
                                        borderRadius: '20px',
                                        fontSize: '12px',
                                        fontWeight: isSelected ? '600' : '400',
                                        background: isSelected ? '#1f3a5f' : '#161b22',
                                        color: isSelected ? '#58a6ff' : '#c9d1d9',
                                        border: `1px solid ${isSelected ? '#58a6ff' : '#30363d'}`,
                                        cursor: 'pointer',
                                        whiteSpace: 'nowrap',
                                        transition: 'all 0.15s ease'
                                    }}
                                    title={preset.desc}
                                >
                                    {preset.name}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Main Workspace Layout */}
            <div style={{
                flex: '1',
                display: 'grid',
                gridTemplateColumns: 'minmax(400px, 1fr) minmax(400px, 1fr)',
                gap: '16px',
                padding: '16px 20px',
                maxHeight: 'calc(100vh - 120px)'
            }}>
                {/* Left Column: Code Editor */}
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <GLSLEditor
                        code={code}
                        onChange={newCode => {
                            setCode(newCode);
                            setCompileError(null);
                        }}
                        error={compileError}
                        onReset={handleResetPreset}
                        title={`Chapter ${chapter.number} — ${activePreset?.name || 'Shader'}`}
                    />
                </div>

                {/* Right Column: Visualizer & Controls */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', overflowY: 'auto' }}>
                    {/* WebGL Canvas Card */}
                    <div style={{
                        background: '#0d1117',
                        border: '1px solid #30363d',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        flexShrink: 0
                    }}>
                        {/* Canvas Toolbar */}
                        <div style={{
                            padding: '8px 14px',
                            background: '#161b22',
                            borderBottom: '1px solid #30363d',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#c9d1d9', fontWeight: '600' }}>
                                <span>📺 2D WebGL Viewport</span>
                                <span style={{ fontSize: '11px', color: '#8b949e', background: '#21262d', padding: '2px 6px', borderRadius: '4px' }}>
                                    {fps} FPS
                                </span>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                    onClick={() => setIsPaused(!isPaused)}
                                    style={{
                                        background: '#21262d', border: '1px solid #30363d', color: '#c9d1d9',
                                        padding: '4px 10px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer'
                                    }}
                                >
                                    {isPaused ? '▶ Play' : '⏸ Pause'}
                                </button>
                                <button
                                    onClick={() => setResetTimeCount(c => c + 1)}
                                    style={{
                                        background: '#21262d', border: '1px solid #30363d', color: '#c9d1d9',
                                        padding: '4px 10px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer'
                                    }}
                                >
                                    ↺ Reset Time
                                </button>
                            </div>
                        </div>

                        {/* Viewport Canvas */}
                        <div style={{ height: chapter.hasGraph ? '240px' : '380px', position: 'relative', background: '#090d13' }}>
                            <WebGLCanvas
                                fragmentSource={code}
                                params={params}
                                isPaused={isPaused}
                                resetTimeTrigger={resetTimeCount}
                                onError={setCompileError}
                                onFPS={setFps}
                            />
                        </div>
                    </div>

                    {/* 1D Math Transfer Graph (for Chapter 03 & shaping functions) */}
                    {chapter.hasGraph && activePreset?.fn && (
                        <FunctionGraph
                            fn={activePreset.fn}
                            params={params}
                            title={activePreset.fnName || '1D Shaping Function Curve'}
                            height={180}
                        />
                    )}

                    {/* Parameter Slider Controls */}
                    {activePreset?.paramDefs && activePreset.paramDefs.length > 0 && (
                        <UniformControls
                            paramDefs={activePreset.paramDefs}
                            values={params}
                            onChange={handleParamChange}
                            onResetAll={() => handleSelectPreset(activePreset)}
                        />
                    )}

                    {/* Preset Info Callout */}
                    {activePreset?.desc && (
                        <div style={{
                            padding: '12px 16px',
                            background: '#161b22',
                            border: '1px solid #30363d',
                            borderRadius: '8px',
                            fontSize: '12.5px',
                            color: '#8b949e',
                            lineHeight: '1.5'
                        }}>
                            <strong style={{ color: '#58a6ff' }}>💡 About this preset:</strong> {activePreset.desc}
                        </div>
                    )}
                </div>
            </div>

            {/* Lesson Modal Reader */}
            {lessonOpen && (
                <MarkdownReader
                    title={`Chapter ${chapter.number}: Lesson`}
                    subtitle={chapter.title}
                    chapterNum={chapter.number}
                    filePath={`chapters/${chapter.slug}/lesson.md`}
                    onClose={() => setLessonOpen(false)}
                    onLessonCompleted={onLessonCompleted}
                    initialCompleted={isLessonRead}
                    isModal={true}
                />
            )}

            {/* Quiz Modal Runner */}
            {quizOpen && (
                <QuizRunner
                    chapterNum={chapter.number}
                    onClose={() => setQuizOpen(false)}
                    onScoreUpdated={onScoreUpdated}
                    isModal={true}
                />
            )}
        </div>
    );
}

window.ChapterPlayground = ChapterPlayground;
