// flipbook.jsx — Red cloth art book (secret page: yoursite.com/#portfolio)
//
// Physical model: the book is a stack of LEAVES (sheets). Leaf 0 is the front
// cover board, the last leaf is the back cover board, everything between is a
// paper leaf with a photo on each side. Turning a leaf rotates it around the
// spine; paper leaves are split into vertical strips so they bend like real
// paper while they turn (and while you drag a corner).
//
// To change the photos: edit BOOK.photos below (files live in flipbook/web/,
// which holds high-quality web-sized copies of the originals in flipbook/).

(function () {
const { useState: fbState, useEffect: fbEffect, useRef: fbRef,
        useCallback: fbCb, useMemo: fbMemo, memo: fbMemoComp } = React;

// ─── BOOK CONFIGURATION ──────────────────────────────────────────────────────
const BOOK = {
  coverTop:    'FEDERICA',
  coverBottom: 'GIGLIO',
  cover: 'flipbook/web/cover.jpg',
  photos: [
    '01.jpg', '02.jpg', '03.jpg', '04.jpg', '05.jpg', '06.jpg', '07.jpg',
    '08.jpg', '09.jpg', '10.jpg', '11.jpg', '12.jpg', '13.jpg', '14.jpg',
    '15.jpg', '16.jpg', '16-2.jpg', '17.jpg', '18.jpg', '19.jpg', '20.jpg',
    '20-1.jpg', '21.jpg', '22.jpg', '23.jpg', '25.jpg', '26.jpg', '27.jpg',
    '28.jpg', '29.jpg', '30.jpg', '31.jpg', '32.jpg', '33.jpg', '34.jpg',
    '35.jpg', '36.jpg', '37.jpg',
  ].map((f) => 'flipbook/web/' + f),
};

const PAGE_RATIO   = 0.78;  // page width / height
const STRIPS       = 10;    // bend resolution of a paper leaf
const PAPER_BEND   = 64;    // max degrees of curl across a paper leaf
const TURN_MS      = 1050;  // auto page turn
const COVER_MS     = 1350;  // cover open / close
// ─────────────────────────────────────────────────────────────────────────────

// Faces in reading order: title page on the first recto, then photos.
function buildFaces() {
  const faces = [{ kind: 'title' }];
  BOOK.photos.forEach((src, i) => faces.push({ kind: 'photo', src, n: i + 1 }));
  if (faces.length % 2) faces.push({ kind: 'blank' });
  return faces;
}

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOut   = (t) => 1 - Math.pow(1 - t, 3);

// ─── Book size (fits viewport, leaves room for arrows + header) ──────────────
function useBookSize() {
  const calc = () => {
    const vw = window.innerWidth, vh = window.innerHeight;
    const side = vw > 900 ? 96 : 36;
    // big book, with just enough white around it for the header and hint
    const maxH = vw > 900 ? Math.min(vh * 0.86, vh - 112) : vh - 110;
    const maxWfromW = (vw - side * 2) / 2;
    let H = Math.min(maxH, maxWfromW / PAGE_RATIO);
    H = Math.max(180, Math.floor(H));
    const W = Math.round(H * PAGE_RATIO);
    const o = Math.max(4, Math.round(H * 0.016)); // cover board overhang
    return { W, H, o };
  };
  const [s, set] = fbState(calc);
  fbEffect(() => {
    const h = () => set(calc());
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);
  return s;
}

// ─── Face renderers ──────────────────────────────────────────────────────────
const Face = fbMemoComp(function Face({ face, side }) {
  // side: 'recto' (right-hand page) | 'verso' (left-hand page)
  switch (face.kind) {
    case 'cover':        return <CoverOutside />;
    case 'back-outside': return <div className="fb-cloth fb-cloth-back"><div className="fb-hinge fb-hinge-r" /></div>;
    case 'endpaper':     return <div className={'fb-cloth fb-endpaper-wrap fb-endpaper-' + side}><div className="fb-endpaper" /></div>;
    case 'title':
      return (
        <div className={'fb-paper fb-paper-' + side}>
          <div className="fb-title">
            <span>Federica Giglio</span>
            <span>Portfolio</span>
          </div>
          <div className="fb-gutter" />
        </div>
      );
    case 'photo':
      return (
        <div className={'fb-paper fb-paper-' + side}>
          <div className="fb-photo-box">
            <img src={face.src} alt="" draggable={false} decoding="async" />
          </div>
          <span className="fb-folio">{String(face.n).padStart(2, '0')}</span>
          <div className="fb-gutter" />
        </div>
      );
    default:
      return <div className={'fb-paper fb-paper-' + side}><div className="fb-gutter" /></div>;
  }
});

function CoverOutside() {
  return (
    <div className="fb-cloth fb-cloth-front">
      <div className="fb-hinge" />
      <span className="fb-cover-word fb-cover-top">{BOOK.coverTop}</span>
      <div className="fb-tipin">
        <img src={BOOK.cover} alt="" draggable={false} />
      </div>
      <span className="fb-cover-word fb-cover-bottom">{BOOK.coverBottom}</span>
    </div>
  );
}

// ─── Thin chevron arrows, like the reference photo ───────────────────────────
function Arrow({ dir, onClick, hidden, label }) {
  return (
    <button
      className={'fb-arrow fb-arrow-' + dir + (hidden ? ' is-hidden' : '')}
      onClick={onClick} aria-label={label} title={label} tabIndex={hidden ? -1 : 0}
    >
      <svg width="20" height="40" viewBox="0 0 20 40" fill="none" aria-hidden="true">
        <path d={dir === 'prev' ? 'M17 2L3 20L17 38' : 'M3 2L17 20L3 38'}
              stroke="currentColor" strokeWidth="1.25" strokeLinecap="square" />
      </svg>
    </button>
  );
}

// ─── Turning leaf (bends in strips) ──────────────────────────────────────────
function strip_angles(p, n, bend, sign) {
  const th = 180 * p;
  const b = bend * Math.sin(Math.PI * p) * sign;
  const out = [];
  for (let k = 0; k < n; k++) {
    const t = n === 1 ? 0.5 : k / (n - 1);
    out.push(clamp(th + b * (t - 0.5), 0, 180));
  }
  return out;
}
const rad = (d) => (d * Math.PI) / 180;
const shadeFront = (a) => 0.42 * (1 - Math.cos(rad(Math.min(a, 90))));
const shadeBack  = (a) => 0.42 * (1 + Math.cos(rad(Math.max(a, 90))));

function Leaf({ front, back, angles, w, h, top, rigid }) {
  const n = angles.length;
  const sw = w / n;
  // Smooth shading: value at each strip boundary
  const edgeA = [];
  for (let k = 0; k <= n; k++) {
    const a = k === 0 ? angles[0] : k === n ? angles[n - 1] : (angles[k - 1] + angles[k]) / 2;
    edgeA.push(a);
  }

  let node = null;
  for (let k = n - 1; k >= 0; k--) {
    const rel = k === 0 ? angles[0] : angles[k] - angles[k - 1];
    const fL = shadeFront(edgeA[k]), fR = shadeFront(edgeA[k + 1]);
    const bL = shadeBack(edgeA[k]),  bR = shadeBack(edgeA[k + 1]);
    // highlight where the paper curls toward the light
    const curl = k > 0 ? Math.abs(angles[k] - angles[k - 1]) : 0;
    node = (
      <div
        className="fb-strip"
        style={{
          width: sw, height: h,
          left: k === 0 ? 0 : sw,
          transform: `rotateY(${-rel}deg)`,
        }}
      >
        <div className="fb-face fb-face-front" style={{ width: sw + 0.6 }}>
          <div className="fb-face-inner" style={{ width: w, height: h, left: -k * sw }}>{front}</div>
          <div className="fb-shade" style={{
            background: `linear-gradient(90deg, rgba(0,0,0,${fL}), rgba(0,0,0,${fR}))`,
          }} />
          {!rigid && curl > 0.5 && (
            <div className="fb-shine" style={{ opacity: Math.min(0.5, curl / 40) }} />
          )}
        </div>
        <div className="fb-face fb-face-back" style={{ width: sw + 0.6 }}>
          <div className="fb-face-inner" style={{ width: w, height: h, left: -(w - (k + 1) * sw) }}>{back}</div>
          <div className="fb-shade" style={{
            background: `linear-gradient(270deg, rgba(0,0,0,${bL}), rgba(0,0,0,${bR}))`,
          }} />
        </div>
        {node}
      </div>
    );
  }
  return (
    <div className="fb-leaf" style={{ width: w, height: h, top }}>
      {node}
    </div>
  );
}

// ─── Page stack edge (thickness of the page block) ───────────────────────────
function stackShadow(count, side) {
  const layers = Math.min(7, Math.ceil(count / 3));
  if (!layers) return 'none';
  const dir = side === 'right' ? 1 : -1;
  const s = [];
  for (let i = 1; i <= layers; i++) {
    const c = i % 2 ? '#efefed' : '#dededb';
    s.push(`${dir * i * 0.7}px ${i * 0.55}px 0 ${c}`);
  }
  s.push(`${dir * (layers * 0.7 + 0.5)}px ${layers * 0.55 + 0.5}px 1px rgba(0,0,0,.25)`);
  return s.join(',');
}

// ─── Main component ──────────────────────────────────────────────────────────
function Flipbook({ goBack }) {
  const faces = fbMemo(buildFaces, []);
  const P = faces.length / 2;      // paper leaves
  const L = P + 2;                 // + front & back cover
  const { W, H, o } = useBookSize();

  const [pos, setPos] = fbState(0);          // leaves turned to the left
  const [turn, setTurn] = fbState(null);     // { k, p, dir, mode }
  const [fade, setFade] = fbState(false);
  const [hinted, setHinted] = fbState(false);
  const turnRef = fbRef(null);
  const posRef = fbRef(0);
  const anim = fbRef(0);
  const queued = fbRef(null);
  const bookRef = fbRef(null);
  const drag = fbRef(null);

  turnRef.current = turn;
  posRef.current = pos;

  // Body flag (cursor styling) + preload images in reading order
  fbEffect(() => {
    document.body.classList.add('fb-on');
    let alive = true;
    const list = [BOOK.cover, ...BOOK.photos];
    (async () => {
      for (const src of list) {
        if (!alive) return;
        const img = new Image();
        img.src = src;
        try { await img.decode(); } catch (e) {}
      }
    })();
    return () => { alive = false; document.body.classList.remove('fb-on'); };
  }, []);

  // Leaf content
  const leafFaces = fbCb((k) => {
    if (k === 0) return { front: { kind: 'cover' }, back: { kind: 'endpaper' } };
    if (k === L - 1) return { front: { kind: 'endpaper' }, back: { kind: 'back-outside' } };
    return { front: faces[2 * (k - 1)], back: faces[2 * (k - 1) + 1] };
  }, [faces, L]);

  // ── tween p of the active turn ──
  const runTo = fbCb((target, ms, ease, onDone) => {
    cancelAnimationFrame(anim.current);
    const t0 = performance.now();
    const p0 = turnRef.current.p;
    const step = (now) => {
      const t = clamp((now - t0) / ms, 0, 1);
      const p = p0 + (target - p0) * ease(t);
      setTurn((tr) => (tr ? { ...tr, p } : tr));
      if (t < 1) anim.current = requestAnimationFrame(step);
      else onDone && onDone();
    };
    anim.current = requestAnimationFrame(step);
  }, []);

  const finish = fbCb((k, target) => {
    const np = target >= 1 ? k + 1 : k;
    posRef.current = np;
    setPos(np);
    setTurn(null);
    turnRef.current = null;
    const q = queued.current;
    queued.current = null;
    if (q) setTimeout(() => startAuto(q), 0);
  }, []);

  const isCover = (k) => k === 0 || k === L - 1;

  const startAuto = fbCb((dir) => {
    const cur = turnRef.current;
    if (cur && cur.mode === 'auto') { queued.current = dir; return; }
    if (cur && cur.mode === 'drag') return;
    const ps = posRef.current;
    let k, p0, target;
    if (cur && (cur.mode === 'peek' || cur.mode === 'settle')) {
      cancelAnimationFrame(anim.current);
      if (cur.dir !== dir) {           // drop the lifted page, then turn the other way
        const back = cur.dir === 'next' ? 0 : 1;
        turnRef.current = null;
        setTurn(null);
        posRef.current = back ? cur.k + 1 : cur.k;
        setPos(posRef.current);
        return startAuto(dir);
      }
      k = cur.k; p0 = cur.p;
    } else if (dir === 'next') {
      if (ps >= L) return;
      k = ps; p0 = 0;
    } else {
      if (ps <= 0) return;
      k = ps - 1; p0 = 1;
    }
    target = dir === 'next' ? 1 : 0;
    const tr = { k, p: p0, dir, mode: 'auto' };
    turnRef.current = tr;
    setTurn(tr);
    setHinted(true);
    const ms = (isCover(k) ? COVER_MS : TURN_MS) * (0.35 + 0.65 * Math.abs(target - p0));
    runTo(target, ms, easeInOut, () => finish(k, target));
  }, [L, runTo, finish]);

  const next = fbCb(() => {
    if (posRef.current >= L && !turnRef.current) {      // closed on back → restart
      setFade(true);
      setTimeout(() => { setPos(0); setFade(false); }, 420);
      return;
    }
    startAuto('next');
  }, [L, startAuto]);
  const prev = fbCb(() => startAuto('prev'), [startAuto]);

  // Keyboard
  fbEffect(() => {
    const h = (e) => {
      if (e.key === 'Escape') goBack();
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); next(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [goBack, next, prev]);

  // ── Pointer: drag a page, click to turn, hover lifts the corner ──
  const zoneAt = (e) => {
    const r = bookRef.current.getBoundingClientRect();
    const x = e.clientX - (r.left + r.width / 2);
    const y = e.clientY - (r.top + r.height / 2);
    if (Math.abs(y) > H / 2 + o) return null;
    const ps = posRef.current;
    if (x > 0 && x < W + o && ps < L) return { dir: 'next', g: x / W };
    if (x < 0 && x > -W - o && ps > 0) return { dir: 'prev', g: -x / W };
    return null;
  };

  const onPointerDown = (e) => {
    if (e.button !== 0) return;
    const cur = turnRef.current;
    if (cur && cur.mode === 'auto') return;
    const z = zoneAt(e);
    if (!z) return;
    drag.current = { dir: z.dir, g: Math.max(0.3, z.g), x0: e.clientX, moved: false,
                     lastX: e.clientX, lastT: performance.now(), vx: 0 };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e) => {
    const d = drag.current;
    if (!d) {
      // hover: lift the outer edge slightly near the page edge
      if (e.pointerType !== 'mouse') return;
      const cur = turnRef.current;
      if (cur && cur.mode !== 'peek') return;
      const z = zoneAt(e);
      const ps = posRef.current;
      let want = z && z.g > 0.78 ? z.dir : null;
      if (want && isCover(want === 'next' ? ps : ps - 1)) want = null;
      if (want && cur && cur.dir !== want) want = null;
      if (want && !cur) {
        const k = want === 'next' ? ps : ps - 1;
        const p0 = want === 'next' ? 0 : 1;
        const tr = { k, p: p0, dir: want, mode: 'peek' };
        turnRef.current = tr; setTurn(tr);
        runTo(want === 'next' ? 0.045 : 0.955, 380, easeOut);
      } else if (!want && cur && cur.mode === 'peek') {
        const k = cur.k, target = cur.dir === 'next' ? 0 : 1;
        cur.mode = 'settle';
        runTo(target, 300, easeOut, () => finish(k, target));
      }
      return;
    }
    const dx = e.clientX - d.x0;
    const now = performance.now();
    d.vx = (e.clientX - d.lastX) / Math.max(1, now - d.lastT);
    d.lastX = e.clientX; d.lastT = now;
    if (!d.moved && Math.abs(dx) < 6) return;
    if (!d.moved) {
      d.moved = true;
      const ps = posRef.current;
      const cur = turnRef.current;
      const k = cur && (cur.mode === 'peek' || cur.mode === 'settle') ? cur.k : (d.dir === 'next' ? ps : ps - 1);
      cancelAnimationFrame(anim.current);
      d.k = k;
      d.p0 = cur && cur.k === k ? cur.p : (d.dir === 'next' ? 0 : 1);
      const tr = { k, p: d.p0, dir: d.dir, mode: 'drag' };
      turnRef.current = tr; setTurn(tr);
      setHinted(true);
    }
    const travel = isCover(d.k) ? Math.max(0.5, 2 * d.g - 0.5) * W : 2 * d.g * W;
    const p = clamp(d.p0 - dx / travel, 0, 1);
    turnRef.current = { ...turnRef.current, p };
    setTurn(turnRef.current);
  };

  const onPointerUp = (e) => {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    if (!d.moved) {                       // simple click
      if (d.dir === 'next') next(); else prev();
      return;
    }
    const cur = turnRef.current;
    if (!cur) return;
    let target;
    if (d.vx < -0.35) target = 1;
    else if (d.vx > 0.35) target = 0;
    else target = cur.p > 0.5 ? 1 : 0;
    const k = cur.k;
    turnRef.current = { ...cur, mode: 'auto' };
    setTurn(turnRef.current);
    const ms = (isCover(k) ? COVER_MS : TURN_MS) * (0.25 + 0.55 * Math.abs(target - cur.p));
    runTo(target, ms, easeOut, () => finish(k, target));
  };

  // ── Derive what is visible ──
  const k = turn ? turn.k : -1;
  const leftTop  = turn ? k - 1 : pos - 1;   // top leaf on the left pile
  const rightTop = turn ? k + 1 : pos;       // top leaf on the right pile

  let shift = 0;                             // keep a closed book centred
  if (turn) {
    if (k === 0) shift = -(W / 2) * (1 - turn.p);
    else if (k === L - 1) shift = (W / 2) * turn.p;
  } else if (pos === 0) shift = -W / 2;
  else if (pos === L) shift = W / 2;

  // Left pile
  let leftBoard = null, leftPage = null, leftCount = 0;
  if (leftTop === L - 1) leftBoard = { kind: 'back-outside' };
  else if (leftTop >= 0) {
    leftBoard = { kind: 'endpaper' };
    if (leftTop >= 1) { leftPage = leafFaces(leftTop).back; leftCount = leftTop; }
  }
  // Right pile
  let rightBoard = null, rightPage = null, rightCount = 0;
  if (rightTop === 0) rightBoard = { kind: 'cover' };
  else if (rightTop <= L - 1) {
    rightBoard = { kind: 'endpaper' };
    if (rightTop <= P) { rightPage = leafFaces(rightTop).front; rightCount = P - rightTop + 1; }
  }

  // Turning leaf geometry
  let leafEl = null, cast = null;
  if (turn) {
    const cover = isCover(k);
    const n = cover ? 1 : STRIPS;
    const angles = strip_angles(turn.p, n, cover ? 0 : PAPER_BEND, turn.dir === 'next' ? 1 : -1);
    const lw = cover ? W + o : W, lh = cover ? H + 2 * o : H;
    const f = leafFaces(k);
    leafEl = (
      <Leaf
        key={'leaf' + k}
        front={<Face face={f.front} side="recto" />}
        back={<Face face={f.back} side="verso" />}
        angles={angles} w={lw} h={lh} top={cover ? -o : 0} rigid={cover}
      />
    );
    // shadow the leaf throws on the page beneath
    const sw = lw / n;
    let xe = 0;
    angles.forEach((a) => { xe += sw * Math.cos(rad(a)); });
    const lift = Math.sin(rad(angles[n - 1]));
    const I = Math.min(1, lift * 1.4);
    cast = { xe, I };
  }

  const sizeVars = { '--W': W + 'px', '--H': H + 'px', '--o': o + 'px' };
  const closed = !turn && (pos === 0 || pos === L);
  const atFront = !turn && pos === 0;
  const atBack  = !turn && pos === L;

  let label;
  if (atFront) label = 'Cover';
  else if (atBack) label = 'Back cover';
  else {
    const sp = turn ? (turn.dir === 'next' ? k + 1 : k) : pos;
    if (sp >= L) label = 'Back cover';
    else if (sp <= 0) label = 'Cover';
    else label = String(sp).padStart(2, '0') + ' / ' + String(L - 1).padStart(2, '0');
  }

  return (
    <div className="fb-root" style={sizeVars}>
      
      <header className="fb-header">
        <button className="fb-head-btn" onClick={goBack}>← Back</button>
        <span className="fb-head-title">Federica Giglio</span>
        <span className="fb-head-count">{label}</span>
      </header>

      <Arrow dir="prev" onClick={prev} hidden={atFront} label="Previous" />
      <Arrow dir="next" onClick={next} label={atBack ? 'Start again' : 'Next'} />

      <div className="fb-stage">
        <div
          className={'fb-book' + (fade ? ' is-fading' : '') + (closed ? ' is-closed' : '')}
          ref={bookRef}
          style={{ transform: `translateX(${shift}px)` }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onPointerLeave={() => { if (!drag.current) onPointerMove({ clientX: -1e5, clientY: -1e5, pointerType: 'mouse' }); }}
          data-hover
        >
          {/* LEFT PILE */}
          {leftBoard && (
            <div className="fb-board fb-board-l">
              <Face face={leftBoard} side="verso" />
            </div>
          )}
          {leftPage && (
            <div className="fb-page fb-page-l" style={{ boxShadow: stackShadow(leftCount, 'left') }}>
              <Face face={leftPage} side="verso" />
            </div>
          )}

          {/* RIGHT PILE */}
          {rightBoard && (
            <div className="fb-board fb-board-r">
              <Face face={rightBoard} side="recto" />
            </div>
          )}
          {rightPage && (
            <div className="fb-page fb-page-r" style={{ boxShadow: stackShadow(rightCount, 'right') }}>
              <Face face={rightPage} side="recto" />
            </div>
          )}

          {/* Spine shadow when open */}
          {leftBoard && rightBoard && <div className="fb-spine-shadow" />}

          {/* Shadow cast by the turning leaf */}
          {cast && (
            <div className="fb-cast-clip">
              <div
                className={'fb-cast ' + (cast.xe >= 0 ? 'fb-cast-r' : 'fb-cast-l')}
                style={{
                  left: cast.xe >= 0 ? `calc(50% + ${cast.xe}px)` : undefined,
                  right: cast.xe < 0 ? `calc(50% + ${-cast.xe}px)` : undefined,
                  width: 12 + 90 * cast.I,
                  opacity: 0.85 * cast.I,
                }}
              />
            </div>
          )}

          {/* Turning leaf */}
          {leafEl && <div className="fb-leaf-host">{leafEl}</div>}
        </div>
      </div>

      <p className={'fb-hint' + (hinted && !atFront ? ' is-gone' : '')}>
        {atFront ? 'Click the book to open' : 'Drag a page corner, click, or use ← →'}
      </p>
    </div>
  );
}

window.Flipbook = Flipbook;
})();
