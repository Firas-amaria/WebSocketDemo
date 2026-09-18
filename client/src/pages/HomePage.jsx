export default function HomePage({ t }) {
  return (
    <>
      <section className="hero">
        <div>
          <p className="eyebrow">
            <span className="tiny-square" />
            {t.badge}
          </p>
          <h1>{t.hero}</h1>
          <p className="hero-subtitle">{t.subtitle}</p>
          <div className="button-row">
            <a className="primary button" href="#classroom">
              {t.start}
              <span aria-hidden="true">↗</span>
            </a>
            <a className="secondary button" href="#learn">
              {t.how}
            </a>
          </div>
          <p className="hero-footnote">ESP32-S3 · WebSocket · Wi-Fi</p>
        </div>
        <div className="connection-illustration">
          <div className="diagram-label">{t.motto}</div>
          <div className="computer-drawing" aria-hidden="true">
            <div className="screen-lines">
              <i />
              <i />
              <i />
            </div>
          </div>
          <strong>{t.computer}</strong>
          <span className="diagram-arrow" aria-hidden="true">
            ↕
          </span>
          <span className="wifi-pill">{t.network}</span>
          <span className="diagram-arrow" aria-hidden="true">
            ↕
          </span>
          <div className="chip-drawing" aria-hidden="true">
            <span>ESP32</span>
          </div>
          <strong>{t.device}</strong>
          <p>{t.diagramNote}</p>
        </div>
      </section>
      <section className="basics">
        <div className="section-heading">
          <h2>{t.basics}</h2>
          <span className="eyebrow">01 — 02 — 03</span>
        </div>
        <div className="step-grid">
          {t.steps.map(([title, text], index) => (
            <article key={title}>
              <span className="step-number">0{index + 1}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
        <p className="hardware-note">{t.noExtras}</p>
      </section>
    </>
  );
}
