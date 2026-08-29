/**
 * Reusable Chapter Card Component
 * Displays animated shader previews, status badges, quiz progress, lesson read status, mastery progress bar, concept tags, and launch buttons.
 */

function ChapterCard({
    chapter,
    quizScore = null,
    quizProgress = null,
    isLessonRead = false,
    onOpenLesson = null,
    onOpenQuiz = null
}) {
    const isQuizDone = !!(quizScore && quizScore.completed);
    const isQuizInProgress = !isQuizDone && quizProgress && quizProgress.hasStarted && quizProgress.answeredCount > 0;

    // Calculate Chapter Progress: Lesson (50%) + Quiz (50%)
    let masteryPercent = 0;
    if (isLessonRead) masteryPercent += 50;
    if (isQuizDone) masteryPercent += 50;

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

                {/* Left Badges Group: Lesson Read & Quiz Progress */}
                <div style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                }}>
                    {/* Lesson Read Badge */}
                    {isLessonRead && (
                        <div style={{
                            padding: '3px 8px',
                            borderRadius: '20px',
                            fontSize: '10.5px',
                            fontWeight: '600',
                            background: 'rgba(35, 134, 54, 0.9)',
                            color: '#ffffff',
                            backdropFilter: 'blur(4px)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            width: 'fit-content'
                        }}>
                            <span>📖</span>
                            <span>Lesson Read</span>
                        </div>
                    )}

                    {/* Quiz Completed Badge */}
                    {isQuizDone && (
                        <div style={{
                            padding: '3px 8px',
                            borderRadius: '20px',
                            fontSize: '10.5px',
                            fontWeight: '600',
                            background: quizScore.percent >= 80 ? 'rgba(46, 160, 67, 0.9)' : 'rgba(210, 153, 34, 0.9)',
                            color: '#ffffff',
                            backdropFilter: 'blur(4px)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            width: 'fit-content'
                        }}>
                            <span>{quizScore.percent >= 80 ? '⭐' : '📝'}</span>
                            <span>Quiz: {quizScore.score}/{quizScore.total}</span>
                        </div>
                    )}

                    {/* Quiz In-Progress Badge */}
                    {isQuizInProgress && (
                        <div style={{
                            padding: '3px 8px',
                            borderRadius: '20px',
                            fontSize: '10.5px',
                            fontWeight: '600',
                            background: 'rgba(56, 139, 253, 0.9)',
                            color: '#ffffff',
                            backdropFilter: 'blur(4px)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            width: 'fit-content'
                        }}>
                            <span>📝</span>
                            <span>Quiz: {quizProgress.answeredCount}/{quizProgress.total} In Progress</span>
                        </div>
                    )}
                </div>
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
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                        {chapter.concepts.map(concept => (
                            <code key={concept}>{concept}</code>
                        ))}
                    </div>
                )}

                {/* Chapter Mastery Progress Bar (if started) */}
                {chapter.isReady && (masteryPercent > 0 || isQuizInProgress) && (
                    <div style={{ marginBottom: '16px', background: '#0d1117', padding: '10px 12px', borderRadius: '8px', border: '1px solid #21262d' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#8b949e', marginBottom: '6px' }}>
                            <span>Chapter Mastery</span>
                            <span style={{ fontWeight: '700', color: masteryPercent === 100 ? '#3fb950' : '#58a6ff' }}>
                                {masteryPercent === 100 ? '100% Mastered ✓' : `${masteryPercent}% Complete`}
                            </span>
                        </div>
                        <div style={{ height: '5px', background: '#21262d', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{
                                width: `${masteryPercent}%`,
                                height: '100%',
                                background: masteryPercent === 100 ? '#3fb950' : 'linear-gradient(90deg, #58a6ff, #3fb950)',
                                transition: 'width 0.3s ease'
                            }}></div>
                        </div>
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
                                    background: isLessonRead ? 'rgba(46, 160, 67, 0.15)' : '#161b22',
                                    color: isLessonRead ? '#3fb950' : '#c9d1d9',
                                    border: isLessonRead ? '1px solid rgba(63, 185, 80, 0.5)' : '1px solid #30363d',
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease'
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = '#21262d'}
                                onMouseLeave={e => e.currentTarget.style.background = isLessonRead ? 'rgba(46, 160, 67, 0.15)' : '#161b22'}
                            >
                                {isLessonRead ? '✓ Lesson Read' : '📖 Read Lesson'}
                            </button>
                            <button
                                onClick={() => onOpenQuiz && onOpenQuiz(chapter)}
                                style={{
                                    padding: '8px 12px',
                                    background: isQuizDone ? 'rgba(56, 139, 253, 0.15)' : isQuizInProgress ? 'rgba(227, 179, 65, 0.15)' : '#161b22',
                                    color: isQuizDone ? '#58a6ff' : isQuizInProgress ? '#d29922' : '#c9d1d9',
                                    border: isQuizDone ? '1px solid rgba(88, 166, 255, 0.4)' : isQuizInProgress ? '1px solid rgba(227, 179, 65, 0.4)' : '1px solid #30363d',
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease'
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = '#21262d'}
                                onMouseLeave={e => e.currentTarget.style.background = isQuizDone ? 'rgba(56, 139, 253, 0.15)' : isQuizInProgress ? 'rgba(227, 179, 65, 0.15)' : '#161b22'}
                            >
                                {isQuizDone
                                    ? `🎯 Retake (${quizScore.score}/${quizScore.total})`
                                    : isQuizInProgress
                                    ? `▶ Resume (${quizProgress.answeredCount}/${quizProgress.total})`
                                    : '❓ Take Quiz'}
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
