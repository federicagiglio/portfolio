// home.jsx — Single-viewport home. All 6 projects visible without scrolling.
// Top: identity strip (name + tagline + contact). Main: 3×2 grid of tiles
// (or horizontal carousel via tweak). Footer: thin colophon strip.

const { useState, useEffect, useRef } = React;

function TopBar() {
  return (
    <header className="top">
      <div className="top-bar">
        <div className="top-id mono upper">
          <span>Federica Giglio</span>
          <span className="top-sep">/</span>
          <span className="top-muted">Portfolio</span>
        </div>
      </div>

      <div className="top-grid">
        <section className="top-block top-about" id="about">
          <div className="top-block-h mono upper">
            <span>About</span>
          </div>
          <p className="top-block-body">{BIO.long}</p>
          <div className="top-block-foot mono upper">
            <span>Born</span><b>{BIO.origin}</b>
            <span>Based</span><b>{BIO.location}</b>
          </div>
        </section>

        <section className="top-block top-contact" id="contact">
          <div className="top-block-h mono upper">
            <span>Contacts</span>
          </div>
          <ul className="top-clist mono">
            <li>
              <span className="top-clist-l">EML</span>
              <a className="top-clist-v" href={`mailto:${BIO.email}`}>{BIO.email}</a>
            </li>
            <li>
              <span className="top-clist-l">IG·</span>
              <a className="top-clist-v" href="https://instagram.com/fede.giglio" target="_blank" rel="noopener">{BIO.instagram}</a>
            </li>
            <li>
              <span className="top-clist-l">MEDIA</span>
              <span className="top-clist-v">Still + Motion</span>
            </li>
          </ul>
        </section>
      </div>
    </header>
  );
}

function GridTile({ p, goTo }) {
  return (
    <a className="tile" data-comment-anchor={`tile-${p.id}`}
       onClick={(e) => { e.preventDefault(); goTo(p.id); }}
       href={`#${p.id}`}>
      <div className="tile-top mono upper">
        <span className="tile-num">{p.num}</span>
        <span className="tile-cat">{p.cat}</span>
        <span className="tile-year">{p.year}</span>
      </div>
      <div className="tile-img-wrap">
        {p.cover ? (
          <img src={p.cover} alt={p.title} className="tile-img" />
        ) : (
          <div className="ph" data-kind={p.kind}>
            <span className="ph-fig">FIG. {p.num}</span>
            <span className="ph-label">{p.count} FRAMES</span>
          </div>
        )}
      </div>
      <div className="tile-meta">
        <div className="tile-title-wrap">
          <span className="tile-title">{p.title}</span>
          {p.subtitle && <span className="tile-subtitle mono upper">{p.subtitle}</span>}
        </div>
        <span className="tile-arrow">→</span>
      </div>
    </a>
  );
}

function CTile({ p, goTo }) {
  return (
    <a className="ctile" onClick={(e) => { e.preventDefault(); goTo(p.id); }}
       href={`#${p.id}`}>
      <div className="ctile-img-wrap">
        {p.cover
          ? <img src={p.cover} alt={p.title} />
          : <div className="ph" data-kind={p.kind} />}
      </div>
      <div className="ctile-info">
        <span className="ctile-name">{p.title}</span>
        {p.subtitle && <span className="ctile-subtitle mono upper">{p.subtitle}</span>}
        <span className="ctile-sub">{p.cat} · {p.year}</span>
      </div>
    </a>
  );
}

function CarouselRail({ children }) {
  const railRef = useRef(null);
  useEffect(() => {
    const el = railRef.current;
    if (!el) return;
    const onWheel = (e) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      e.preventDefault();
      // deltaMode 0 = pixels, 1 = lines (~40px each), 2 = pages
      const px = e.deltaMode === 0 ? e.deltaY : e.deltaMode === 1 ? e.deltaY * 40 : e.deltaY * el.clientWidth;
      el.scrollLeft += px * 2;
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);
  return <div ref={railRef} className="works-h-rail">{children}</div>;
}

function Works({ layout, goTo }) {
  if (layout === 'carousel') {
    return (
      <section className="works-h" id="works">
        <CarouselRail>
          {PROJECTS.map((p) => <CTile key={p.id} p={p} goTo={goTo} />)}
        </CarouselRail>
        <div className="home-scroll-hint mono upper">
          <span className="home-scroll-arrow">→</span>
          <span>Scroll to explore</span>
        </div>
      </section>
    );
  }
  return (
    <section className="works" id="works">
      <div className="grid">
        {PROJECTS.map((p) => <GridTile key={p.id} p={p} goTo={goTo} />)}
      </div>
      <div className="home-scroll-hint mono upper">
        <span className="home-scroll-arrow">↓</span>
        <span>Scroll to explore</span>
      </div>
    </section>
  );
}

function BottomBar() {
  return (
    <footer className="bot mono upper">
      <div className="bot-l">
        <span className="bot-dot">●</span>
        <span>Index · 05 projects · 2019—2026</span>
      </div>
      <div className="bot-c">
        <span>Hover to blur · Click to open</span>
      </div>
      <div className="bot-r">
        <span>{BIO.copyright}</span>
      </div>
    </footer>
  );
}

function Home({ tweaks, goTo }) {
  return (
    <main className="home" data-screen-label="Home">
      <TopBar />
      <Works layout={tweaks.homeLayout} goTo={goTo} />
      <BottomBar />
    </main>
  );
}

Object.assign(window, { Home });
