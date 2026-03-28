import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

export const locales = ["en", "es", "pt"] as const;
export type Locale = (typeof locales)[number];

export const localeNames: Record<Locale, string> = {
  en: "English",
  es: "Español",
  pt: "Português"
};

export const localeFlags: Record<Locale, string> = {
  en: "🇺🇸",
  es: "🇪🇸",
  pt: "🇧🇷"
};

export default getRequestConfig(async () => {
  // Try to get locale from cookie, default to 'en'
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get("locale");
  const locale: Locale = locales.includes(localeCookie?.value as Locale) 
    ? (localeCookie?.value as Locale) 
    : "en";

  return {
    locale,
    messages: (await import(`./locales/${locale}.json`)).default
  };
});
