import { useEffect, useRef, useState } from 'react';
import en from './translations/en.js';
import ar from './translations/ar.js';
import LanguageSwitcher from './components/LanguageSwitcher.jsx';
import HomePage from './pages/HomePage.jsx';
import ClassroomPage from './pages/ClassroomPage.jsx';
import LearnPage from './pages/LearnPage.jsx';
import { createWebSocketClient } from './websocket/websocketClient.js';

const initialSession = {
  connectionStatus: 'disconnected',
  deviceOnline: false,
  lastSeen: null,
  messages: [],
  rawMessages: [],
  error: '',
  sent: false,
};
function currentPage() {
  return ['classroom', 'learn'].includes(location.hash.slice(1))
    ? location.hash.slice(1)
    : 'home';
}

export default function App() {
  const [language, setLanguage] = useState(() => {
    try {
      return localStorage.getItem('classroom-language') === 'ar' ? 'ar' : 'en';
    } catch {
      return 'en';
    }
  });
  const [page, setPage] = useState(currentPage);
  const [session, setSession] = useState(initialSession);
  const [webSocketUrl, setWebSocketUrl] = useState(
    `ws://${location.hostname || 'localhost'}:8080`,
  );
  const connection = useRef(null);
  const messageId = useRef(0);
  const t = language === 'ar' ? ar : en;

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    try {
      localStorage.setItem('classroom-language', language);
    } catch {
      /* Language still works without storage. */
    }
  }, [language]);
  useEffect(() => {
    const navigate = () => {
      setPage(currentPage());
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', navigate);
    return () => window.removeEventListener('hashchange', navigate);
  }, []);

  // The connection lives above the pages so navigating to Learn does not disconnect it.
  useEffect(() => {
    connection.current = createWebSocketClient({
      onStatus: (connectionStatus) =>
        setSession((previous) => ({
          ...previous,
          connectionStatus,
          deviceOnline: false,
          sent: false,
        })),
      onError: (error) =>
        setSession((previous) => ({ ...previous, error, sent: false })),
      onMessage: (data, raw) => {
        const id = ++messageId.current;
        setSession((previous) => {
          const next = {
            ...previous,
            rawMessages: [...previous.rawMessages, raw].slice(-100),
          };
          if (data.type === 'status') {
            next.deviceOnline = data.online;
            if (!data.online) next.sent = false;
            next.lastSeen = data.lastSeen;
          }
          if (data.type === 'error') {
            next.error = data.code;
            next.sent = false;
          }
          if (data.type === 'message' || data.type === 'sent') {
            next.messages = [
              ...previous.messages,
              {
                id,
                text: data.message,
                time: data.time || new Date().toISOString(),
                direction: data.type === 'sent' ? 'outgoing' : 'incoming',
              },
            ].slice(-100);
            if (data.type === 'message') next.lastSeen = data.time;
            if (data.type === 'sent') {
              next.sent = true;
              next.error = '';
            }
          }
          return next;
        });
      },
    });
    return () => connection.current.disconnect();
  }, []);

  function connect() {
    setSession((previous) => ({ ...previous, error: '', lastSeen: null }));
    connection.current.connect(webSocketUrl.trim());
  }
  function disconnect() {
    connection.current.disconnect();
    setSession((previous) => ({ ...previous, error: '' }));
  }
  function sendMessage(message) {
    const sent = connection.current.sendMessage(message);
    if (!sent) setSession((previous) => ({ ...previous, error: 'sendFailed' }));
    return sent;
  }
  return (
    <div className="app-shell">
      <a
        href="#main"
        className="skip-link"
        onClick={(event) => {
          event.preventDefault();
          document.getElementById('main').focus();
        }}
      >
        {language === 'ar' ? 'انتقل إلى المحتوى' : 'Skip to content'}
      </a>
      <header className="site-header">
        <a className="brand" href="#home">
          <span className="brand-mark" aria-hidden="true">
            ↔
          </span>
          <span>
            {t.brand}
            <small>{t.motto}</small>
          </span>
        </a>
        <nav
          aria-label={language === 'ar' ? 'التنقل الرئيسي' : 'Main navigation'}
        >
          {['home', 'classroom', 'learn'].map((name) => (
            <a
              key={name}
              href={`#${name}`}
              aria-current={page === name ? 'page' : undefined}
            >
              {t[name]}
            </a>
          ))}
        </nav>
        <LanguageSwitcher {...{ language, setLanguage, t }} />
      </header>
      <main id="main" tabIndex="-1">
        {page === 'home' && <HomePage t={t} />}
        {page === 'classroom' && (
          <ClassroomPage
            {...{
              t,
              session,
              webSocketUrl,
              setWebSocketUrl,
              connect,
              disconnect,
              sendMessage,
              language,
            }}
            clearSent={() =>
              setSession((previous) => ({ ...previous, sent: false }))
            }
            clearMessages={() =>
              setSession((previous) => ({
                ...previous,
                messages: [],
                rawMessages: [],
              }))
            }
          />
        )}
        {page === 'learn' && <LearnPage t={t} />}
      </main>
      <footer>
        <span>{t.footer}</span>
        <span dir="ltr">ESP32 / WebSocket</span>
      </footer>
    </div>
  );
}
