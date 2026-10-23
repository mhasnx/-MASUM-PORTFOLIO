"use client";

import { useEffect, useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";

function getIsDark(): boolean {
  const explicitTheme = document.documentElement.dataset.theme;

  if (explicitTheme === "light" || explicitTheme === "dark") {
    return explicitTheme === "dark";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function subscribeToTheme(onChange: () => void) {
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  mediaQuery.addEventListener("change", onChange);
  window.addEventListener("storage", onChange);
  document.addEventListener("portfolio-theme-change", onChange);

  return () => {
    mediaQuery.removeEventListener("change", onChange);
    window.removeEventListener("storage", onChange);
    document.removeEventListener("portfolio-theme-change", onChange);
  };
}

export function ThemeToggle({
  defaultTheme = "system",
}: {
  defaultTheme?: "light" | "dark" | "system";
}) {
  const isDark = useSyncExternalStore(subscribeToTheme, getIsDark, () => false);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("portfolio-theme");
    if (savedTheme === "light" || savedTheme === "dark") {
      return;
    }
    if (defaultTheme === "system") {
      document.documentElement.removeAttribute("data-theme");
    } else {
      document.documentElement.dataset.theme = defaultTheme;
    }
    document.dispatchEvent(new Event("portfolio-theme-change"));
  }, [defaultTheme]);

  function toggleTheme() {
    const nextTheme = isDark ? "light" : "dark";
    document.documentElement.dataset.theme = nextTheme;
    window.localStorage.setItem("portfolio-theme", nextTheme);
    document.dispatchEvent(new Event("portfolio-theme-change"));
  }

  return (
    <button
      aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
      aria-pressed={isDark}
      className="theme-toggle"
      onClick={toggleTheme}
      type="button"
    >
      {isDark ? (
        <Sun aria-hidden="true" size={16} />
      ) : (
        <Moon aria-hidden="true" size={16} />
      )}
    </button>
  );
}
