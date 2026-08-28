/**
 * Master React SPA Application & Hash Router
 * Handles routing, bookmarks, browser history, global score state, and modal readers.
 */

const { useState, useEffect, useMemo, useCallback } = React;

function App() {
    const [currentRoute, setCurrentRoute] = useState(() => window.location.hash || '#/');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [quizScores, setQuizScores] = useState(() => {
        return (typeof getSavedQuizScores === 'function') ? getSavedQuizScores() : {};
    });

    // Active Modal States for Quick Overlays on Hub
    const [activeLessonModal, setActiveLessonModal] = useState(null);
    const [activeQuizModal, setActiveQuizModal] = useState(null);
    const [syllabusModalOpen, setSyllabusModalOpen] = useState(false);

    // Refresh quiz scores from storage
    const refreshScores = useCallback(() => {
        if (typeof getSavedQuizScores === 'function') {
            setQuizScores(getSavedQuizScores());
        }
    }, []);

    // Listen to hash changes for client-side routing & browser Back/Forward
    useEffect(() => {
        const handleHashChange = () => {
            setCurrentRoute(window.location.hash || '#/');
            window.scrollTo(0, 0);
        };

        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    // Route Parser
    const route = useMemo(() => {
        const hash = currentRoute.replace(/^#\/?/, '');
        const parts = hash.split('/').filter(Boolean);

        if (parts.length === 0) return { view: 'hub' };
        if (parts[0] === 'syllabus') return { view: 'syllabus' };
        if (parts[0] === 'chapter' && parts[1]) {
            const chapterNum = parts[1].padStart(2, '0');
            const subView = parts[2] || 'playground'; // 'playground' | 'lesson' | 'quiz'
            return { view: 'chapter', chapterNum, subView };
        }

        return { view: 'hub' };
    }, [currentRoute]);

    // Filter Chapters for Hub
    const filteredChapters = useMemo(() => {
        return CHAPTERS_REGISTRY.filter(ch => {
            if (selectedCategory === 'ready' && !ch.isReady) return false;
            if (selectedCategory === 'foundations' && !ch.part.includes('Foundations')) return false;
            if (selectedCategory === 'shapes' && !ch.part.includes('Shapes') && !ch.part.includes('Geometry')) return false;
            if (selectedCategory === 'noise' && !ch.part.includes('Noise') && !ch.part.includes('Patterns')) return false;
            if (selectedCategory === 'applications' && !ch.part.includes('Applications') && !ch.part.includes('FX')) return false;
            if (selectedCategory === 'advanced' && !ch.part.includes('Advanced')) return false;

            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                const matchTitle = ch.title.toLowerCase().includes(q);
                const matchSubtitle = ch.subtitle.toLowerCase().includes(q);
                const matchDesc = ch.description.toLowerCase().includes(q);
                const matchConcepts = ch.concepts?.some(c => c.toLowerCase().includes(q));
                return matchTitle || matchSubtitle || matchDesc || matchConcepts;
            }
            return true;
        });
    }, [selectedCategory, searchQuery]);

    const readyChaptersCount = CHAPTERS_REGISTRY.filter(c => c.isReady).length;
    const completedQuizzesCount = Object.values(quizScores).filter(s => s && s.completed).length;

    // View 1: Chapter Playground
    if (route.view === 'chapter' && route.subView === 'playground') {
        return (
            <ChapterPlayground
                chapterNum={route.chapterNum}
                quizScore={quizScores[route.chapterNum]}
                onScoreUpdated={refreshScores}
            />
        );
    }

    // View 2: Dedicated Chapter Lesson
    if (route.view === 'chapter' && route.subView === 'lesson') {
        const ch = getChapterByNumber(route.chapterNum);
        return (
            <div style={{ minHeight: '100vh', background: '#090d13' }}>
                <ChapterNavbar chapter={ch} quizScore={quizScores[route.chapterNum]} />
                <div style={{ maxWidth: '960px', margin: '0 auto', padding: '24px 20px' }}>
                    <MarkdownReader
                        title={`Chapter ${ch?.number}: ${ch?.title}`}
                        subtitle={ch?.subtitle}
                        filePath={`chapters/${ch?.slug}/lesson.md`}
                        isModal={false}
                    />
                </div>
            </div>
        );
    }

    // View 3: Dedicated Chapter Quiz
    if (route.view === 'chapter' && route.subView === 'quiz') {
        const ch = getChapterByNumber(route.chapterNum);
        return (
            <div style={{ minHeight: '100vh', background: '#090d13' }}>
                <ChapterNavbar chapter={ch} quizScore={quizScores[route.chapterNum]} />
                <div style={{ maxWidth: '840px', margin: '0 auto', padding: '24px 20px' }}>
                    <QuizRunner
                        chapterNum={route.chapterNum}
                        onScoreUpdated={refreshScores}
                        isModal={false}
                    />
                </div>
            </div>
        );
    }

    // View 4: Full Syllabus Page
    if (route.view === 'syllabus') {
        return (
            <div style={{ minHeight: '100vh', background: '#090d13' }}>
                <header style={{
                    background: '#161b22', borderBottom: '1px solid #30363d', padding: '14px 24px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                    <button
                        onClick={() => window.location.hash = '#/'}
                        style={{
                            background: '#21262d', border: '1px solid #30363d', color: '#c9d1d9',
                            padding: '6px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        ← Return to Chapters Hub
                    </button>
                    <h2 style={{ fontSize: '16px', color: '#58a6ff', margin: 0 }}>Course Curriculum & Roadmap</h2>
                </header>
                <div style={{ maxWidth: '960px', margin: '0 auto', padding: '24px 20px' }}>
                    <MarkdownReader
                        title="Complete 18-Chapter 2D Shader Curriculum"
                        filePath="SYLLABUS.md"
                        isModal={false}
                    />
                </div>
            </div>
        );
    }

    // View 5: Main Hub Portal
    return (
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 20px' }}>
            {/* Header Banner */}
            <header style={{ textAlign: 'center', marginBottom: '40px' }}>
                <div style={{
                    display: 'inline-block',
                    padding: '4px 12px',
                    background: 'rgba(88, 166, 255, 0.1)',
                    border: '1px solid rgba(88, 166, 255, 0.3)',
                    borderRadius: '20px',
                    color: '#58a6ff',
                    fontSize: '12px',
                    fontWeight: '600',
                    marginBottom: '16px',
                    letterSpacing: '0.5px'
                }}>
                    INSPIRED BY THE BOOK OF SHADERS
                </div>
                <h1 style={{
                    fontSize: '36px',
                    fontWeight: '800',
                    color: '#ffffff',
                    marginBottom: '12px',
                    letterSpacing: '-0.5px'
                }}>
                    2D Shader Tutorial & Interactive Hub
                </h1>
                <p style={{
                    fontSize: '16px',
                    color: '#8b949e',
                    maxWidth: '720px',
                    margin: '0 auto 24px',
                    lineHeight: '1.6'
                }}>
                    A hands-on journey from the fundamentals of GPU parallelism and coordinate spaces to advanced procedural noise, distance fields, and generative animations.
                </p>

                {/* Quick Stats & Syllabus Action */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '16px'
                }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '8px', background: '#161b22',
                        padding: '6px 14px', borderRadius: '8px', border: '1px solid #30363d', fontSize: '13px'
                    }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3fb950', display: 'inline-block' }}></span>
                        <span><strong>{readyChaptersCount}</strong> Playgrounds Ready</span>
                    </div>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '8px', background: '#161b22',
                        padding: '6px 14px', borderRadius: '8px', border: '1px solid #30363d', fontSize: '13px'
                    }}>
                        <span>🎯 <strong>{completedQuizzesCount} / {readyChaptersCount}</strong> Quizzes Passed</span>
                    </div>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '8px', background: '#161b22',
                        padding: '6px 14px', borderRadius: '8px', border: '1px solid #30363d', fontSize: '13px'
                    }}>
                        <span>📚 <strong>18</strong> Course Chapters</span>
                    </div>
                    <button
                        onClick={() => window.location.hash = '#/syllabus'}
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#238636',
                            color: '#ffffff', border: '1px solid rgba(240,246,252,0.1)', padding: '7px 16px',
                            borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#2ea043'}
                        onMouseLeave={e => e.currentTarget.style.background = '#238636'}
                    >
                        📋 View Full Syllabus
                    </button>
                </div>
            </header>

            {/* Filter & Search Bar */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px',
                marginBottom: '32px',
                padding: '16px',
                background: '#0d1117',
                borderRadius: '12px',
                border: '1px solid #21262d'
            }}>
                {/* Category Filter Pills */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {[
                        { id: 'all', label: 'All Chapters' },
                        { id: 'ready', label: '🎮 Ready to Play' },
                        { id: 'foundations', label: 'Part I: Foundations' },
                        { id: 'shapes', label: 'Part II: Shapes & SDFs' },
                        { id: 'noise', label: 'Part III: Noise & Patterns' },
                        { id: 'applications', label: 'Part IV: FX & Projects' },
                        { id: 'advanced', label: 'Part V: Advanced & Sim' }
                    ].map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            style={{
                                padding: '6px 14px',
                                borderRadius: '20px',
                                fontSize: '13px',
                                fontWeight: selectedCategory === cat.id ? '600' : '400',
                                background: selectedCategory === cat.id ? '#58a6ff' : '#161b22',
                                color: selectedCategory === cat.id ? '#0d1117' : '#c9d1d9',
                                border: '1px solid',
                                borderColor: selectedCategory === cat.id ? '#58a6ff' : '#30363d',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease'
                            }}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* Search Box */}
                <div style={{ minWidth: '260px', flex: '1', maxWidth: '360px' }}>
                    <input
                        type="text"
                        placeholder="Search by topic, GLSL concept (e.g. step, uniform)..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '8px 14px',
                            background: '#161b22',
                            border: '1px solid #30363d',
                            borderRadius: '8px',
                            color: '#c9d1d9',
                            fontSize: '13px',
                            outline: 'none'
                        }}
                    />
                </div>
            </div>

            {/* Chapter Cards Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
                gap: '24px'
            }}>
                {filteredChapters.map(chapter => (
                    <ChapterCard
                        key={chapter.id}
                        chapter={chapter}
                        quizScore={quizScores[chapter.number]}
                        onOpenLesson={ch => setActiveLessonModal(ch)}
                        onOpenQuiz={ch => setActiveQuizModal(ch)}
                    />
                ))}
            </div>

            {/* Footer */}
            <footer style={{
                marginTop: '64px',
                paddingTop: '24px',
                borderTop: '1px solid #21262d',
                textAlign: 'center',
                color: '#6e7681',
                fontSize: '13px'
            }}>
                <p style={{ marginBottom: '8px' }}>
                    Interactive 2D Shader Companion • Inspired by <a href="https://thebookofshaders.com/" target="_blank" style={{ color: '#58a6ff', textDecoration: 'none' }}>The Book of Shaders</a>
                </p>
                <p style={{ fontSize: '11px' }}>
                    Single Page React + WebGL Architecture. No server dependencies required.
                </p>
            </footer>

            {/* Quick Overlays */}
            {activeLessonModal && (
                <MarkdownReader
                    title={`Chapter ${activeLessonModal.number}: Lesson`}
                    subtitle={activeLessonModal.title}
                    filePath={`chapters/${activeLessonModal.slug}/lesson.md`}
                    onClose={() => setActiveLessonModal(null)}
                    isModal={true}
                />
            )}

            {activeQuizModal && (
                <QuizRunner
                    chapterNum={activeQuizModal.number}
                    onClose={() => setActiveQuizModal(null)}
                    onScoreUpdated={refreshScores}
                    isModal={true}
                />
            )}
        </div>
    );
}

// Mount the React SPA
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
