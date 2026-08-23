"use client";

import { useEffect, useState } from "react";

export type SiteLocale = "en" | "zh" | "ko";

export const SITE_LOCALE_KEY = "write-hsk-language";
export const SITE_LOCALE_EVENT = "write-hsk-language-change";

export function getSiteLocale(): SiteLocale {
  if (typeof window === "undefined") return "en";
  const saved = window.localStorage.getItem(SITE_LOCALE_KEY);
  return saved === "zh" || saved === "ko" ? saved : "en";
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
