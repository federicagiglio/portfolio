// flipbook.jsx — Secret portfolio — realistic physical book.
// Access via: yoursite.com/#portfolio
//
// ╔══════════════════════════════════════════════════════╗
// ║  HOW TO UPDATE YOUR BOOK                            ║
// ║                                                      ║
// ║  1. Put your photos in the  flipbook/  folder       ║
// ║     cover.jpg          → front cover photo          ║
// ║     back-cover.jpg     → back cover (optional)      ║
// ║     01.jpg, 02.jpg …   → interior pages in order   ║
// ║                                                      ║
// ║  2. Edit the PHOTOS array below to list your files  ║
// ╚══════════════════════════════════════════════════════╝

const { useState: useFBState, useEffect: useFBEffect, useCallback: useFBCb } = React;

// ─── BOOK CONFIGURATION ──────────────────────────────────────────────────────
const BOOK = {
  author:   'FEDERICA GIGLIO',
  subtitle: 'PORTFOLIO',
  year:     '2019 — 2026',
  cover:    'flipbook/cover.jpg',
  back:     'flipbook/back-cover.jpg',

  // ↓ Add or remove filenames here to update the book pages ↓
  photos: [
    'flipbook/01.jpg',
    'flipbook/02.jpg',
    'flipbook/03.jpg',
    'flipbook/04.jpg',
    'flipbook/05.jpg',
    'flipbook/06.jpg',
    'flipbook/07.jpg',
    'flipbook/08.jpg',
    'flipbook/09.jpg',
    'flipbook/10.jpg',
  ],
};
// ─────────────────────────────────────────────────────────────────────────────

// Pair photos into [{left, right}] spreads.
// First spread: title page (left) + photo[0] (right).
function buildSpreads(photos) {
  const s = [];
  s.push({ left: 'TITLE', right: photos[0] ?? null });
  for (let i = 1; i < photos.length; i += 2) {
    s.push({ left: photos[i] ?? null, right: photos[i + 1] ?? null });
  }
  return s;
}

// ─── Single page face ─────────────────────────────────────────────────────────
function PageFace({ src }) {
  if (src === 'TITLE') {
    return (
      <div className="fbook-title-page">
        <span className="fbook-title-name mono upper">{BOOK.author}</span>
        <div className="fbook-title-rule" />
        <span className="fbook-title-sub mono upper">{BOOK.subtitle}</span>
        <span className="fbook-title-year mono">{BOOK.year}</span>
      </div>
    );
  }
  if (!src) return <div className="fbook-page-blank" />;
  return (
    <div className="fbook-page-photo">
      <img src={src} alt="" className="fbook-photo-img" draggable={false} />
    </div>
  );
}

