const configuration = `const char* WIFI_NAME = "MyWiFi";
const char* WIFI_PASSWORD = "password";
const char* WEBSOCKET_SERVER = "192.168.1.10";
const int WEBSOCKET_PORT = 8080;`;

export default function LearnPage({ t }) {
  return (
    <>
      <header className="page-heading">
        <p className="eyebrow">{t.learnLabel}</p>
        <h1>{t.learnTitle}</h1>
        <p>{t.learnIntro}</p>
      </header>
      <div className="learn-grid">
        <section className="card">
          <span className="step-number">01</span>
          <h2>{t.lesson1}</h2>
          <p>{t.lesson1Text}</p>
          <div className="flow">
            {t.computer}
            <span>↕</span>
            <bdi>WebSocket</bdi>
            <span>↕</span>
            <bdi>ESP32</bdi>
          </div>
        </section>
        <section className="card">
          <span className="step-number">02</span>
          <h2>{t.lesson2}</h2>
          <p>{t.lesson2Text}</p>
          <div className="flow">
            {t.browser}
            <span>↕</span>
            <bdi>{t.server}</bdi>
            <span>↕</span>
            <bdi>ESP32</bdi>
          </div>
        </section>
        <section className="card">
          <span className="step-number">03</span>
          <h2>{t.lesson3}</h2>
          <ol>
            {t.computerSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <pre dir="ltr">ws://192.168.1.10:8080</pre>
          <p className="hint">{t.ipNote}</p>
        </section>
        <section className="card">
          <span className="step-number">04</span>
          <h2>{t.lesson4}</h2>
          <p>{t.deviceIntro}</p>
          <pre dir="ltr">{configuration}</pre>
          <ul>
            {t.configNotes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
          <p>{t.deviceNetwork}</p>
          <p className="hint">{t.firmwareNote}</p>
        </section>
        <section className="card exercise">
          <p className="eyebrow">{t.exercise}</p>
          <h2>{t.exerciseSend}</h2>
          <ol>
            {t.exerciseSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <pre dir="ltr">Hello ESP32</pre>
          <h3>{t.exerciseBack}</h3>
          <p>{t.exerciseReply}</p>
          <pre dir="ltr">Hello computer</pre>
          <a className="primary button" href="#classroom">
            {t.start}
          </a>
        </section>
        <section className="card">
          <h2>{t.troubleshooting}</h2>
          {t.troubleshootItems.map(([title, text]) => (
            <details key={title}>
              <summary>{title}</summary>
              <p>{text}</p>
            </details>
          ))}
        </section>
      </div>
    </>
  );
}
