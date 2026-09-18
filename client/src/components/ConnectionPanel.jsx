import StatusBadge from './StatusBadge.jsx';

export default function ConnectionPanel({
  t,
  webSocketUrl,
  setWebSocketUrl,
  connectionStatus,
  connect,
  disconnect,
  deviceOnline,
  lastSeen,
  language,
  error,
}) {
  return (
    <section
      className="card connection-card"
      aria-labelledby="connection-heading"
    >
      <div className="section-heading">
        <h2 id="connection-heading">{t.connection}</h2>
        <span className="step-number">01</span>
      </div>
      <p className="eyebrow">{t.websiteStatus}</p>
      <div role="status">
        <StatusBadge state={connectionStatus}>
          {t[connectionStatus]}
        </StatusBadge>
      </div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          connect();
        }}
      >
        <label htmlFor="server-url">{t.serverUrl}</label>
        <input
          id="server-url"
          dir="ltr"
          type="text"
          inputMode="url"
          spellCheck="false"
          value={webSocketUrl}
          onChange={(event) => setWebSocketUrl(event.target.value)}
          disabled={connectionStatus !== 'disconnected'}
          aria-describedby="url-hint"
          required
        />
        <p id="url-hint" className="hint">
          {t.urlHint}
        </p>
        <div className="button-row">
          <button
            className="primary"
            disabled={connectionStatus !== 'disconnected'}
          >
            {t.connect}
          </button>
          <button
            type="button"
            className="secondary"
            onClick={disconnect}
            disabled={connectionStatus === 'disconnected'}
          >
            {t.disconnect}
          </button>
        </div>
      </form>
      {error && (
        <div className="error" role="alert">
          <strong>{t[error] || t.connectFailed}</strong>
          {['connectFailed', 'connectionLost', 'invalidUrl'].includes(
            error,
          ) && (
            <ul>
              {t.checkConnection.map((text) => (
                <li key={text}>{text}</li>
              ))}
            </ul>
          )}
        </div>
      )}
      <div className="device-status" role="status">
        <h3>{t.espStatus}</h3>
        <StatusBadge state={deviceOnline ? 'connected' : 'disconnected'}>
          {connectionStatus === 'connected'
            ? deviceOnline
              ? t.online
              : t.offline
            : t.unknown}
        </StatusBadge>
        <p className="hint">{t.deviceHint}</p>
        {lastSeen && (
          <p className="hint">
            {t.lastSeen}:{' '}
            <bdi dir="ltr">
              {new Date(lastSeen).toLocaleTimeString(language, {
                hour12: false,
              })}
            </bdi>
          </p>
        )}
      </div>
    </section>
  );
}
