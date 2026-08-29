/**
 * Reusable Markdown Lesson & Syllabus Reader Component
 * Renders rich formatted documentation, auto-detects scroll completion, and tracks read state in localStorage.
 */

function MarkdownReader({
    title,
    subtitle = null,
    chapterNum = null,
    filePath = null,
    content = null,
    onClose = null,
    onLessonCompleted = null,
    initialCompleted = false,
    isModal = true
}) {
    const [markdown, setMarkdown] = React.useState(content || '');
    const [loading, setLoading] = React.useState(!content && !!filePath);
    const [error, setError] = React.useState(null);
    const [isCompleted, setIsCompleted] = React.useState(() => {
        if (initialCompleted) return true;
        if (chapterNum && typeof getCompletedLessons === 'function') {
            return !!getCompletedLessons()[chapterNum];
        }
        return false;
    });

    const scrollContainerRef = React.useRef(null);

    // Fetch markdown content
    React.useEffect(() => {
        if (content) {
            setMarkdown(content);
            setLoading(false);
            return;
        }

        if (filePath) {
            setLoading(true);
            setError(null);
            fetch(filePath)
                .then(res => {
                    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to load ${filePath}`);
                    return res.text();
                })
                .then(text => {
                    setMarkdown(text);
                    setLoading(false);
                })
                .catch(err => {
                    setError(err.message);
                    setLoading(false);
                });
        }
    }, [filePath, content]);

    // Handle scroll to bottom detection
    const handleScroll = (e) => {
        if (!chapterNum || isCompleted) return;
        const target = e.target;
        const scrollBottom = target.scrollHeight - target.scrollTop - target.clientHeight;

        // If scrolled within 60px of the bottom
        if (scrollBottom < 60) {
            markCompleted(true);
        }
    };

    const markCompleted = (completedStatus) => {
        setIsCompleted(completedStatus);
        if (chapterNum && typeof saveLessonCompletedToStorage === 'function') {
            saveLessonCompletedToStorage(chapterNum, completedStatus);
        }
        if (onLessonCompleted && chapterNum) {
            onLessonCompleted(chapterNum, completedStatus);
        }
    };

    const renderedHTML = React.useMemo(() => {
        if (!markdown) return '';
        if (window.marked) {
            return window.marked.parse(markdown);
        }
        return `<pre>${markdown}</pre>`;
    }, [markdown]);

    const bodyContent = (
        <div style={{
            background: '#0d1117',
            border: '1px solid #30363d',
            borderRadius: '12px',
            width: '100%',
            maxWidth: isModal ? '900px' : '960px',
            maxHeight: isModal ? '90vh' : 'none',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
            overflow: 'hidden',
            margin: isModal ? '0' : '24px auto'
        }} onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div style={{
                padding: '16px 24px',
                borderBottom: '1px solid #30363d',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#161b22'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <h2 style={{ fontSize: '18px', color: '#58a6ff', marginBottom: '2px' }}>{title}</h2>
                            {isCompleted && (
                                <span style={{
                                    fontSize: '11px',
                                    fontWeight: '600',
                                    padding: '2px 8px',
                                    borderRadius: '12px',
                                    background: 'rgba(46, 160, 67, 0.2)',
                                    color: '#3fb950',
                                    border: '1px solid #3fb950'
                                }}>
                                    ✓ Lesson Read
                                </span>
                            )}
                        </div>
                        {subtitle && <p style={{ fontSize: '12px', color: '#8b949e' }}>{subtitle}</p>}
                    </div>
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        style={{
                            background: '#21262d',
                            border: '1px solid #30363d',
                            color: '#c9d1d9',
                            borderRadius: '6px',
                            padding: '6px 12px',
                            fontSize: '13px',
                            cursor: 'pointer'
                        }}
                    >
                        ✕ Close
                    </button>
                )}
            </div>

            {/* Scrollable Lesson Body */}
            <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                style={{
                    padding: '24px 32px',
                    overflowY: 'auto',
                    lineHeight: '1.7',
                    fontSize: '14px',
                    color: '#c9d1d9'
                }}
            >
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: '#8b949e' }}>
                        Loading document...
                    </div>
                ) : error ? (
                    <div style={{ padding: '20px', background: 'rgba(248, 81, 73, 0.15)', border: '1px solid #f85149', borderRadius: '8px', color: '#f85149' }}>
                        <strong>Error loading document:</strong> {error}
                    </div>
                ) : (
                    <>
                        <div
                            dangerouslySetInnerHTML={{ __html: renderedHTML }}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '12px'
                            }}
                        />

                        {/* Bottom Completion Card for Chapters */}
                        {chapterNum && (
                            <div style={{
                                marginTop: '40px',
                                padding: '20px 24px',
                                background: isCompleted ? 'rgba(46, 160, 67, 0.12)' : '#161b22',
                                border: `1px solid ${isCompleted ? '#3fb950' : '#30363d'}`,
                                borderRadius: '12px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                gap: '16px',
                                transition: 'all 0.2s ease'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        background: isCompleted ? '#238636' : '#21262d',
                                        border: `1px solid ${isCompleted ? '#3fb950' : '#30363d'}`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '20px'
                                    }}>
                                        {isCompleted ? '✓' : '📖'}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '15px', fontWeight: '700', color: isCompleted ? '#3fb950' : '#e6edf3', marginBottom: '2px' }}>
                                            {isCompleted ? 'Chapter Lesson Completed!' : 'Finished Reading This Lesson?'}
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#8b949e' }}>
                                            {isCompleted
                                                ? 'Marked as read! Your progress is saved on the main index.'
                                                : 'Scroll to the bottom or click the button to mark this lesson as completed.'}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <button
                                        onClick={() => markCompleted(!isCompleted)}
                                        style={{
                                            padding: '9px 18px',
                                            background: isCompleted ? '#238636' : '#21262d',
                                            color: '#ffffff',
                                            border: `1px solid ${isCompleted ? '#3fb950' : '#30363d'}`,
                                            borderRadius: '8px',
                                            fontSize: '13px',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            transition: 'all 0.15s ease'
                                        }}
                                    >
                                        <span>{isCompleted ? '✓ Marked as Read' : 'Mark as Read'}</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );

    if (isModal) {
        return (
            <div style={{
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.85)',
                backdropFilter: 'blur(8px)',
                zIndex: 1000,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '20px'
            }} onClick={onClose}>
                {bodyContent}
            </div>
        );
    }

    return bodyContent;
}

window.MarkdownReader = MarkdownReader;
