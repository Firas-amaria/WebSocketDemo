import ConnectionPanel from '../components/ConnectionPanel.jsx';
import MessageSender from '../components/MessageSender.jsx';
import MessageLog from '../components/MessageLog.jsx';

export default function ClassroomPage({
  t,
  session,
  webSocketUrl,
  setWebSocketUrl,
  connect,
  disconnect,
  sendMessage,
  clearMessages,
  clearSent,
  language,
}) {
  return (
    <>
      <header className="page-heading">
        <p className="eyebrow">{t.motto}</p>
        <h1>{t.classroomIntro}</h1>
        <p>{t.classroomNote}</p>
      </header>
      <div className="classroom-grid">
        <ConnectionPanel
          {...{
            t,
            webSocketUrl,
            setWebSocketUrl,
            connect,
            disconnect,
            language,
          }}
          {...session}
        />
        <div className="conversation">
          <MessageSender
            {...{ t, sendMessage, clearSent }}
            sent={session.sent}
            canSend={
              session.connectionStatus === 'connected' && session.deviceOnline
            }
          />
          <MessageLog
            {...{ t, language, clearMessages }}
            messages={session.messages}
            rawMessages={session.rawMessages}
          />
        </div>
      </div>
    </>
  );
}
