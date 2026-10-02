export type Locale = "en" | "es";

export const LOCALE_COOKIE = "ctx800-locale";

export function parseLocale(value: string | undefined | null): Locale {
  return value === "es" ? "es" : "en";
}

export function localeCookie(locale: Locale) {
  return `${LOCALE_COOKIE}=${locale}; Path=/; Max-Age=31536000; SameSite=Lax`;
}
