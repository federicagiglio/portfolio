// flipbook.jsx — Secret portfolio flipbook. Accessible via #portfolio.
// Presents every project as a navigable flipbook with cinematic page-turn
// animation. One project at a time; keyboard + click navigation.

const { useState: useFBState, useEffect: useFBEffect, useRef: useFBRef, useCallback: useFBCallback } = React;

// ─── Page-turn animation engine ─────────────────────────────────────────────

function FlipPage({ src, alt, index, currentIndex, direction }) {
  // direction: 'next' | 'prev' | null
  const isActive   = index === currentIndex;
  const wasActive  = index === currentIndex - (direction === 'next' ? 1 : -1);

  let cls = 'fb-page';
  if (isActive)  cls += ' fb-page--active';
  if (wasActive) cls += direction === 'next' ? ' fb-page--flip-out-next' : ' fb-page--flip-out-prev';

  return (
    <div className={cls} aria-hidden={!isActive}>
      <img
        src={src}
        alt={alt}
        className="fb-img"
        loading={Math.abs(index - currentIndex) <= 1 ? 'eager' : 'lazy'}
        draggable={false}
      />
    </div>
  );
}

// ─── Progress dots ───────────────────────────────────────────────────────────

function FBDots({ total, current, onGo }) {
  if (total <= 1) return null;
  const MAX_VISIBLE = 9;
  const dots = total <= MAX_VISIBLE
    ? Array.from({ length: total }, (_, i) => i)
    : [
        ...Array.from({ length: Math.min(3, current) }, (_, i) => i),
        ...(current > 3 ? ['…'] : []),
        current,
        ...(current < total - 4 ? ['…'] : []),
        ...Array.from({ length: Math.min(3, total - current - 1) }, (_, i) => total - 3 + i),
      ].filter((v, i, a) => a.indexOf(v) === i);

  return (
    <div className="fb-dots">
      {dots.map((d, i) =>
        typeof d === 'number' ? (
          <button
            key={d}
            className={'fb-dot' + (d === current ? ' fb-dot--active' : '')}
            onClick={() => onGo(d)}
            aria-label={`Go to frame ${d + 1}`}
          />
        ) : (
          <span key={`ellipsis-${i}`} className="fb-dot-ellipsis">·</span>
        )
      )}
    </div>
  );
}

// ─── Project selector strip ──────────────────────────────────────────────────

function FBProjectSelector({ projects, activeId, onSelect }) {
  return (
    <nav className="fb-projects">
      {projects.map((p) => (
        <button
          key={p.id}
          className={'fb-proj-btn' + (p.id === activeId ? ' fb-proj-btn--active' : '')}
          onClick={() => onSelect(p.id)}
        >
          <span className="fb-proj-num">{p.num}</span>
          <span className="fb-proj-title">{p.title}</span>
        </button>
      ))}
    </nav>
  );
}

// ─── Touch / drag support ────────────────────────────────────────────────────

function useDrag(onSwipeLeft, onSwipeRight) {
  const startX = useFBRef(null);

  const onTouchStart = (e) => { startX.current = e.touches[0].clientX; };
  const onTouchEnd   = (e) => {
    if (startX.current === null) return;
    const dx = e.changedTouches[0].clientX - startX.current;
    if (Math.abs(dx) > 50) { dx < 0 ? onSwipeLeft() : onSwipeRight(); }
    startX.current = null;
  };
  const onMouseDown  = (e) => { startX.current = e.clientX; };
  const onMouseUp    = (e) => {
    if (startX.current === null) return;
    const dx = e.clientX - startX.current;
    if (Math.abs(dx) > 60) { dx < 0 ? onSwipeLeft() : onSwipeRight(); }
    startX.current = null;
  };

  return { onTouchStart, onTouchEnd, onMouseDown, onMouseUp };
}

// ─── Main Flipbook component ─────────────────────────────────────────────────

