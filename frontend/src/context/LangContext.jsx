import { createContext, useContext, useState } from 'react';
import en from '../i18n/en';
import hi from '../i18n/hi';
import ne from '../i18n/ne';
import bh from '../i18n/bh';

const LANGS = [
  { code: 'en', label: 'EN',  name: 'English'   },
  { code: 'hi', label: 'हिं', name: 'Hindi'     },
  { code: 'ne', label: 'ने',  name: 'Nepali'    },
  { code: 'bh', label: 'भो',  name: 'Bhojpuri'  },
];

const translations = { en, hi, ne, bh };

const LangContext = createContext();

export function LangProvider({ children }) {
  const [langIndex, setLangIndex] = useState(0);

  const lang = LANGS[langIndex].code;
  const t    = translations[lang];

  const cycleLang = () => setLangIndex((i) => (i + 1) % LANGS.length);

  // Current label shows the NEXT language (so user knows what they'll switch to)
  const currentLabel = LANGS[langIndex].label;
  const nextLabel    = LANGS[(langIndex + 1) % LANGS.length].label;

  return (
    <LangContext.Provider value={{ lang, t, cycleLang, currentLabel, nextLabel, LANGS, langIndex }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
