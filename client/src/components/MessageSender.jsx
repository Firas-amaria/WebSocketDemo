import { useState } from 'react';

export default function MessageSender({
  t,
  canSend,
  sendMessage,
  sent,
  clearSent,
}) {
  const [message, setMessage] = useState('');
  function submit(event) {
    event.preventDefault();
    if (canSend && message.trim() && sendMessage(message)) setMessage('');
  }
  return (
    <section className="card" aria-labelledby="send-heading">
      <div className="section-heading">
        <h2 id="send-heading">{t.sendTitle}</h2>
        <span className="step-number">02</span>
      </div>
      <form onSubmit={submit}>
        <label htmlFor="message">{t.message}</label>
        <div className="send-row">
          <input
            id="message"
            dir="auto"
            value={message}
            maxLength={1000}
            placeholder={t.placeholder}
            onChange={(event) => {
              setMessage(event.target.value);
              clearSent();
            }}
          />
          <button className="primary" disabled={!canSend || !message.trim()}>
            {t.send}
          </button>
        </div>
        <p className="hint">{canSend ? t.sendHint : t.waiting}</p>
      </form>
      <div role="status">
        {sent && (
          <p className="success">
            {t.sent}
            <small>{t.sentNote}</small>
          </p>
        )}
      </div>
    </section>
  );
}
