/**
 * Reusable GLSL Code Editor Component
 * Line numbered code editor with syntax layout, Tab key indenting, compiler error banners, and clipboard utilities.
 */

function GLSLEditor({
    code,
    onChange,
    error = null,
    onReset = null,
    title = 'GLSL Fragment Shader',
    readOnly = false,
    height = '100%'
}) {
    const [copied, setCopied] = React.useState(false);
    const textareaRef = React.useRef(null);
    const lineNumbersRef = React.useRef(null);

    const lineCount = (code || '').split('\n').length;
    const lineNumbers = Array.from({ length: Math.max(lineCount, 1) }, (_, i) => i + 1);

    // Sync scroll between line numbers and textarea
    const handleScroll = (e) => {
        if (lineNumbersRef.current) {
            lineNumbersRef.current.scrollTop = e.target.scrollTop;
        }
    };

    // Handle Tab key insertion
    const handleKeyDown = (e) => {
        if (e.key === 'Tab' && !readOnly) {
            e.preventDefault();
            const textarea = textareaRef.current;
            if (!textarea) return;

            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const newCode = code.substring(0, start) + '    ' + code.substring(end);
            
            if (onChange) onChange(newCode);

            setTimeout(() => {
                textarea.selectionStart = textarea.selectionEnd = start + 4;
            }, 0);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: height,
            background: '#0d1117',
            border: '1px solid #30363d',
            borderRadius: '10px',
            overflow: 'hidden'
        }}>
            {/* Editor Toolbar */}
            <div style={{
                padding: '10px 16px',
                background: '#161b22',
                borderBottom: '1px solid #30363d',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexShrink: 0
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: error ? '#f85149' : '#3fb950' }}></span>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: '#c9d1d9', fontFamily: 'monospace' }}>
                        {title}
                    </span>
                    {error ? (
                        <span style={{ fontSize: '11px', color: '#f85149', background: 'rgba(248, 81, 73, 0.15)', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(248, 81, 73, 0.3)' }}>
                            Compilation Error
                        </span>
                    ) : (
                        <span style={{ fontSize: '11px', color: '#3fb950', background: 'rgba(46, 160, 67, 0.15)', padding: '2px 8px', borderRadius: '4px' }}>
                            Compiled OK
                        </span>
                    )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {onReset && (
                        <button
                            onClick={onReset}
                            style={{
                                background: '#21262d',
                                border: '1px solid #30363d',
                                color: '#8b949e',
                                borderRadius: '6px',
                                padding: '4px 10px',
                                fontSize: '11px',
                                cursor: 'pointer'
                            }}
                            title="Reset code to preset default"
                        >
                            ↺ Reset
                        </button>
                    )}
                    <button
                        onClick={handleCopy}
                        style={{
                            background: '#21262d',
                            border: '1px solid #30363d',
                            color: copied ? '#3fb950' : '#8b949e',
                            borderRadius: '6px',
                            padding: '4px 10px',
                            fontSize: '11px',
                            cursor: 'pointer'
                        }}
                    >
                        {copied ? '✓ Copied' : '📋 Copy'}
                    </button>
                </div>
            </div>

            {/* Error Message Box */}
            {error && (
                <div style={{
                    padding: '10px 16px',
                    background: 'rgba(248, 81, 73, 0.12)',
                    borderBottom: '1px solid rgba(248, 81, 73, 0.4)',
                    color: '#f85149',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    lineHeight: '1.4',
                    maxHeight: '80px',
                    overflowY: 'auto',
                    flexShrink: 0
                }}>
                    <strong>GLSL Link/Compile Error:</strong> {error}
                </div>
            )}

            {/* Editor Body with Line Numbers */}
            <div style={{
                display: 'flex',
                flex: '1',
                position: 'relative',
                overflow: 'hidden',
                background: '#0d1117'
            }}>
                {/* Line Gutter */}
                <div
                    ref={lineNumbersRef}
                    style={{
                        width: '44px',
                        padding: '14px 6px',
                        background: '#090d13',
                        borderRight: '1px solid #21262d',
                        color: '#484f58',
                        fontFamily: "'SF Mono', 'Fira Code', 'Consolas', monospace",
                        fontSize: '12px',
                        lineHeight: '1.6',
                        textAlign: 'right',
                        userSelect: 'none',
                        overflowY: 'hidden',
                        flexShrink: 0
                    }}
                >
                    {lineNumbers.map(n => (
                        <div key={n}>{n}</div>
                    ))}
                </div>

                {/* Textarea */}
                <textarea
                    ref={textareaRef}
                    value={code}
                    readOnly={readOnly}
                    onChange={e => onChange && onChange(e.target.value)}
                    onScroll={handleScroll}
                    onKeyDown={handleKeyDown}
                    spellCheck={false}
                    style={{
                        flex: '1',
                        padding: '14px 16px',
                        background: 'transparent',
                        color: '#e6edf3',
                        fontFamily: "'SF Mono', 'Fira Code', 'Consolas', monospace",
                        fontSize: '12.5px',
                        lineHeight: '1.6',
                        border: 'none',
                        outline: 'none',
                        resize: 'none',
                        whiteSpace: 'pre',
                        overflowWrap: 'normal',
                        overflowX: 'auto',
                        tabSize: 4
                    }}
                />
            </div>
        </div>
    );
}

window.GLSLEditor = GLSLEditor;
