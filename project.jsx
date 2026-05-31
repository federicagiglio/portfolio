// project.jsx — Project page = horizontal scroll only.
// Top bar with back + counter. Body is a single horizontal rail:
// description card first, then images at fixed height.

const { useState: useStateP, useEffect: useEffectP, useRef: useRefP } = React;

function CSToggle({ on, onToggle, small }) {
  return (
    <button className={`cs-toggle mono upper${small ? ' cs-toggle-sm' : ''}`} onClick={onToggle} aria-pressed={on}>
      <span className={`cs-track${small ? ' cs-track-sm' : ''}`}>
        <span className="cs-thumb" />
      </span>
      <span>contact sheet</span>
    </button>
  );
}

function PTop({ goTo, p, contactSheet, onToggleCS }) {
  return (
    <header className="ptop">
      <a className="ptop-l mono upper" href="#" onClick={(e)=>{e.preventDefault();goTo('home');}}>
        <span className="back-arrow">←</span>
        <span>Index</span>
        <span className="ptop-sep">/</span>
        <span className="ptop-muted">Federica Giglio</span>
      </a>
      <div className="ptop-c mono upper">
        <span className="ptop-num">{p.num}</span>
        <span className="ptop-sep">·</span>
        <span className="ptop-title">{p.title}</span>
        <span className="ptop-sep">·</span>
        <span>{p.year}</span>
      </div>
      <div className="ptop-r mono upper">
        <span>{p.cat}</span>
        <span className="ptop-sep">/</span>
        <span>{p.count} frames</span>
        <span className="ptop-sep">/</span>
        <span>{p.place}</span>
        <span className="ptop-sep">·</span>
        <CSToggle on={contactSheet} onToggle={onToggleCS} small />
      </div>
    </header>
  );
}

function PIntro({ p, onToggleCS, contactSheet }) {
  return (
    <div className="pcard">
      <h1 className="pcard-title">{p.title}</h1>
      <p className="pcard-body" style={{whiteSpace:'pre-line'}}>{p.long}</p>
      <div className="pcard-foot">
        <CSToggle on={contactSheet} onToggle={onToggleCS} />
        <dl className="pcard-spec mono upper">
          <div><dt>Year</dt><dd>{p.year}</dd></div>
          <div><dt>Place</dt><dd>{p.place}</dd></div>
          <div><dt>Frames</dt><dd>{p.count}</dd></div>
          {(p.format) && <div><dt>Format</dt><dd>{p.format}</dd></div>}
        </dl>
        {!contactSheet && (
          <div className="pcard-scroll mono upper">
            <span className="pcard-arrow">→</span>
            <span>scroll horizontally</span>
          </div>
        )}
      </div>
    </div>
  );
}

function PLocalVideo({ src }) {
  return (
    <div className="pvid">
      <video src={src} className="pvid-video" autoPlay loop muted playsInline />
      <div className="pvid-cap mono upper">
        <span className="pfig-num">VIDEO</span>
      </div>
    </div>
  );
}

function PVideo({ src }) {
  return (
    <div className="pvid">
      <iframe
        src={src}
        className="pvid-frame"
        frameBorder="0"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        title="Project video"
      />
      <div className="pvid-cap mono upper">
        <span className="pfig-num">VIDEO</span>
      </div>
    </div>
  );
}

function PFig({ fig, idx, total, kind, title }) {
  return (
    <figure className="pfig" style={fig.src ? undefined : { aspectRatio: `${fig.w} / ${fig.h}` }}>
      {fig.src ? (
        <img src={fig.src} alt={`${title} — frame ${fig.n}`} className="pfig-img" loading="lazy" />
      ) : (
        <div className="ph" data-kind={kind}>
          <span className="ph-fig">FIG. {fig.n}</span>
          <span className="ph-label">{title} / {String(total).padStart(2,'0')}</span>
        </div>
      )}
      <figcaption className="mono upper">
        <span className="pfig-num">{String(idx + 1).padStart(2, '0')} / {String(total).padStart(2,'0')}</span>
      </figcaption>
    </figure>
  );
}

