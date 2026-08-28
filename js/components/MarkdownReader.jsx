/**
 * Reusable Markdown Lesson & Syllabus Reader Component
 * Renders rich formatted documentation with loading states and copyable code blocks.
 */

function MarkdownReader({
    title,
    subtitle = null,
    filePath = null,
    content = null,
    onClose = null,
    isModal = true
}) {
    const [markdown, setMarkdown] = React.useState(content || '');
    const [loading, setLoading] = React.useState(!content && !!filePath);
    const [error, setError] = React.useState(null);

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
                <div>
                    <h2 style={{ fontSize: '18px', color: '#58a6ff', marginBottom: '2px' }}>{title}</h2>
                    {subtitle && <p style={{ fontSize: '12px', color: '#8b949e' }}>{subtitle}</p>}
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

            {/* Body */}
            <div style={{
                padding: '24px 32px',
                overflowY: 'auto',
                lineHeight: '1.7',
                fontSize: '14px',
                color: '#c9d1d9'
            }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: '#8b949e' }}>
                        Loading document...
                    </div>
                ) : error ? (
                    <div style={{ padding: '20px', background: 'rgba(248, 81, 73, 0.15)', border: '1px solid #f85149', borderRadius: '8px', color: '#f85149' }}>
                        <strong>Error loading document:</strong> {error}
                    </div>
                ) : (
                    <div
                        dangerouslySetInnerHTML={{ __html: renderedHTML }}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px'
                        }}
                    />
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
