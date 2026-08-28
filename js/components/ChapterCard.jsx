/**
 * Reusable Chapter Card Component
 * Displays animated shader previews, status badges, quiz scores, concept tags, and launch buttons.
 */

function ChapterCard({
    chapter,
    quizScore = null,
    onOpenLesson = null,
    onOpenQuiz = null
}) {
    const hasScore = quizScore && quizScore.completed;

    const navigateTo = (path) => {
        window.location.hash = path;
    };

    return (
        <div
            style={{
                background: '#161b22',
                border: '1px solid #30363d',
                borderRadius: '12px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
                transition: 'transform 0.2s ease, border-color 0.2s ease',
                position: 'relative'
            }}
            onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.borderColor = '#58a6ff';
            }}
            onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = '#30363d';
            }}
        >
            {/* Preview Canvas Header */}
            <div style={{
                height: '140px',
                background: '#0d1117',
                borderBottom: '1px solid #30363d',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                {chapter.isReady && chapter.previewShader ? (
                    <MiniShaderCanvas fragmentSource={chapter.previewShader} height={140} />
                ) : (
                    <div style={{ color: '#484f58', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>⏳</span> Coming Soon in Roadmap
                    </div>
                )}

                {/* Status Badge */}
                <div style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    fontWeight: '600',
                    background: chapter.isReady ? 'rgba(35, 134, 54, 0.85)' : 'rgba(110, 118, 129, 0.4)',
                    color: '#ffffff',
                    backdropFilter: 'blur(4px)',
                    border: chapter.isReady ? '1px solid #3fb950' : '1px solid #30363d'
                }}>
                    {chapter.isReady ? 'Ready' : 'Planned'}
                </div>

                {/* Quiz Score Badge if completed */}
                {hasScore && (
                    <div style={{
                        position: 'absolute',
                        top: '10px',
                        left: '10px',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: '600',
                        background: quizScore.percent >= 80 ? 'rgba(46, 160, 67, 0.9)' : 'rgba(210, 153, 34, 0.9)',
                        color: '#ffffff',
                        backdropFilter: 'blur(4px)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                    }}>
                        <span>{quizScore.percent >= 80 ? '⭐' : '📝'}</span>
                        <span>Quiz: {quizScore.score}/{quizScore.total} ({quizScore.percent}%)</span>
                    </div>
                )}
            </div>

            {/* Content Section */}
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: '1' }}>
                <div style={{ fontSize: '12px', color: '#8b949e', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {chapter.part}
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#e6edf3', marginBottom: '6px' }}>
                    {chapter.title}
                </h3>
                <h4 style={{ fontSize: '13px', fontWeight: '500', color: '#79c0ff', marginBottom: '12px' }}>
                    {chapter.subtitle}
                </h4>
                <p style={{ fontSize: '13px', color: '#8b949e', lineHeight: '1.5', marginBottom: '16px', flex: '1' }}>
                    {chapter.description}
                </p>

                {/* Concept Tags */}
                {chapter.concepts && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
                        {chapter.concepts.map(concept => (
                            <code key={concept}>{concept}</code>
                        ))}
                    </div>
                )}

                {/* Action Buttons */}
                {chapter.isReady ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <button
                            onClick={() => navigateTo(`#/chapter/${chapter.number}`)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                padding: '10px 16px',
                                background: '#238636',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '8px',
                                fontWeight: '600',
                                fontSize: '13px',
                                cursor: 'pointer',
                                transition: 'background 0.2s ease',
                                boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = '#2ea043'}
                            onMouseLeave={e => e.currentTarget.style.background = '#238636'}
                        >
                            <span>🚀</span> Launch Interactive Playground
                        </button>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            <button
                                onClick={() => onOpenLesson && onOpenLesson(chapter)}
                                style={{
                                    padding: '8px 12px',
                                    background: '#161b22',
                                    color: '#c9d1d9',
                                    border: '1px solid #30363d',
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                    transition: 'background 0.15s ease'
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = '#21262d'}
                                onMouseLeave={e => e.currentTarget.style.background = '#161b22'}
                            >
                                📖 Read Lesson
                            </button>
                            <button
                                onClick={() => onOpenQuiz && onOpenQuiz(chapter)}
                                style={{
                                    padding: '8px 12px',
                                    background: hasScore ? 'rgba(56, 139, 253, 0.15)' : '#161b22',
                                    color: hasScore ? '#58a6ff' : '#c9d1d9',
                                    border: hasScore ? '1px solid rgba(88, 166, 255, 0.4)' : '1px solid #30363d',
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease'
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = '#21262d'}
                                onMouseLeave={e => e.currentTarget.style.background = hasScore ? 'rgba(56, 139, 253, 0.15)' : '#161b22'}
                            >
                                {hasScore ? `🎯 Retake (${quizScore.score}/${quizScore.total})` : '❓ Take Quiz'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div style={{
                        padding: '10px',
                        textAlign: 'center',
                        background: '#161b22',
                        borderRadius: '8px',
                        border: '1px dashed #30363d',
                        color: '#6e7681',
                        fontSize: '12px'
                    }}>
                        Coming soon in curriculum
                    </div>
                )}
            </div>
        </div>
    );
}

window.ChapterCard = ChapterCard;
