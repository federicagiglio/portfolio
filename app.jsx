// app.jsx — App shell: routing, cursor halo, page transitions, tweaks panel
const { useState: useStateA, useEffect: useEffectA, useRef: useRefA } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#E62317",
  "homeLayout": "carousel",
  "blurIntensity": 4
}/*EDITMODE-END*/;

const ACCENT_OPTIONS = ["#E62317", "#0A0A0A", "#FF6A1A"];

// Solid red dot cursor — grows slightly over interactive targets.
function Cursor({ accent }) {
  const dotRef = useRefA(null);
  const [link, setLink] = useStateA(false);

  useEffectA(() => {
    const onMove = (e) => {
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      }
      const el = e.target;
      const interactive = el && el.closest('a,button,.tile,.ctile,[data-hover]');
      setLink(!!interactive);
    };
    window.addEventListener('mousemove', onMove);
    const hide = () => { if (dotRef.current) dotRef.current.style.opacity = '0'; };
    const show = () => { if (dotRef.current) dotRef.current.style.opacity = '1'; };
    document.addEventListener('mouseleave', hide);
    document.addEventListener('mouseenter', show);
    return () => {
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', hide);
      document.removeEventListener('mouseenter', show);
    };
  }, []);

  const size = link ? 36 : 22;
  return (
    <div ref={dotRef} className="cursor-dot" style={{
      width: size, height: size,
      marginLeft: -size/2, marginTop: -size/2,
      background: accent,
      transition: 'width .22s cubic-bezier(.3,.7,.4,1), height .22s cubic-bezier(.3,.7,.4,1), margin .22s cubic-bezier(.3,.7,.4,1)'
    }} />
  );
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [page, setPage] = useStateA('home');
  const [phase, setPhase] = useStateA('idle'); // idle | leaving | entering

  // Sync CSS vars from tweaks.
  useEffectA(() => {
    document.documentElement.style.setProperty('--accent', t.accent);
    document.documentElement.style.setProperty('--tile-blur', t.blurIntensity + 'px');
  }, [t.accent, t.blurIntensity]);

  // Navigate with browser history so back/forward buttons work.
  const navigate = (p, pushHistory) => {
    setPhase('leaving');
    window.setTimeout(() => {
      setPage(p);
      window.scrollTo(0, 0);
      setPhase('entering');
      window.setTimeout(() => setPhase('idle'), 30);
    }, 380);
    if (pushHistory !== false) {
      const url = p === 'home' ? window.location.pathname : window.location.pathname + '#' + p;
      window.history.pushState({ page: p }, '', url);
    }
  };

  const goTo = (p) => {
    if (p === page) return;
    navigate(p, true);
  };

  // Listen for browser back/forward button.
  useEffectA(() => {
    const onPop = (e) => {
      const p = (e.state && e.state.page) ? e.state.page : 'home';
      navigate(p, false);
    };
    window.addEventListener('popstate', onPop);
    // Set initial history state.
    window.history.replaceState({ page: 'home' }, '', window.location.href);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // Settle "entering" → "idle" on the next frame so the blur unwinds.
  useEffectA(() => {
    if (phase !== 'entering') return;
    const id = window.setTimeout(() => setPhase('idle'), 40);
    return () => window.clearTimeout(id);
  }, [phase]);

  const stageClass = 'stage' + (phase === 'leaving' ? ' leaving' : (phase === 'entering' ? ' entering' : ''));

  return (
    <>
      <Cursor accent={t.accent} />
      <div className={stageClass}>
        {page === 'home'
          ? <Home tweaks={t} goTo={goTo} />
          : <Project id={page} goTo={goTo} />}
      </div>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Accent" />
        <TweakColor label="Color" value={t.accent} options={ACCENT_OPTIONS}
                    onChange={(v) => setTweak('accent', v)} />

        <TweakSection label="Home layout" />
        <TweakRadio label="Style" value={t.homeLayout}
                    options={[{value:'grid', label:'3×2 Grid'},
                              {value:'carousel', label:'Carousel'}]}
                    onChange={(v) => setTweak('homeLayout', v)} />

        <TweakSection label="Blur" />
        <TweakSlider label="Intensity" value={t.blurIntensity} min={0} max={40} unit="px"
                     onChange={(v) => setTweak('blurIntensity', v)} />

        <TweakSection label="Jump to project" />
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6}}>
          {PROJECTS.map(p => (
            <TweakButton key={p.id} secondary label={`${p.num} ${p.title}`}
                         onClick={() => goTo(p.id)} />
          ))}
          <TweakButton label="← Home" onClick={() => goTo('home')} />
        </div>
      </TweaksPanel>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
