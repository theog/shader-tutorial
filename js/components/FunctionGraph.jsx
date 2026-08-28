/**
 * Reusable 1D Function Graph Plotter Component
 * Renders continuous mathematical transfer curves (y = f(x)) side-by-side with 2D WebGL shaders.
 */

function FunctionGraph({
    fn,
    params = {},
    title = '1D Transfer Function: y = f(x)',
    color = '#58a6ff',
    height = 240
}) {
    const canvasRef = React.useRef(null);
    const [hoverPos, setHoverPos] = React.useState(null);

    React.useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !fn) return;

        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();

        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        const w = rect.width;
        const h = rect.height;
        const pad = 36;
        const plotW = w - pad * 2;
        const plotH = h - pad * 2;

        // Clear background
        ctx.fillStyle = '#090d13';
        ctx.fillRect(0, 0, w, h);

        // Draw Grid Lines & Axes
        ctx.strokeStyle = '#21262d';
        ctx.lineWidth = 1;

        // Horizontal grid lines (0.0, 0.25, 0.5, 0.75, 1.0)
        for (let i = 0; i <= 4; i++) {
            const val = i / 4;
            const y = pad + plotH * (1 - val);
            ctx.beginPath();
            ctx.moveTo(pad, y);
            ctx.lineTo(pad + plotW, y);
            ctx.stroke();

            // Label
            ctx.fillStyle = '#484f58';
            ctx.font = '10px monospace';
            ctx.textAlign = 'right';
            ctx.fillText(val.toFixed(2), pad - 6, y + 3);
        }

        // Vertical grid lines
        for (let i = 0; i <= 4; i++) {
            const val = i / 4;
            const x = pad + plotW * val;
            ctx.beginPath();
            ctx.moveTo(x, pad);
            ctx.lineTo(x, pad + plotH);
            ctx.stroke();

            // Label
            ctx.fillStyle = '#484f58';
            ctx.font = '10px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(val.toFixed(2), x, pad + plotH + 14);
        }

        // Linear Reference Diagonal: y = x (dashed)
        ctx.strokeStyle = '#30363d';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(pad, pad + plotH);
        ctx.lineTo(pad + plotW, pad);
        ctx.stroke();
        ctx.setLineDash([]);

        // Plot Function Curve
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.5;
        ctx.beginPath();

        const steps = 200;
        for (let i = 0; i <= steps; i++) {
            const normalizedX = i / steps;
            let normalizedY = 0;
            try {
                normalizedY = fn(normalizedX, params);
            } catch (e) {
                normalizedY = 0;
            }

            // Clamp plotted Y to canvas box visually
            const clampedY = Math.max(-0.1, Math.min(1.1, normalizedY));
            const px = pad + plotW * normalizedX;
            const py = pad + plotH * (1 - clampedY);

            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.stroke();

        // Hover inspection point
        if (hoverPos !== null && hoverPos >= 0 && hoverPos <= 1) {
            let hy = 0;
            try {
                hy = fn(hoverPos, params);
            } catch (e) {
                hy = 0;
            }

            const hxPix = pad + plotW * hoverPos;
            const hyPix = pad + plotH * (1 - Math.max(0, Math.min(1, hy)));

            // Draw crosshairs
            ctx.strokeStyle = 'rgba(88, 166, 255, 0.4)';
            ctx.setLineDash([2, 2]);
            ctx.beginPath();
            ctx.moveTo(hxPix, pad);
            ctx.lineTo(hxPix, pad + plotH);
            ctx.moveTo(pad, hyPix);
            ctx.lineTo(pad + plotW, hyPix);
            ctx.stroke();
            ctx.setLineDash([]);

            // Draw glowing dot
            ctx.fillStyle = '#58a6ff';
            ctx.beginPath();
            ctx.arc(hxPix, hyPix, 5, 0, Math.PI * 2);
            ctx.fill();

            // Coordinate tooltip text
            ctx.fillStyle = '#ffffff';
            ctx.font = '11px monospace';
            ctx.textAlign = hoverPos > 0.5 ? 'right' : 'left';
            ctx.fillText(`x: ${hoverPos.toFixed(3)}, y: ${hy.toFixed(3)}`, hoverPos > 0.5 ? hxPix - 8 : hxPix + 8, hyPix - 8);
        }
    }, [fn, params, color, hoverPos]);

    const handleMouseMove = (e) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const pad = 36;
        const plotW = rect.width - pad * 2;
        const x = (e.clientX - rect.left - pad) / plotW;
        if (x >= 0 && x <= 1) setHoverPos(x);
        else setHoverPos(null);
    };

    return (
        <div style={{
            background: '#0d1117',
            border: '1px solid #30363d',
            borderRadius: '10px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <div style={{
                padding: '8px 14px',
                background: '#161b22',
                borderBottom: '1px solid #30363d',
                fontSize: '12px',
                fontWeight: '600',
                color: '#c9d1d9',
                display: 'flex',
                justifyContent: 'space-between'
            }}>
                <span>📈 {title}</span>
                <span style={{ color: '#8b949e', fontSize: '11px' }}>Domain: [0, 1] → Range: [0, 1]</span>
            </div>
            <canvas
                ref={canvasRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={() => setHoverPos(null)}
                style={{ width: '100%', height: `${height}px`, display: 'block', cursor: 'crosshair' }}
            />
        </div>
    );
}

window.FunctionGraph = FunctionGraph;
