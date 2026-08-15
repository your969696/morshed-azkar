import { createContext, useContext, useState, useEffect } from "react";
import { translations } from './i18n-data.js';

const LangContext = createContext({ lang: "ar", setLang: () => {}, t: translations.ar });

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    try { return localStorage.getItem("app_lang") || "ar"; } catch { return "ar"; }
  });

  const setLang = (l) => {
    setLangState(l);
    try { localStorage.setItem("app_lang", l); } catch {}
    document.documentElement.dir = translations[l]?.dir || "rtl";
    document.documentElement.lang = l;
  };

  useEffect(() => {
    document.documentElement.dir = translations[lang]?.dir || "rtl";
    document.documentElement.lang = lang;
  }, [lang]);

  const t = translations[lang] || translations.ar;
  return <LangContext.Provider value={{ lang, setLang, t }}>{children}</LangContext.Provider>;
}

export function useTranslation() { return useContext(LangContext); }

export function LanguageSwitcher({ className = "" }) {
  const { lang, setLang, t } = useTranslation();
  const langs = ["ar", "en", "es"];
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
      {langs.map(l => {
        const active = lang === l;
        return (
          <button key={l} onClick={() => setLang(l)} style={{
            padding: '10px 20px', borderRadius: 14,
            border: active ? '1px solid rgba(0,200,150,0.5)' : '1px solid rgba(255,255,255,0.1)',
            background: active ? 'rgba(0,200,150,0.15)' : 'rgba(255,255,255,0.05)',
            color: active ? '#00c896' : 'rgba(255,255,255,0.5)',
            fontSize: 13, fontWeight: 700, cursor: 'pointer',
            fontFamily: translations[l]?.font || "'Cairo', sans-serif",
            transition: 'all 0.2s',
            flex: 1, textAlign: 'center',
          }}>
            {l === 'ar' ? '🇸🇦 العربية' : l === 'en' ? '🇺🇸 English' : '🇪🇸 Español'}
          </button>
        );
      })}
    </div>
  );
}
