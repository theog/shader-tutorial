/**
 * Reusable Chapter Navigation Header Component
 * Sticky top navigation bar with full 18-chapter switcher, prev/next arrows, lesson/quiz triggers, and hub returns.
 */

function ChapterNavbar({
    chapter,
    onOpenLesson = null,
    onOpenQuiz = null,
    quizScore = null,
    isLessonRead = false
}) {
    const [dropdownOpen, setDropdownOpen] = React.useState(false);
    const navRef = React.useRef(null);

    const currentNum = parseInt(chapter?.number || '1', 10);
    const prevChapter = CHAPTERS_REGISTRY.find(c => parseInt(c.number, 10) === currentNum - 1);
    const nextChapter = CHAPTERS_REGISTRY.find(c => parseInt(c.number, 10) === currentNum + 1);

    // Close dropdown on outside click
    React.useEffect(() => {
        const handleClickOutside = (e) => {
            if (navRef.current && !navRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const navigateTo = (path) => {
        window.location.hash = path;
        setDropdownOpen(false);
    };

    return (
        <header
            ref={navRef}
            style={{
                background: '#161b22',
                borderBottom: '1px solid #30363d',
                padding: '12px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
                position: 'sticky',
                top: 0,
                zIndex: 900
            }}
        >
            {/* Left: Home & Chapter Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <button
                    onClick={() => navigateTo('#/')}
                    style={{
                        background: '#21262d',
                        border: '1px solid #30363d',
                        color: '#c9d1d9',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}
                >
                    <span>🏠</span> All Chapters
                </button>

                {/* Chapter Title & Selector */}
                <div style={{ position: 'relative' }}>
                    <button
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        style={{
                            background: '#0d1117',
                            border: '1px solid #30363d',
                            color: '#e6edf3',
                            padding: '6px 14px',
                            borderRadius: '6px',
                            fontSize: '13px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <span style={{ color: '#58a6ff' }}>Chapter {chapter?.number}:</span>
                        <span>{chapter?.title}</span>
                        <span style={{ fontSize: '10px', color: '#8b949e' }}>▼</span>
                    </button>

                    {/* Dropdown Menu */}
                    {dropdownOpen && (
                        <div style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            marginTop: '6px',
                            background: '#161b22',
                            border: '1px solid #30363d',
                            borderRadius: '8px',
                            boxShadow: '0 12px 28px rgba(0,0,0,0.6)',
                            width: '320px',
                            maxHeight: '400px',
                            overflowY: 'auto',
                            zIndex: 1000,
                            padding: '6px'
                        }}>
                            <div style={{ padding: '6px 10px', fontSize: '11px', fontWeight: '700', color: '#8b949e', textTransform: 'uppercase' }}>
                                Jump to Chapter:
                            </div>
                            {CHAPTERS_REGISTRY.map(c => {
                                const isCurrent = c.number === chapter?.number;
                                return (
                                    <button
                                        key={c.number}
                                        disabled={!c.isReady}
                                        onClick={() => c.isReady && navigateTo(`#/chapter/${c.number}`)}
                                        style={{
                                            width: '100%',
                                            textAlign: 'left',
                                            padding: '8px 10px',
                                            borderRadius: '6px',
                                            border: 'none',
                                            background: isCurrent ? '#1f3a5f' : 'transparent',
                                            color: isCurrent ? '#58a6ff' : c.isReady ? '#c9d1d9' : '#484f58',
                                            fontSize: '12.5px',
                                            cursor: c.isReady ? 'pointer' : 'not-allowed',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}
                                    >
                                        <span><strong>Ch {c.number}:</strong> {c.title}</span>
                                        <span style={{ fontSize: '11px' }}>
                                            {isCurrent ? '●' : c.isReady ? '🎮' : '🔒'}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Right: Actions & Prev/Next Arrows */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {onOpenLesson && (
                    <button
                        onClick={onOpenLesson}
                        style={{
                            background: isLessonRead ? 'rgba(46, 160, 67, 0.15)' : '#21262d',
                            border: isLessonRead ? '1px solid #3fb950' : '1px solid #30363d',
                            color: isLessonRead ? '#3fb950' : '#c9d1d9',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                    >
                        <span>{isLessonRead ? '✓' : '📖'}</span>
                        <span>{isLessonRead ? 'Lesson Read' : 'Lesson'}</span>
                    </button>
                )}

                {onOpenQuiz && (
                    <button
                        onClick={onOpenQuiz}
                        style={{
                            background: quizScore?.completed ? 'rgba(46, 160, 67, 0.15)' : '#21262d',
                            border: quizScore?.completed ? '1px solid #3fb950' : '1px solid #30363d',
                            color: quizScore?.completed ? '#3fb950' : '#c9d1d9',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                    >
                        <span>{quizScore?.completed ? '⭐' : '❓'}</span>
                        <span>{quizScore?.completed ? `Quiz (${quizScore.score}/${quizScore.total})` : 'Quiz'}</span>
                    </button>
                )}

                <div style={{ width: '1px', height: '24px', background: '#30363d' }}></div>

                {/* Prev Chapter */}
                <button
                    disabled={!prevChapter || !prevChapter.isReady}
                    onClick={() => prevChapter?.isReady && navigateTo(`#/chapter/${prevChapter.number}`)}
                    style={{
                        background: '#21262d',
                        border: '1px solid #30363d',
                        color: prevChapter?.isReady ? '#c9d1d9' : '#484f58',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        cursor: prevChapter?.isReady ? 'pointer' : 'not-allowed'
                    }}
                    title={prevChapter ? `Previous: Chapter ${prevChapter.number}` : 'First chapter'}
                >
                    ◀ Prev
                </button>

                {/* Next Chapter */}
                <button
                    disabled={!nextChapter || !nextChapter.isReady}
                    onClick={() => nextChapter?.isReady && navigateTo(`#/chapter/${nextChapter.number}`)}
                    style={{
                        background: '#21262d',
                        border: '1px solid #30363d',
                        color: nextChapter?.isReady ? '#c9d1d9' : '#484f58',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        cursor: nextChapter?.isReady ? 'pointer' : 'not-allowed'
                    }}
                    title={nextChapter ? `Next: Chapter ${nextChapter.number}` : 'Last ready chapter'}
                >
                    Next ▶
                </button>
            </div>
        </header>
    );
}

window.ChapterNavbar = ChapterNavbar;
