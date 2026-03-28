"use client";

import { useState, useCallback } from "react";
import { locales, type Locale, localeNames, localeFlags } from "@/i18n/config";

// Cache de traducciones
const translationsCache: Record<Locale, Record<string, unknown>> = {
  en: {},
  es: {},
  pt: {}
};

// Cargar traducciones
async function loadTranslations(locale: Locale): Promise<Record<string, unknown>> {
  if (Object.keys(translationsCache[locale]).length > 0) {
    return translationsCache[locale];
  }
  
  const translations = (await import(`@/locales/${locale}.json`)).default;
  translationsCache[locale] = translations;
  return translations;
}

export function useLocale() {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [translations, setTranslations] = useState<Record<string, unknown>>({});

  // Cambiar idioma
  const setLocale = useCallback(async (newLocale: Locale) => {
    setLocaleState(newLocale);
    
    // Guardar en cookie
    document.cookie = `locale=${newLocale};path=/;max-age=31536000`;
    
    // Cargar traducciones
    const trans = await loadTranslations(newLocale);
    setTranslations(trans);
    
    // Recargar página para aplicar cambios
    window.location.reload();
  }, []);

  // Obtener traducción
  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    const keys = key.split(".");
    let value: unknown = translations;
    
    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        return key; // Devolver la clave si no se encuentra la traducción
      }
    }
    
    if (typeof value !== "string") {
      return key;
    }
    
    // Reemplazar parámetros
    if (params) {
      let result = value;
      for (const [paramKey, paramValue] of Object.entries(params)) {
        result = result.replace(new RegExp(`\\{${paramKey}\\}`, "g"), String(paramValue));
      }
      return result;
    }
    
    return value;
  }, [translations]);

  // Inicializar
  const initLocale = useCallback(async () => {
    // Obtener locale de cookie o navegador
    const cookieMatch = document.cookie.match(/locale=([^;]+)/);
    let initialLocale: Locale = "en";
    
    if (cookieMatch && locales.includes(cookieMatch[1] as Locale)) {
      initialLocale = cookieMatch[1] as Locale;
    } else {
      // Detectar idioma del navegador
      const browserLang = navigator.language.split("-")[0];
      if (locales.includes(browserLang as Locale)) {
        initialLocale = browserLang as Locale;
      }
    }
    
    setLocaleState(initialLocale);
    const trans = await loadTranslations(initialLocale);
    setTranslations(trans);
  }, []);

  return {
    locale,
    setLocale,
    t,
    initLocale,
    locales,
    localeNames,
    localeFlags
  };
}

// Exportar tipos y constantes
export { type Locale, locales, localeNames, localeFlags };
