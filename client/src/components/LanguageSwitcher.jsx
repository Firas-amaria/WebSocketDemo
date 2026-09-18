export default function LanguageSwitcher({ language, setLanguage, t }) {
  return (
    <div
      className="language-switch"
      role="group"
      aria-label={t.language}
      dir="ltr"
    >
      <button
        lang="en"
        aria-pressed={language === 'en'}
        onClick={() => setLanguage('en')}
      >
        English
      </button>
      <button
        lang="ar"
        aria-pressed={language === 'ar'}
        onClick={() => setLanguage('ar')}
      >
        العربية
      </button>
    </div>
  );
}