function Flipbook({ goBack }) {
  const [activeId, setActiveId]   = useFBState(PROJECTS[0].id);
  const [frameIdx, setFrameIdx]   = useFBState(0);
  const [direction, setDirection] = useFBState(null);
  const [anim, setAnim]           = useFBState(false); // debounce during flip
  const timerRef = useFBRef(null);

  const project = PROJECTS.find((p) => p.id === activeId) || PROJECTS[0];
  const frames  = project.figs || [];
  const total   = frames.length;

  // Reset frame when switching project
  const selectProject = useFBCallback((id) => {
    setActiveId(id);
    setFrameIdx(0);
    setDirection(null);
  }, []);

  const flip = useFBCallback((dir) => {
    if (anim) return;
    setDirection(dir);
    setAnim(true);
    setFrameIdx((prev) => {
      if (dir === 'next') return Math.min(prev + 1, total - 1);
      return Math.max(prev - 1, 0);
    });
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setAnim(false);
    }, 520);
  }, [anim, total]);

  const next = useFBCallback(() => { if (frameIdx < total - 1) flip('next'); }, [flip, frameIdx, total]);
  const prev = useFBCallback(() => { if (frameIdx > 0)         flip('prev'); }, [flip, frameIdx]);

  // Keyboard navigation
  useFBEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next();
      if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   prev();
      if (e.key === 'Escape') goBack();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [next, prev, goBack]);

  // Click zones: left half = prev, right half = next
  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x    = e.clientX - rect.left;
    if (x < rect.width / 2) prev(); else next();
  };

  const drag = useDrag(next, prev);

  const frame = frames[frameIdx];

  return (
    <div className="fb-root">
      {/* Header */}
      <header className="fb-header">
        <button className="fb-back" onClick={goBack} title="Close (Esc)">
          <span className="fb-back-arrow">←</span>
          <span className="fb-back-label mono upper">Back</span>
        </button>

        <div className="fb-header-center mono upper">
          <span className="fb-brand">Federica Giglio</span>
          <span className="fb-sep">/</span>
          <span className="fb-header-proj">{project.title}</span>
        </div>

        <div className="fb-counter mono">
          <span className="fb-counter-cur">{String(frameIdx + 1).padStart(2, '0')}</span>
          <span className="fb-counter-sep"> / </span>
          <span className="fb-counter-tot">{String(total).padStart(2, '0')}</span>
        </div>
      </header>

      {/* Project selector */}
      <FBProjectSelector
        projects={PROJECTS}
        activeId={activeId}
        onSelect={selectProject}
      />

      {/* Stage */}
      <div
        className="fb-stage"
        onClick={handleClick}
        {...drag}
        aria-label="Click left half for previous, right half for next"
      >
        {/* Page shadow spine */}
        <div className="fb-spine" />

        {/* Pages */}
        {frame && (
          <div className="fb-book">
            <div
              className={'fb-page fb-page--active' + (anim && direction === 'next' ? ' fb-page--entering-next' : anim && direction === 'prev' ? ' fb-page--entering-prev' : '')}
            >
              <img
                src={frame.src}
                alt={`${project.title} frame ${frameIdx + 1}`}
                className="fb-img"
                draggable={false}
              />
            </div>
          </div>
        )}

        {/* Click zone hints — appear on hover */}
        <div className="fb-zone fb-zone--prev" onClick={(e) => { e.stopPropagation(); prev(); }}>
          <span className="fb-zone-arrow">‹</span>
        </div>
        <div className="fb-zone fb-zone--next" onClick={(e) => { e.stopPropagation(); next(); }}>
          <span className="fb-zone-arrow">›</span>
        </div>
      </div>

      {/* Dots */}
      <FBDots total={total} current={frameIdx} onGo={(i) => {
        setDirection(i > frameIdx ? 'next' : 'prev');
        setFrameIdx(i);
        setAnim(true);
        setTimeout(() => setAnim(false), 520);
      }} />

      {/* Caption */}
      <footer className="fb-footer mono upper">
        <span className="fb-footer-cat">{project.cat}</span>
        <span className="fb-footer-sep"> · </span>
        <span className="fb-footer-loc">{project.place}</span>
        <span className="fb-footer-sep"> · </span>
        <span className="fb-footer-year">{project.year}</span>
        {frame && <span className="fb-footer-frame"> · FIG. {frame.n}</span>}
      </footer>
    </div>
  );
}

Object.assign(window, { Flipbook });
