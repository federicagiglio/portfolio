// flipbook.jsx — Realistic physical linen book portfolio
// Access via: yoursite.com/#portfolio

const { useState: useFBState, useEffect: useFBEffect, useCallback: useFBCb } = React;

// ─── BOOK CONFIGURATION ──────────────────────────────────────────────────────
const BOOK = {
  author: ['FEDERICA', 'GIGLIO'],
  cover:  'flipbook/cover.jpg',
  back:   'flipbook/back-cover.jpg',

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
    'flipbook/11.jpg',
    'flipbook/12.jpg',
    'flipbook/13.jpg',
    'flipbook/14.jpg',
    'flipbook/15.jpg',
    'flipbook/16.jpg',
    'flipbook/16 2.jpg',
    'flipbook/17.jpg',
    'flipbook/18.jpg',
    'flipbook/19.jpg',
    'flipbook/20.jpg',
    'flipbook/21.jpg',
    'flipbook/22.jpg',
    'flipbook/23.jpg',
    'flipbook/25.jpg',
    'flipbook/26.jpg',
    'flipbook/27.jpg',
    'flipbook/28.jpg',
    'flipbook/29.jpg',
    'flipbook/30.jpg',
    'flipbook/31.jpg',
    'flipbook/32.jpg',
    'flipbook/33.jpg',
    'flipbook/34.jpg',
    'flipbook/35.jpg',
    'flipbook/37.jpg',
    'flipbook/POST_CASA_SUM23.jpg',
    'flipbook/DSC_5331b.jpg',
  ],
};
// ─────────────────────────────────────────────────────────────────────────────

// Pair photos into [{left, right}] spreads.
// Spread 0: title page ("Portfolio") on the left + first photo on the right.
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
        <h1 className="fbook-title-word">Portfolio</h1>
      </div>
    );
  }
  if (!src) return <div className="fbook-page-blank" />;
  const safeSrc = encodeURI(src);
  return (
    <div className="fbook-page-photo">
      <img src={safeSrc} alt="" className="fbook-photo-img" draggable={false} />
    </div>
  );
}

// ─── Cover faces (Francesca Woodman style linen cover) ────────────────────────
function CoverFrontFace() {
  return (
    <div className="fbook-cover-front fbook-linen-texture">
      <div className="fbook-cover-hinge" />
      <div className="fbook-cover-author">
        <span className="fbook-cover-line">{BOOK.author[0]}</span>
        <span className="fbook-cover-line">{BOOK.author[1]}</span>
      </div>
      <div className="fbook-cover-plate">
        <img
          src={encodeURI(BOOK.cover)}
          alt="Portfolio Cover"
          className="fbook-cover-plate-img"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
      </div>
    </div>
  );
}

function CoverBackFace() {
  return (
    <div className="fbook-cover-back fbook-linen-texture">
      <div className="fbook-cover-hinge fbook-cover-hinge-back" />
      {BOOK.back ? (
        <img
          src={encodeURI(BOOK.back)}
          alt="Back cover"
          className="fbook-cover-plate-img"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
      ) : null}
    </div>
  );
}