// ─── 3D Closed book ───────────────────────────────────────────────────────────
function BookClosed({ front, onClick }) {
  return (
    <div className="fbook-closed-wrap">
      <div
        className="fbook-book3d"
        onClick={onClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
      >
        {/* Page stacks */}
        <div className={front ? "fbook-3d-pages" : "fbook-3d-pages fbook-3d-pages-back"} />
        <div className="fbook-3d-bottom" />
        <div className={front ? "fbook-3d-spine" : "fbook-3d-spine fbook-3d-spine-back"} />

        {/* Main cover face */}
        <div className="fbook-3d-face">
          {front ? (
            <div className="fbook-cover-front">
              <div className="fbook-cover-hinge" />
              <div className="fbook-cover-author mono upper">{BOOK.author}</div>
              <div className="fbook-cover-plate">
                <img
                  src={BOOK.cover}
                  alt="Portfolio cover"
                  className="fbook-cover-plate-img"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              </div>
              <div className="fbook-cover-footer">
                <span className="fbook-cover-sub mono upper">{BOOK.subtitle}</span>
                <span className="fbook-cover-year mono">{BOOK.year}</span>
              </div>
            </div>
          ) : (
            <div className="fbook-cover-back">
              <div className="fbook-cover-hinge fbook-cover-hinge-back" />
              {BOOK.back ? (
                <img
                  src={BOOK.back}
                  alt="Back cover"
                  className="fbook-cover-plate-img"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              ) : (
                <div className="fbook-back-content">
                  <span className="fbook-back-author mono upper">{BOOK.author}</span>
                  <div className="fbook-back-rule" />
                  <span className="fbook-back-sub mono upper">PORTFOLIO</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Hint */}
      {onClick && (
        <p className="fbook-hint mono upper">
          {front ? 'Click to open' : 'Click to restart'}
        </p>
      )}
    </div>
  );
}

// ─── Open book spread with CSS 3D page flip ───────────────────────────────────
function BookOpen({ spreads, idx, onIdx, onClose }) {
  const [flip, setFlip] = useFBState(null); // null | {dir:'next'|'prev', from, to}

  const go = useFBCb((dir) => {
    if (flip) return;
    if (dir === 'next') {
      if (idx >= spreads.length - 1) { onClose('back'); return; }
      setFlip({ dir: 'next', from: idx, to: idx + 1 });
    } else {
      if (idx === 0) { onClose('front'); return; }
      setFlip({ dir: 'prev', from: idx, to: idx - 1 });
    }
  }, [flip, idx, spreads.length, onClose]);

  const onFlipEnd = useFBCb(() => {
    if (!flip) return;
    onIdx(flip.to);
    setFlip(null);
  }, [flip, onIdx]);

  useFBEffect(() => {
    const h = (e) => {
      if (e.key === 'ArrowRight') go('next');
      if (e.key === 'ArrowLeft')  go('prev');
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [go]);

  const cur  = spreads[idx];
  const dest = flip ? spreads[flip.to] : null;

  // Background content updates as soon as flip starts, creating the
  // "page underneath" effect that is revealed as the flipper lifts.
  const bgL = flip
    ? (flip.dir === 'next' ? cur.left   : dest.left)
    : cur.left;
  const bgR = flip
    ? (flip.dir === 'next' ? dest.right : cur.right)
    : cur.right;

  // Page numbers (outer corners)
  const pnL = idx > 0 ? String(idx * 2).padStart(2, '0')     : null;
  const pnR =           String(idx * 2 + 1).padStart(2, '0');

  return (
    <div className="fbook-spread">
      {/* Left page */}
      <div
        className="fbook-page fbook-page-l"
        onClick={() => go('prev')}
        title="Click to go back"
        style={{ cursor: 'pointer' }}
      >
        <PageFace src={bgL} />
        {bgL && bgL !== 'TITLE' && pnL && (
          <span className="fbook-pn fbook-pn-l mono">{pnL}</span>
        )}
      </div>

      {/* Spine */}
      <div className="fbook-spine-bar" />

      {/* Right page */}
      <div
        className="fbook-page fbook-page-r"
        onClick={() => go('next')}
        title="Click to turn page"
        style={{ cursor: 'pointer' }}
      >
        <PageFace src={bgR} />
        {bgR && <span className="fbook-pn fbook-pn-r mono">{pnR}</span>}
      </div>

      {/* ── Flipper: right page turns left (next) ── */}
      {flip?.dir === 'next' && (
        <div className="fbook-flipper fbook-flipper-r" onAnimationEnd={onFlipEnd}>
          <div className="fbook-flip-front">
            <PageFace src={cur.right} />
          </div>
          <div className="fbook-flip-back">
            <PageFace src={dest.left} />
          </div>
        </div>
      )}

      {/* ── Flipper: left page turns right (prev) ── */}
      {flip?.dir === 'prev' && (
        <div className="fbook-flipper fbook-flipper-l" onAnimationEnd={onFlipEnd}>
          <div className="fbook-flip-front">
            <PageFace src={cur.left} />
          </div>
          <div className="fbook-flip-back">
            <PageFace src={dest.right} />
          </div>
        </div>
      )}

      {/* Navigation zones */}
      <div className="fbook-nav fbook-nav-l" onClick={() => go('prev')}>
        <span className="fbook-nav-arrow">‹</span>
      </div>
      <div className="fbook-nav fbook-nav-r" onClick={() => go('next')}>
        <span className="fbook-nav-arrow">›</span>
      </div>

      {/* Spread counter */}
      <div className="fbook-counter mono">
        {idx + 1} / {spreads.length}
      </div>
    </div>
  );
}

// ─── Main Flipbook component ──────────────────────────────────────────────────
function Flipbook({ goBack }) {
  const spreads = buildSpreads(BOOK.photos);
  const [view,    setView]    = useFBState('closed'); // 'closed' | 'open' | 'back'
  const [idx,     setIdx]     = useFBState(0);
  const [leaving, setLeaving] = useFBState(false);

  // Animated transition helper
  const transitionTo = useFBCb((nextView, resetIdx) => {
    setLeaving(true);
    setTimeout(() => {
      if (resetIdx) setIdx(0);
      setView(nextView);
      setLeaving(false);
    }, 480);
  }, []);

  const openBook  = useFBCb(() => { if (view === 'closed') transitionTo('open'); }, [view, transitionTo]);
  const closeBook = useFBCb((side) => {
    transitionTo(side === 'back' ? 'back' : 'closed', side !== 'back');
  }, [transitionTo]);
  const restart   = useFBCb(() => transitionTo('closed', true), [transitionTo]);

  useFBEffect(() => {
    const h = (e) => { if (e.key === 'Escape') goBack(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [goBack]);

  const sceneCls = `fbook-scene${leaving ? ' fbook-leaving' : ' fbook-entering'}`;

  return (
    <div className="fbook-root">
      {/* Minimal header */}
      <header className="fbook-header">
        <button className="fbook-back mono upper" onClick={goBack}>← Back</button>
        <span className="fbook-header-title mono upper">{BOOK.author}</span>
        <div className="fbook-header-r" />
      </header>

      {/* Book stage */}
      <div className="fbook-stage">
        {view === 'closed' && (
          <div className={sceneCls}>
            <BookClosed front onClick={openBook} />
          </div>
        )}
        {view === 'open' && (
          <div className={sceneCls}>
            <BookOpen
              spreads={spreads}
              idx={idx}
              onIdx={setIdx}
              onClose={closeBook}
            />
          </div>
        )}
        {view === 'back' && (
          <div className={sceneCls}>
            <BookClosed front={false} onClick={restart} />
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { Flipbook });
