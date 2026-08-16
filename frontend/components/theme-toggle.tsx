"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect } from "react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const dark = resolvedTheme === "dark";

  // Keep the mobile browser chrome in sync with the active palette.
  useEffect(() => {
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", dark ? "#0a0f1b" : "#f8fafc");
  }, [dark]);

  const toggle = () => {
    const root = document.documentElement;
    root.classList.add("theme-switching");
    setTheme(dark ? "light" : "dark");
    window.setTimeout(() => root.classList.remove("theme-switching"), 340);
  };

  return (
    <button
      type="button"
      className="icon-button theme-toggle-button"
      aria-label={dark ? "Chuyển sang chế độ sáng" : "Chuyển sang chế độ tối"}
      aria-pressed={dark}
      onClick={toggle}
    >
      <span className="theme-toggle-track">
        <Sun size={13} className={dark ? "theme-icon-dim" : "theme-icon-hot"} />
        <Moon size={13} className={dark ? "theme-icon-hot" : "theme-icon-dim"} />
      </span>
    </button>
  );
}