// ─── 3D Closed book ───────────────────────────────────────────────────────────
function BookClosed({ front, onClick }) {
  return (
    <div className="fbook-closed-stage">
      <div
        className="fbook-book3d fbook-linen-texture"
        onClick={onClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
      >
        {/* Page stacks */}
        <div className={front ? "fbook-3d-pages" : "fbook-3d-pages fbook-3d-pages-back"} />
        <div className="fbook-3d-bottom" />
        <div className={front ? "fbook-3d-spine" : "fbook-3d-spine fbook-3d-spine-back"} />

        {/* Cover face */}
        <div className="fbook-3d-face">
          {front ? <CoverFrontFace /> : <CoverBackFace />}
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

// ─── 3D Book Opening Animation ────────────────────────────────────────────────
function BookOpening({ spreads, onDone }) {
  return (
    <div className="fbook-opening-stage">
      <div className="fbook-spread fbook-spread-opening">
        {/* Left page underneath: Title */}
        <div className="fbook-page fbook-page-l">
          <PageFace src="TITLE" />
        </div>

        {/* Spine crease */}
        <div className="fbook-spine-bar" />

        {/* Right page underneath: photo 01 */}
        <div className="fbook-page fbook-page-r">
          <PageFace src={spreads[0].right} />
          <span className="fbook-pn fbook-pn-r mono">01</span>
        </div>

        {/* Turning front cover leaf swinging 180° in 3D */}
        <div className="fbook-leaf-flipper fbook-leaf-flipper-opening" onAnimationEnd={onDone}>
          <div className="fbook-leaf-front fbook-linen-texture">
            <CoverFrontFace />
          </div>
          <div className="fbook-leaf-back">
            <div className="fbook-page-blank" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 3D Book Closing to Front Animation ───────────────────────────────────────
function BookClosingFront({ spreads, onDone }) {
  return (
    <div className="fbook-opening-stage">
      <div className="fbook-spread fbook-spread-closing-front">
        <div className="fbook-page fbook-page-l">
          <PageFace src="TITLE" />
        </div>
        <div className="fbook-spine-bar" />
        <div className="fbook-page fbook-page-r">
          <PageFace src={spreads[0].right} />
          <span className="fbook-pn fbook-pn-r mono">01</span>
        </div>
        <div className="fbook-leaf-flipper fbook-leaf-flipper-closing-front" onAnimationEnd={onDone}>
          <div className="fbook-leaf-front fbook-linen-texture">
            <CoverFrontFace />
          </div>
          <div className="fbook-leaf-back">
            <div className="fbook-page-blank" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 3D Book Closing to Back Animation ────────────────────────────────────────
function BookClosingBack({ spreads, idx, onDone }) {
  const cur = spreads[idx];
  return (
    <div className="fbook-opening-stage">
      <div className="fbook-spread fbook-spread-closing-back">
        <div className="fbook-page fbook-page-l">
          <PageFace src={cur.left} />
        </div>
        <div className="fbook-spine-bar" />
        <div className="fbook-page fbook-page-r">
          <PageFace src={cur.right} />
        </div>
        <div className="fbook-leaf-flipper fbook-leaf-flipper-closing-back" onAnimationEnd={onDone}>
          <div className="fbook-leaf-front">
            <div className="fbook-page-blank" />
          </div>
          <div className="fbook-leaf-back fbook-linen-texture">
            <CoverBackFace />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Open book spread with outside navigation arrows & 3D page flip ───────────
function BookOpen({ spreads, idx, onIdx, onCloseFront, onCloseBack }) {
  const [flip, setFlip] = useFBState(null); // null | {dir:'next'|'prev', from, to}

  const go = useFBCb((dir) => {
    if (flip) return;
    if (dir === 'next') {
      if (idx >= spreads.length - 1) {
        onCloseBack();
        return;
      }
      setFlip({ dir: 'next', from: idx, to: idx + 1 });
    } else {
      if (idx === 0) {
        onCloseFront();
        return;
      }
      setFlip({ dir: 'prev', from: idx, to: idx - 1 });
    }
  }, [flip, idx, spreads.length, onCloseFront, onCloseBack]);

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
    <div className="fbook-stage-open-wrap">
      {/* Outside Left Arrow */}
      <button
        className="fbook-arrow-btn fbook-arrow-prev"
        onClick={() => go('prev')}
        title={idx === 0 ? "Close book" : "Previous page"}
        aria-label="Previous page"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      {/* Book Spread */}
      <div className="fbook-spread">
        {/* Left page (clicking turns prev) */}
        <div
          className="fbook-page fbook-page-l"
          onClick={() => go('prev')}
          title="Click to turn back"
        >
          <PageFace src={bgL} />
          {bgL && bgL !== 'TITLE' && pnL && (
            <span className="fbook-pn fbook-pn-l mono">{pnL}</span>
          )}
        </div>

        {/* Spine crease */}
        <div className="fbook-spine-bar" />

        {/* Right page (clicking turns next) */}
        <div
          className="fbook-page fbook-page-r"
          onClick={() => go('next')}
          title="Click to turn page"
        >
          <PageFace src={bgR} />
          {bgR && <span className="fbook-pn fbook-pn-r mono">{pnR}</span>}
        </div>

        {/* ── Flipper: right page turns left (next) ── */}
        {flip?.dir === 'next' && (
          <div className="fbook-flipper fbook-flipper-r" onAnimationEnd={onFlipEnd}>
            <div className="fbook-flip-front">
              <PageFace src={cur.right} />
              <div className="fbook-flip-shade fbook-flip-shade-front" />
            </div>
            <div className="fbook-flip-back">
              <PageFace src={dest.left} />
              <div className="fbook-flip-shade fbook-flip-shade-back" />
            </div>
          </div>
        )}

        {/* ── Flipper: left page turns right (prev) ── */}
        {flip?.dir === 'prev' && (
          <div className="fbook-flipper fbook-flipper-l" onAnimationEnd={onFlipEnd}>
            <div className="fbook-flip-front">
              <PageFace src={cur.left} />
              <div className="fbook-flip-shade fbook-flip-shade-front" />
            </div>
            <div className="fbook-flip-back">
              <PageFace src={dest.right} />
              <div className="fbook-flip-shade fbook-flip-shade-back" />
            </div>
          </div>
        )}

        {/* Spread counter at bottom */}
        <div className="fbook-counter mono">
          {idx + 1} / {spreads.length}
        </div>
      </div>

      {/* Outside Right Arrow */}
      <button
        className="fbook-arrow-btn fbook-arrow-next"
        onClick={() => go('next')}
        title={idx === spreads.length - 1 ? "Close book" : "Next page"}
        aria-label="Next page"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>
  );
}

// ─── Main Flipbook Component ──────────────────────────────────────────────────
function Flipbook({ goBack }) {
  const spreads = buildSpreads(BOOK.photos);
  // 'closed' | 'opening' | 'open' | 'closing-front' | 'closing-back' | 'back'
  const [view, setView] = useFBState('closed');
  const [idx,  setIdx]  = useFBState(0);

  const openBook      = useFBCb(() => setView('opening'), []);
  const onOpened      = useFBCb(() => { setIdx(0); setView('open'); }, []);
  const closeToFront  = useFBCb(() => setView('closing-front'), []);
  const onClosedFront = useFBCb(() => { setIdx(0); setView('closed'); }, []);
  const closeToBack   = useFBCb(() => setView('closing-back'), []);
  const onClosedBack  = useFBCb(() => setView('back'), []);
  const restart       = useFBCb(() => { setIdx(0); setView('opening'); }, []);

  useFBEffect(() => {
    const h = (e) => { if (e.key === 'Escape') goBack(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [goBack]);

  return (
    <div className="fbook-root">
      {/* Minimal gallery header */}
      <header className="fbook-header">
        <button className="fbook-back mono upper" onClick={goBack}>← Back</button>
        <span className="fbook-header-title mono upper">{BOOK.author[0]} {BOOK.author[1]}</span>
        <div className="fbook-header-r" />
      </header>

      {/* Book Stage */}
      <div className="fbook-stage">
        {view === 'closed' && (
          <BookClosed front onClick={openBook} />
        )}
        {view === 'opening' && (
          <BookOpening spreads={spreads} onDone={onOpened} />
        )}
        {view === 'open' && (
          <BookOpen
            spreads={spreads}
            idx={idx}
            onIdx={setIdx}
            onCloseFront={closeToFront}
            onCloseBack={closeToBack}
          />
        )}
        {view === 'closing-front' && (
          <BookClosingFront spreads={spreads} onDone={onClosedFront} />
        )}
        {view === 'closing-back' && (
          <BookClosingBack spreads={spreads} idx={idx} onDone={onClosedBack} />
        )}
        {view === 'back' && (
          <BookClosed front={false} onClick={restart} />
        )}
      </div>
    </div>
  );
}

Object.assign(window, { Flipbook });