// Reusable horizontal rail: scroll progress + wheel→horizontal + mouse drag.
function HRail({ children, onProgress }) {
  const railRef = useRefP(null);
  const drag = useRefP({ active: false, startX: 0, scrollLeft: 0, moved: false });

  useEffectP(() => {
    const el = railRef.current;
    if (!el) return;

    const update = () => {
      const max = el.scrollWidth - el.clientWidth;
      onProgress(max > 0 ? el.scrollLeft / max : 0);
    };
    update();
    el.addEventListener('scroll', update, { passive: true });

    const onWheel = (ev) => {
      if (Math.abs(ev.deltaX) > Math.abs(ev.deltaY)) return;
      ev.preventDefault();
      const px = ev.deltaMode === 0 ? ev.deltaY : ev.deltaMode === 1 ? ev.deltaY * 40 : ev.deltaY * el.clientWidth;
      el.scrollLeft += px * 2;
    };
    el.addEventListener('wheel', onWheel, { passive: false });

    const onMouseDown = (ev) => {
      if (ev.button !== 0) return;
      drag.current = { active: true, startX: ev.pageX, scrollLeft: el.scrollLeft, moved: false };
    };
    const onMouseMove = (ev) => {
      if (!drag.current.active) return;
      const dx = ev.pageX - drag.current.startX;
      if (Math.abs(dx) > 5) drag.current.moved = true;
      if (drag.current.moved) {
        ev.preventDefault();
        el.scrollLeft = drag.current.scrollLeft - dx;
      }
    };
    const onMouseUp = () => { drag.current.active = false; };

    el.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      el.removeEventListener('scroll', update);
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [onProgress]);

  return (
    <div ref={railRef} className="prail">
      <div className="prail-inner">{children}</div>
    </div>
  );
}

function ProgressBar({ progress, p }) {
  return (
    <div className="ppro mono upper">
      <div className="ppro-l">
        <span>Drag / scroll / wheel</span>
      </div>
      <div className="ppro-track">
        <div className="ppro-fill" style={{ width: (progress * 100) + '%' }} />
        <div className="ppro-ticks">
          {Array.from({ length: p.count || 6 }).map((_, i) => (
            <span key={i} className="ppro-tick" style={{ left: ((i / Math.max(1, (p.count||6) - 1)) * 100) + '%' }} />
          ))}
        </div>
      </div>
      <div className="ppro-r">
        <span>{Math.round(progress * 100).toString().padStart(3,'0')}%</span>
        <span className="ptop-sep">·</span>
        <span>{p.count} frames</span>
      </div>
    </div>
  );
}

function ContactSheet({ p, onImageClick }) {
  return (
    <div className="csheet">
      {p.figs.map((fig, i) => (
        <figure
          key={i}
          className="csheet-fig"
          onClick={() => onImageClick(i)}
        >
          <img src={fig.src} alt={`${p.title} — ${fig.n}`} loading="lazy" />
          <span className="csheet-num mono upper">{fig.n}</span>
        </figure>
      ))}
    </div>
  );
}

function Lightbox({ figs, index, title, onClose }) {
  const [cur, setCur] = useStateP(index);

  useEffectP(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setCur(c => Math.min(c + 1, figs.length - 1));
      if (e.key === 'ArrowLeft') setCur(c => Math.max(c - 1, 0));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, figs.length]);

  return (
    <div className="lb" onClick={onClose}>
      <img
        className="lb-img"
        src={figs[cur].src}
        alt={`${title} — ${figs[cur].n}`}
        onClick={e => e.stopPropagation()}
      />
      <div className="lb-bar mono upper" onClick={e => e.stopPropagation()}>
        <button
          className="lb-nav"
          onClick={() => setCur(c => Math.max(c - 1, 0))}
          disabled={cur === 0}
        >←</button>
        <span>{String(cur + 1).padStart(2,'0')} / {String(figs.length).padStart(2,'0')}</span>
        <button
          className="lb-nav"
          onClick={() => setCur(c => Math.min(c + 1, figs.length - 1))}
          disabled={cur === figs.length - 1}
        >→</button>
        <button className="lb-close" onClick={onClose}>✕ close</button>
      </div>
    </div>
  );
}

function ProjectLola({ p, goTo }) {
  const [progress, setProgress] = useStateP(0);
  const [cs, setCs] = useStateP(false);
  const [lb, setLb] = useStateP(null);

  const toggleCs = () => setCs(v => !v);

  return (
    <main className="project" data-screen-label={`Project ${p.title}`}>
      <PTop goTo={goTo} p={p} contactSheet={cs} onToggleCS={toggleCs} />
      {cs ? (
        <div className="cs-layout">
          <PIntro p={p} onToggleCS={toggleCs} contactSheet={cs} />
          <ContactSheet p={p} onImageClick={setLb} />
        </div>
      ) : (
        <HRail onProgress={setProgress}>
          <PIntro p={p} onToggleCS={toggleCs} contactSheet={cs} />
          {p.localVideo && <PLocalVideo src={p.localVideo} />}
          {p.video && <PVideo src={p.video} />}
          {p.figs.map((fig, i) => (
            <PFig key={i} fig={fig} idx={i} total={p.figs.length} kind={p.kind} title={p.title} />
          ))}
        </HRail>
      )}
      {!cs && <ProgressBar progress={progress} p={p} />}
      {lb !== null && (
        <Lightbox figs={p.figs} index={lb} title={p.title} onClose={() => setLb(null)} />
      )}
    </main>
  );
}

function ProjectStub({ p, goTo }) {
  const [progress, setProgress] = useStateP(0);
  const stubFigs = Array.from({ length: Math.min(p.count, 12) }).map((_, i) => ({
    w: i % 3 === 1 ? 5 : 4, h: i % 3 === 1 ? 4 : 5, n: String(i+1).padStart(2,'0'),
  }));
  return (
    <main className="project project-stub" data-screen-label={`Project ${p.title}`}>
      <PTop goTo={goTo} p={p} contactSheet={false} onToggleCS={() => {}} />
      <HRail onProgress={setProgress}>
        <PIntro p={p} onToggleCS={() => {}} contactSheet={false} />
        {stubFigs.map((fig, i) => (
          <PFig key={i} fig={fig} idx={i} total={stubFigs.length} kind={p.kind} title={p.title} />
        ))}
      </HRail>
      <ProgressBar progress={progress} p={{ ...p, count: stubFigs.length }} />
    </main>
  );
}

function Project({ id, goTo }) {
  const p = PROJECTS.find(x => x.id === id);
  if (!p) return null;
  if (p.figs) return <ProjectLola p={p} goTo={goTo} />;
  return <ProjectStub p={p} goTo={goTo} />;
}

Object.assign(window, { Project });
