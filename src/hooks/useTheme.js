import Cookies from "js-cookie";
import { useCallback, useEffect, useState } from "react";

const COOKIE_NAME = "veroya-theme";
const DARK_META = "#0b0b0f";
const LIGHT_META = "#f8fafc";

const getSystemTheme = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";

const getSavedTheme = () => {
  if (typeof window === "undefined") return "light";
  const fromCookie = Cookies.get(COOKIE_NAME);
  if (fromCookie === "dark" || fromCookie === "light") return fromCookie;
  return document.documentElement.classList.contains("dark")
    ? "dark"
    : getSystemTheme();
};

const applyDomTheme = (theme) => {
  if (typeof document === "undefined") return;
  const isDark = theme === "dark";
  document.documentElement.classList.toggle("dark", isDark);
  document.documentElement.style.colorScheme = theme;

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute("content", isDark ? DARK_META : LIGHT_META);
  }
};

const saveThemeCookieNow = (theme) => {
  if (typeof document === "undefined") return;
  const maxAge = 60 * 60 * 24 * 365;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";

  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(theme)}; max-age=${maxAge}; path=/; SameSite=Lax${secure}`;
  Cookies.set(COOKIE_NAME, theme, {
    expires: 365,
    path: "/",
    sameSite: "lax",
    secure: window.location.protocol === "https:",
  });

  window.dispatchEvent(new Event("themeChange"));
};

export default function useTheme() {
  const [theme, setTheme] = useState(() => {
    const initial = getSavedTheme();
    applyDomTheme(initial);
    return initial;
  });

  useEffect(() => {
    const syncTheme = () => {
      const latest = getSavedTheme();
      applyDomTheme(latest);
      setTheme((prev) => (prev === latest ? prev : latest));
    };

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onSystemChange = () => {
      if (!Cookies.get(COOKIE_NAME)) {
        const sys = getSystemTheme();
        applyDomTheme(sys);
        setTheme(sys);
      }
    };

    window.addEventListener("themeChange", syncTheme);
    window.addEventListener("storage", syncTheme);
    mq.addEventListener("change", onSystemChange);

    return () => {
      window.removeEventListener("themeChange", syncTheme);
      window.removeEventListener("storage", syncTheme);
      mq.removeEventListener("change", onSystemChange);
    };
  }, []);

  const toggleTheme = useCallback(() => {
    const current = getSavedTheme();
    const next = current === "dark" ? "light" : "dark";

    applyDomTheme(next);
    saveThemeCookieNow(next);
    setTheme(next);
  }, []);

  return { theme, isDark: theme === "dark", toggleTheme };
}
