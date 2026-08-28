/**
 * Reusable Mini Shader Canvas Component
 * Lightweight WebGL preview canvas with automatic visibility detection (pauses when offscreen).
 */

function MiniShaderCanvas({ fragmentSource, height = 140, width = null }) {
    const [isVisible, setIsVisible] = React.useState(false);
    const containerRef = React.useRef(null);

    React.useEffect(() => {
        const el = containerRef.current;
        if (!el || !('IntersectionObserver' in window)) {
            setIsVisible(true);
            return;
        }

        const observer = new IntersectionObserver(([entry]) => {
            setIsVisible(entry.isIntersecting);
        }, { threshold: 0.1 });

        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <div ref={containerRef} style={{ width: width || '100%', height: `${height}px`, position: 'relative', overflow: 'hidden' }}>
            {isVisible ? (
                <WebGLCanvas
                    fragmentSource={fragmentSource}
                    height={`${height}px`}
                    style={{ pointerEvents: 'none' }}
                />
            ) : (
                <div style={{ width: '100%', height: '100%', background: '#090d13' }} />
            )}
        </div>
    );
}

window.MiniShaderCanvas = MiniShaderCanvas;
