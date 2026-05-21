// project.jsx — Project page = horizontal scroll only.
// Top bar with back + counter. Body is a single horizontal rail:
// description card first, then images at fixed height.

const { useState: useStateP, useEffect: useEffectP, useRef: useRefP } = React;

function PTop({ goTo, p }) {
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
      </div>
    </header>
  );
}

function PIntro({ p }) {
  return (
    <div className="pcard">
      <h1 className="pcard-title">{p.title}</h1>
      <p className="pcard-body">{p.long}</p>
      <dl className="pcard-spec mono upper">
        <div><dt>Year</dt><dd>{p.year}</dd></div>
        <div><dt>Place</dt><dd>{p.place}</dd></div>
        <div><dt>Frames</dt><dd>{p.count}</dd></div>
        <div><dt>Format</dt><dd>35mm + 645</dd></div>
      </dl>
      <div className="pcard-scroll mono upper">
        <span className="pcard-arrow">→</span>
        <span>scroll horizontally</span>
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

    // Vertical wheel → horizontal scroll (same normalization as home carousel)
    const onWheel = (ev) => {
      if (Math.abs(ev.deltaX) > Math.abs(ev.deltaY)) return;
      ev.preventDefault();
      const px = ev.deltaMode === 0 ? ev.deltaY : ev.deltaMode === 1 ? ev.deltaY * 40 : ev.deltaY * el.clientWidth;
      el.scrollLeft += px * 2;
    };
    el.addEventListener('wheel', onWheel, { passive: false });

    // Mouse drag → horizontal scroll
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

function ProjectLola({ p, goTo }) {
  const [progress, setProgress] = useStateP(0);
  return (
    <main className="project" data-screen-label={`Project ${p.title}`}>
      <PTop goTo={goTo} p={p} />
      <HRail onProgress={setProgress}>
        <PIntro p={p} />
        {p.localVideo && <PLocalVideo src={p.localVideo} />}
        {p.video && <PVideo src={p.video} />}
        {p.figs.map((fig, i) => (
          <PFig key={i} fig={fig} idx={i} total={p.figs.length} kind={p.kind} title={p.title} />
        ))}
      </HRail>
      <ProgressBar progress={progress} p={p} />
    </main>
  );
}

function ProjectStub({ p, goTo }) {
  const [progress, setProgress] = useStateP(0);
  // Synthesize a small set of placeholder frames for the stub so the rail
  // still has something to scroll through.
  const stubFigs = Array.from({ length: Math.min(p.count, 12) }).map((_, i) => ({
    w: i % 3 === 1 ? 5 : 4, h: i % 3 === 1 ? 4 : 5, n: String(i+1).padStart(2,'0'),
  }));
  return (
    <main className="project project-stub" data-screen-label={`Project ${p.title}`}>
      <PTop goTo={goTo} p={p} />
      <HRail onProgress={setProgress}>
        <PIntro p={p} />
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
