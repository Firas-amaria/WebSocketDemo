import { useEffect, useRef } from 'react';

export default function MessageLog({
  t,
  messages,
  clearMessages,
  language,
  rawMessages,
}) {
  const log = useRef(null);
  useEffect(() => {
    if (log.current) log.current.scrollTop = log.current.scrollHeight;
  }, [messages]);
  return (
    <section className="card log-card" aria-labelledby="messages-heading">
      <div className="section-heading">
        <h2 id="messages-heading">
          {t.messages} <span className="count">{messages.length}</span>
        </h2>
        <button
          className="text-button"
          onClick={clearMessages}
          disabled={!messages.length && !rawMessages.length}
        >
          {t.clear}
        </button>
      </div>
      <div
        className="message-log"
        ref={log}
        role="log"
        aria-label={t.messages}
        tabIndex="0"
      >
        {!messages.length && (
          <div className="empty-state">
            <span aria-hidden="true">↔</span>
            <h3>{t.empty}</h3>
            <p>{t.emptyHint}</p>
          </div>
        )}
        {messages.map((message) => (
          <article className={`message ${message.direction}`} key={message.id}>
            <div className="message-meta">
              <strong>{t[message.direction]}</strong>
              <time dir="ltr" dateTime={message.time}>
                {new Date(message.time).toLocaleTimeString(language, {
                  hour12: false,
                })}
              </time>
            </div>
            <p dir="auto">{message.text}</p>
          </article>
        ))}
      </div>
      <p className="hint">{t.logLimit}</p>
      <details>
        <summary>{t.advanced}</summary>
        <p className="hint">{t.rawHint}</p>
        <pre dir="ltr">
          {rawMessages.length ? rawMessages.join('\n\n') : t.rawEmpty}
        </pre>
      </details>
    </section>
  );
}
