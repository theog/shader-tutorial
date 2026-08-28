/**
 * Reusable Interactive Quiz Runner Component
 * Step-by-step quiz engine with interactive choice cards, code challenges, explanations, and localStorage persistence.
 */

function QuizRunner({
    chapterNum,
    onClose = null,
    onScoreUpdated = null,
    isModal = false
}) {
    const quizData = (typeof QUIZ_DATABASE !== 'undefined') ? QUIZ_DATABASE[chapterNum] : null;

    if (!quizData) {
        return (
            <div style={{
                padding: '40px 20px',
                textAlign: 'center',
                color: '#c9d1d9',
                background: '#0d1117',
                borderRadius: '12px',
                border: '1px solid #30363d',
                maxWidth: '600px',
                margin: '40px auto'
            }}>
                <h3 style={{ color: '#58a6ff', marginBottom: '12px' }}>Quiz Preparing...</h3>
                <p style={{ color: '#8b949e', marginBottom: '24px' }}>The interactive quiz for Chapter {chapterNum} is in development.</p>
                {onClose && (
                    <button onClick={onClose} style={{
                        background: '#21262d', border: '1px solid #30363d', color: '#fff',
                        padding: '8px 16px', borderRadius: '6px', cursor: 'pointer'
                    }}>Close</button>
                )}
            </div>
        );
    }

    const questions = quizData.questions || [];
    const totalQuestions = questions.length;

    const [currentIdx, setCurrentIdx] = React.useState(0);
    const [answers, setAnswers] = React.useState(() => {
        const saved = (typeof getSavedQuizProgress === 'function') ? getSavedQuizProgress(chapterNum) : null;
        return saved?.answers || {};
    });
    const [hintRevealed, setHintRevealed] = React.useState({});
    const [solutionRevealed, setSolutionRevealed] = React.useState({});
    const [showSummary, setShowSummary] = React.useState(false);

    // Save in-progress answers to localStorage
    React.useEffect(() => {
        if (typeof saveQuizProgressToStorage === 'function') {
            saveQuizProgressToStorage(chapterNum, { answers, currentIdx });
        }
    }, [answers, currentIdx, chapterNum]);

    const currentQ = questions[currentIdx];
    const currentAnswer = answers[currentQ.id];
    const isAnswered = currentAnswer !== undefined;

    const handleSelectOption = (idx) => {
        setAnswers(prev => ({ ...prev, [currentQ.id]: idx }));
    };

    const handleToggleTrueFalse = (val) => {
        setAnswers(prev => ({ ...prev, [currentQ.id]: val }));
    };

    const handleRevealSolution = () => {
        setSolutionRevealed(prev => ({ ...prev, [currentQ.id]: true }));
        setAnswers(prev => ({ ...prev, [currentQ.id]: 'completed_challenge' }));
    };

    const calculateResults = () => {
        let correct = 0;
        questions.forEach(q => {
            const ans = answers[q.id];
            if (q.type === 'multiple_choice' && ans === q.correctIndex) correct++;
            else if (q.type === 'true_false' && ans === q.correctValue) correct++;
            else if (q.type === 'code_challenge' && (ans === 'completed_challenge' || ans !== undefined)) correct++;
        });
        return {
            score: correct,
            total: totalQuestions,
            percent: Math.round((correct / totalQuestions) * 100)
        };
    };

    const handleFinish = () => {
        const res = calculateResults();
        if (typeof saveQuizScoreToStorage === 'function') {
            saveQuizScoreToStorage(chapterNum, {
                score: res.score,
                total: res.total,
                percent: res.percent,
                completed: true
            });
        }
        if (onScoreUpdated) onScoreUpdated();
        setShowSummary(true);
    };

    const handleRetake = () => {
        if (typeof clearQuizProgressFromStorage === 'function') {
            clearQuizProgressFromStorage(chapterNum);
        }
        setAnswers({});
        setHintRevealed({});
        setSolutionRevealed({});
        setCurrentIdx(0);
        setShowSummary(false);
    };

    const results = calculateResults();
    const answeredCount = Object.keys(answers).length;

    const content = (
        <div style={{
            background: '#0d1117',
            border: '1px solid #30363d',
            borderRadius: '14px',
            width: '100%',
            maxWidth: isModal ? '840px' : '900px',
            maxHeight: isModal ? '92vh' : 'none',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 24px 48px rgba(0,0,0,0.7)',
            overflow: 'hidden',
            margin: isModal ? '0' : '20px auto'
        }} onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div style={{
                padding: '16px 24px',
                background: '#161b22',
                borderBottom: '1px solid #30363d',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div>
                    <div style={{ fontSize: '11px', color: '#58a6ff', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {quizData.part} • Chapter {quizData.chapterNum}
                    </div>
                    <h2 style={{ fontSize: '18px', color: '#e6edf3', fontWeight: '700', marginTop: '2px' }}>
                        {quizData.title} — Quiz
                    </h2>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '12px', color: '#8b949e', background: '#21262d', padding: '4px 10px', borderRadius: '20px', border: '1px solid #30363d' }}>
                        {answeredCount} of {totalQuestions} Answered
                    </span>
                    {onClose && (
                        <button onClick={onClose} style={{
                            background: '#21262d', border: '1px solid #30363d', color: '#c9d1d9',
                            borderRadius: '6px', padding: '6px 12px', fontSize: '12px', cursor: 'pointer'
                        }}>
                            ✕ Close
                        </button>
                    )}
                </div>
            </div>

            {/* Top Progress Bar */}
            <div style={{ width: '100%', height: '4px', background: '#21262d' }}>
                <div style={{
                    width: showSummary ? '100%' : `${((currentIdx + 1) / totalQuestions) * 100}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #58a6ff, #3fb950)',
                    transition: 'width 0.3s ease'
                }}></div>
            </div>

            {/* Body View */}
            {!showSummary ? (
                <div style={{ display: 'flex', flexDirection: 'column', flex: '1', overflowY: 'auto' }}>
                    {/* Step Pills Navigation */}
                    <div style={{
                        display: 'flex', gap: '8px', padding: '16px 24px 8px',
                        borderBottom: '1px solid #21262d', overflowX: 'auto', flexShrink: 0
                    }}>
                        {questions.map((item, idx) => {
                            const ans = answers[item.id];
                            let isRight = false;
                            if (item.type === 'multiple_choice') isRight = ans === item.correctIndex;
                            if (item.type === 'true_false') isRight = ans === item.correctValue;
                            if (item.type === 'code_challenge') isRight = ans !== undefined;

                            const isActive = currentIdx === idx;
                            const isDone = ans !== undefined;

                            let pillBg = '#161b22';
                            let pillBorder = '#30363d';
                            let pillColor = '#8b949e';

                            if (isActive) {
                                pillBg = '#1f3a5f';
                                pillBorder = '#58a6ff';
                                pillColor = '#58a6ff';
                            } else if (isDone) {
                                if (item.type === 'code_challenge') {
                                    pillBg = 'rgba(163, 113, 247, 0.15)';
                                    pillBorder = '#a371f7';
                                    pillColor = '#d2a8ff';
                                } else if (isRight) {
                                    pillBg = 'rgba(46, 160, 67, 0.15)';
                                    pillBorder = '#3fb950';
                                    pillColor = '#3fb950';
                                } else {
                                    pillBg = 'rgba(248, 81, 73, 0.15)';
                                    pillBorder = '#f85149';
                                    pillColor = '#f85149';
                                }
                            }

                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setCurrentIdx(idx)}
                                    style={{
                                        padding: '6px 12px',
                                        borderRadius: '6px',
                                        border: `1px solid ${pillBorder}`,
                                        background: pillBg,
                                        color: pillColor,
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        transition: 'all 0.15s ease'
                                    }}
                                >
                                    <span>Q{idx + 1}</span>
                                    {isDone && (
                                        <span>{item.type === 'code_challenge' ? '💻' : isRight ? '✓' : '✕'}</span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Active Question Card */}
                    <div style={{ padding: '24px', flex: '1', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                            <span style={{
                                padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600',
                                background: currentQ.type === 'code_challenge' ? '#38235d' : '#1f3a5f',
                                color: currentQ.type === 'code_challenge' ? '#d2a8ff' : '#79c0ff'
                            }}>
                                {currentQ.type === 'multiple_choice' ? 'Multiple Choice' : currentQ.type === 'true_false' ? 'True / False' : 'Code Challenge'}
                            </span>
                            <span style={{ fontSize: '13px', color: '#8b949e' }}>
                                Question {currentIdx + 1} of {totalQuestions}
                            </span>
                        </div>

                        <h3 style={{ fontSize: '18px', color: '#e6edf3', lineHeight: '1.5', marginBottom: '20px' }}>
                            {currentQ.question}
                        </h3>

                        {/* Multiple Choice */}
                        {currentQ.type === 'multiple_choice' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {currentQ.options.map((opt, optIdx) => {
                                    const isSelected = currentAnswer === optIdx;
                                    const isCorrectOpt = optIdx === currentQ.correctIndex;

                                    let optBg = '#161b22';
                                    let optBorder = '#30363d';
                                    let optColor = '#c9d1d9';
                                    let icon = null;

                                    if (isAnswered) {
                                        if (isSelected) {
                                            if (isCorrectOpt) {
                                                optBg = 'rgba(46, 160, 67, 0.2)';
                                                optBorder = '#3fb950';
                                                optColor = '#3fb950';
                                                icon = '✓';
                                            } else {
                                                optBg = 'rgba(248, 81, 73, 0.2)';
                                                optBorder = '#f85149';
                                                optColor = '#f85149';
                                                icon = '✕';
                                            }
                                        } else if (isCorrectOpt) {
                                            optBg = 'rgba(46, 160, 67, 0.1)';
                                            optBorder = 'rgba(63, 185, 80, 0.6)';
                                            optColor = '#3fb950';
                                            icon = '✓';
                                        }
                                    }

                                    return (
                                        <button
                                            key={optIdx}
                                            onClick={() => handleSelectOption(optIdx)}
                                            style={{
                                                padding: '14px 18px',
                                                borderRadius: '8px',
                                                border: `1px solid ${optBorder}`,
                                                background: optBg,
                                                color: optColor,
                                                textAlign: 'left',
                                                fontSize: '14px',
                                                lineHeight: '1.4',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                transition: 'all 0.15s ease'
                                            }}
                                        >
                                            <span>{opt}</span>
                                            {icon && <strong style={{ fontSize: '16px' }}>{icon}</strong>}
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {/* True / False */}
                        {currentQ.type === 'true_false' && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                {[true, false].map(val => {
                                    const isSelected = currentAnswer === val;
                                    const isCorrectVal = val === currentQ.correctValue;

                                    let btnBg = '#161b22';
                                    let btnBorder = '#30363d';
                                    let btnColor = '#c9d1d9';

                                    if (isAnswered) {
                                        if (isSelected) {
                                            btnBg = isCorrectVal ? 'rgba(46, 160, 67, 0.2)' : 'rgba(248, 81, 73, 0.2)';
                                            btnBorder = isCorrectVal ? '#3fb950' : '#f85149';
                                            btnColor = isCorrectVal ? '#3fb950' : '#f85149';
                                        } else if (isCorrectVal) {
                                            btnBg = 'rgba(46, 160, 67, 0.1)';
                                            btnBorder = 'rgba(63, 185, 80, 0.6)';
                                            btnColor = '#3fb950';
                                        }
                                    }

                                    return (
                                        <button
                                            key={String(val)}
                                            onClick={() => handleToggleTrueFalse(val)}
                                            style={{
                                                padding: '20px',
                                                borderRadius: '8px',
                                                border: `1px solid ${btnBorder}`,
                                                background: btnBg,
                                                color: btnColor,
                                                fontSize: '16px',
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                gap: '6px',
                                                transition: 'all 0.15s ease'
                                            }}
                                        >
                                            <span>{val ? '✓ True' : '✕ False'}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {/* Code Challenge */}
                        {currentQ.type === 'code_challenge' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                <div style={{ background: '#161b22', padding: '12px 16px', borderRadius: '8px', border: '1px solid #30363d' }}>
                                    <div style={{ fontSize: '11px', color: '#8b949e', marginBottom: '4px', textTransform: 'uppercase' }}>Starter Template:</div>
                                    <pre style={{ margin: 0, fontFamily: 'monospace', fontSize: '12px', color: '#79c0ff', lineHeight: '1.5' }}>
                                        <code>{currentQ.starterCode}</code>
                                    </pre>
                                </div>

                                {currentQ.hint && (
                                    <div>
                                        <button
                                            onClick={() => setHintRevealed(prev => ({ ...prev, [currentQ.id]: !prev[currentQ.id] }))}
                                            style={{
                                                background: 'transparent', border: 'none', color: '#e3b341', fontSize: '13px',
                                                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: 0
                                            }}
                                        >
                                            <span>💡</span> {hintRevealed[currentQ.id] ? 'Hide Hint' : 'Show Hint'}
                                        </button>
                                        {hintRevealed[currentQ.id] && (
                                            <div style={{ marginTop: '8px', padding: '10px 14px', background: 'rgba(227, 179, 65, 0.1)', border: '1px solid rgba(227, 179, 65, 0.3)', borderRadius: '6px', fontSize: '13px', color: '#d29922' }}>
                                                {currentQ.hint}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {!solutionRevealed[currentQ.id] ? (
                                    <button
                                        onClick={handleRevealSolution}
                                        style={{
                                            padding: '10px 16px', background: '#21262d', color: '#58a6ff',
                                            border: '1px solid #30363d', borderRadius: '8px', fontWeight: '600',
                                            fontSize: '13px', cursor: 'pointer', alignSelf: 'flex-start'
                                        }}
                                    >
                                        👁️ Reveal Reference Solution & Complete
                                    </button>
                                ) : (
                                    <div style={{ background: '#090d13', border: '1px solid #3fb950', borderRadius: '8px', padding: '14px' }}>
                                        <div style={{ fontSize: '12px', color: '#3fb950', fontWeight: '600', marginBottom: '8px' }}>
                                            ✓ Reference Solution:
                                        </div>
                                        <pre style={{ margin: 0, fontFamily: 'monospace', fontSize: '12px', color: '#3fb950', lineHeight: '1.5' }}>
                                            <code>{currentQ.solutionCode}</code>
                                        </pre>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Explanation Drawer */}
                        {isAnswered && currentQ.explanation && (
                            <div style={{
                                marginTop: '20px', padding: '14px 18px',
                                background: '#161b22', borderRadius: '8px', border: '1px solid #30363d',
                                fontSize: '13px', color: '#c9d1d9', lineHeight: '1.5'
                            }}>
                                <strong style={{ color: '#58a6ff', display: 'block', marginBottom: '4px' }}>
                                    💡 Explanation:
                                </strong>
                                {currentQ.explanation}
                            </div>
                        )}
                    </div>

                    {/* Bottom Navigation */}
                    <div style={{
                        padding: '16px 24px', background: '#161b22', borderTop: '1px solid #30363d',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}>
                        <button
                            disabled={currentIdx === 0}
                            onClick={() => setCurrentIdx(prev => prev - 1)}
                            style={{
                                padding: '8px 16px', background: '#21262d', color: currentIdx === 0 ? '#484f58' : '#c9d1d9',
                                border: '1px solid #30363d', borderRadius: '6px', fontSize: '13px',
                                cursor: currentIdx === 0 ? 'not-allowed' : 'pointer'
                            }}
                        >
                            ← Previous
                        </button>

                        <div style={{ fontSize: '12px', color: '#8b949e' }}>
                            Progress: {answeredCount}/{totalQuestions} questions completed
                        </div>

                        {currentIdx < totalQuestions - 1 ? (
                            <button
                                onClick={() => setCurrentIdx(prev => prev + 1)}
                                style={{
                                    padding: '8px 18px', background: '#238636', color: '#ffffff',
                                    border: '1px solid rgba(240,246,252,0.1)', borderRadius: '6px',
                                    fontSize: '13px', fontWeight: '600', cursor: 'pointer'
                                }}
                            >
                                Next Question →
                            </button>
                        ) : (
                            <button
                                onClick={handleFinish}
                                style={{
                                    padding: '8px 18px', background: '#238636', color: '#ffffff',
                                    border: '1px solid rgba(240,246,252,0.1)', borderRadius: '6px',
                                    fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                                    boxShadow: '0 0 12px rgba(46, 160, 67, 0.4)'
                                }}
                            >
                                Finish & View Results 🏆
                            </button>
                        )}
                    </div>
                </div>
            ) : (
                /* Summary Results Screen */
                <div style={{ padding: '32px', overflowY: 'auto', textAlign: 'center' }}>
                    <div style={{ fontSize: '54px', marginBottom: '12px' }}>
                        {results.percent >= 80 ? '🏆' : results.percent >= 60 ? '⭐' : '📚'}
                    </div>
                    <h2 style={{ fontSize: '24px', color: '#ffffff', fontWeight: '800', marginBottom: '4px' }}>
                        Quiz Complete!
                    </h2>
                    <p style={{ color: '#8b949e', fontSize: '14px', marginBottom: '24px' }}>
                        {results.percent === 100
                            ? 'Perfect Score! You have mastered this chapter.'
                            : results.percent >= 80
                            ? 'Great Job! You have passed this chapter quiz.'
                            : 'Good effort! Review the questions below and retake whenever you like.'}
                    </p>

                    {/* Score Card */}
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '24px',
                        background: '#161b22', padding: '16px 32px', borderRadius: '12px',
                        border: '1px solid #30363d', marginBottom: '32px'
                    }}>
                        <div>
                            <div style={{ fontSize: '11px', color: '#8b949e', textTransform: 'uppercase' }}>Score</div>
                            <div style={{ fontSize: '28px', fontWeight: '800', color: '#58a6ff' }}>
                                {results.score} / {results.total}
                            </div>
                        </div>
                        <div style={{ width: '1px', height: '36px', background: '#30363d' }}></div>
                        <div>
                            <div style={{ fontSize: '11px', color: '#8b949e', textTransform: 'uppercase' }}>Accuracy</div>
                            <div style={{ fontSize: '28px', fontWeight: '800', color: results.percent >= 80 ? '#3fb950' : '#d29922' }}>
                                {results.percent}%
                            </div>
                        </div>
                    </div>

                    {/* Review List */}
                    <div style={{ textAlign: 'left', marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <h3 style={{ fontSize: '15px', color: '#79c0ff', marginBottom: '8px' }}>
                            Question Breakdown:
                        </h3>
                        {questions.map((item, idx) => {
                            const ans = answers[item.id];
                            let isRight = false;
                            if (item.type === 'multiple_choice') isRight = ans === item.correctIndex;
                            if (item.type === 'true_false') isRight = ans === item.correctValue;
                            if (item.type === 'code_challenge') isRight = ans !== undefined;

                            return (
                                <div key={item.id} style={{
                                    padding: '14px', borderRadius: '8px', background: '#161b22',
                                    border: isRight ? '1px solid rgba(46, 160, 67, 0.4)' : '1px solid rgba(248, 81, 73, 0.4)'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                        <span style={{ fontSize: '13px', fontWeight: '600', color: '#e6edf3' }}>
                                            Q{idx + 1}: {item.title || item.question}
                                        </span>
                                        <span style={{
                                            fontSize: '11px', fontWeight: '600', padding: '2px 8px', borderRadius: '4px',
                                            background: isRight ? 'rgba(46, 160, 67, 0.2)' : 'rgba(248, 81, 73, 0.2)',
                                            color: isRight ? '#3fb950' : '#f85149'
                                        }}>
                                            {item.type === 'code_challenge' ? 'Completed Challenge' : isRight ? 'Correct' : 'Incorrect'}
                                        </span>
                                    </div>
                                    <p style={{ fontSize: '12px', color: '#8b949e', margin: 0 }}>
                                        {item.explanation}
                                    </p>
                                </div>
                            );
                        })}
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '32px' }}>
                        <button onClick={handleRetake} style={{
                            padding: '10px 20px', background: '#21262d', color: '#c9d1d9',
                            border: '1px solid #30363d', borderRadius: '8px', fontWeight: '600',
                            fontSize: '13px', cursor: 'pointer'
                        }}>
                            🔄 Retake Quiz
                        </button>
                        {onClose && (
                            <button onClick={onClose} style={{
                                padding: '10px 24px', background: '#238636', color: '#ffffff',
                                border: '1px solid rgba(240,246,252,0.1)', borderRadius: '8px', fontWeight: '600',
                                fontSize: '13px', cursor: 'pointer'
                            }}>
                                ✕ Return to Chapter
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );

    if (isModal) {
        return (
            <div style={{
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.85)',
                backdropFilter: 'blur(8px)',
                zIndex: 1050,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '20px'
            }} onClick={onClose}>
                {content}
            </div>
        );
    }

    return content;
}

window.QuizRunner = QuizRunner;
