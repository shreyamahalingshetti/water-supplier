import React, { createContext, useContext, useState, useCallback } from 'react';

const LanguageContext = createContext(null);

/**
 * LanguageProvider — wraps customer-facing pages.
 * Reads / persists language choice in localStorage.
 */
export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(
    () => localStorage.getItem('jalSeva_lang') || 'en'
  );

  const toggleLanguage = useCallback(() => {
    setLanguage(prev => {
      const next = prev === 'en' ? 'kn' : 'en';
      localStorage.setItem('jalSeva_lang', next);
      return next;
    });
  }, []);

  const setLang = useCallback((lang) => {
    localStorage.setItem('jalSeva_lang', lang);
    setLanguage(lang);
  }, []);

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

/** Hook — use inside any customer page */
export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside <LanguageProvider>');
  return ctx;
}

export default LanguageContext;
