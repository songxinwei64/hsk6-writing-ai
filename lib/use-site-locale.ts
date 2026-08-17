"use client";

import { useEffect, useState } from "react";

export type SiteLocale = "en" | "zh";

export const SITE_LOCALE_KEY = "write-hsk-language";
export const SITE_LOCALE_EVENT = "write-hsk-language-change";

export function getSiteLocale(): SiteLocale {
  if (typeof window === "undefined") return "en";
  return window.localStorage.getItem(SITE_LOCALE_KEY) === "zh" ? "zh" : "en";
}

export function useSiteLocale() {
  const [locale, setLocale] = useState<SiteLocale>("en");

  useEffect(() => {
    const update = () => setLocale(getSiteLocale());
    update();
    window.addEventListener(SITE_LOCALE_EVENT, update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener(SITE_LOCALE_EVENT, update);
      window.removeEventListener("storage", update);
    };
  }, []);

  return locale;
}
