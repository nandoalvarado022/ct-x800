"use client";

import { createContext, useContext } from "react";
import { useRouter } from "next/navigation";
import { localeCookie, type Locale } from "@/lib/locale";
import { messages, type Messages } from "@/lib/messages";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  m: Messages;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const router = useRouter();

  function setLocale(next: Locale) {
    if (next === locale) return;
    document.cookie = localeCookie(next);
    router.refresh();
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale, m: messages[locale] }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useI18n() {
  const value = useContext(LocaleContext);
  if (!value) {
    throw new Error("useI18n must be used within LocaleProvider");
  }
  return value;
}
