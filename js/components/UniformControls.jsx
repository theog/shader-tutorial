/**
 * Reusable Uniform / Parameter Controls Component
 * Renders synchronized slider controls with numerical readouts and reset triggers.
 */

function UniformControls({
    paramDefs = [],
    values = {},
    onChange,
    onResetAll = null
}) {
    if (!paramDefs || paramDefs.length === 0) return null;

    return (
        <div style={{
            background: '#161b22',
            border: '1px solid #30363d',
            borderRadius: '10px',
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
        }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid #21262d',
                paddingBottom: '8px'
            }}>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#c9d1d9', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    🎛️ Live Parameter Controls
                </span>
                {onResetAll && (
                    <button
                        onClick={onResetAll}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#58a6ff',
                            fontSize: '11px',
                            cursor: 'pointer'
                        }}
                    >
                        Reset Defaults
                    </button>
                )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {paramDefs.map(p => {
                    const currentVal = values[p.name] !== undefined ? values[p.name] : p.min;
                    return (
                        <div key={p.name} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                                <label style={{ color: '#8b949e', fontFamily: 'monospace' }}>
                                    {p.label || p.name}
                                </label>
                                <span style={{ color: '#58a6ff', fontFamily: 'monospace', fontWeight: '600' }}>
                                    {Number(currentVal).toFixed(2)}
                                </span>
                            </div>
                            <input
                                type="range"
                                min={p.min}
                                max={p.max}
                                step={p.step || 0.01}
                                value={currentVal}
                                onChange={e => onChange && onChange(p.name, parseFloat(e.target.value))}
                                style={{
                                    width: '100%',
                                    accentColor: '#58a6ff',
                                    cursor: 'pointer'
                                }}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

window.UniformControls = UniformControls;
