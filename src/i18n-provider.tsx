"use client";

import React, { ReactNode, useState, useEffect } from "react";
import { NextIntlClientProvider } from "next-intl";
import en from "@/src/i18n/messages/en.json";
import vi from "@/src/i18n/messages/vi.json";

type Locale = "en" | "vi";
const messages = { en, vi };

export const I18nContext = React.createContext<{
  locale: Locale;
  switchLocale: (locale?: Locale) => void;
}>({ locale: "en", switchLocale: () => {} });

export default function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("en");

  useEffect(() => {
    const saved = localStorage.getItem("locale") as Locale | null;
    if (saved && (saved === "en" || saved === "vi")) {
      setLocale(saved);
    }
  }, []);

  const switchLocale = (nextLocale?: Locale) => {
    const next = nextLocale || (locale === "en" ? "vi" : "en");
    setLocale(next);
    localStorage.setItem("locale", next);
  };

  return (
    <I18nContext.Provider value={{ locale, switchLocale }}>
      <NextIntlClientProvider locale={locale} messages={messages[locale]}>
        {children}
      </NextIntlClientProvider>
    </I18nContext.Provider>
  );
}
