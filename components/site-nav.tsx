"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

function initialTheme() {
  if (typeof window === "undefined") return "light";
  const stored = window.localStorage.getItem("theme");
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function SiteNav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [theme, setTheme] = useState(initialTheme);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    window.localStorage.setItem("theme", theme);
  }, [theme]);

  const nextTheme = theme === "dark" ? "light" : "dark";
  const isCurrentRoute = (href: string) => {
    if (href === "/#about") return pathname === "/";
    return !href.includes("#") && pathname === href;
  };

  return (
    <header className={`nav-container ${scrolled ? "scrolled" : ""}`}>
      <Link className="brand-mark" href="/" aria-label="Bailey Poe home">
        BP
      </Link>
      <p className="nav-descriptor">Quality Program Manager</p>
      <nav className="nav-links" aria-label="Primary navigation">
        {[
          ["About", "/#about"],
          ["Work", "/#work"],
          ["Experience", "/#experience"],
          ["Blog", "/blog"],
          ["Contact", "/contact"],
        ].map(([label, href]) => (
          <Link
            href={href}
            aria-current={isCurrentRoute(href) ? "page" : undefined}
            key={href}
          >
            {label}
          </Link>
        ))}
      </nav>
      <div className="nav-actions">
        <a
          className="resume-link"
          href="/resume"
          aria-current={pathname === "/resume" ? "page" : undefined}
        >
          Resume <span aria-hidden="true">→</span>
        </a>
        <button
          className="theme-toggle"
          type="button"
          onClick={() => setTheme(nextTheme)}
          aria-label={`Switch to ${nextTheme} theme`}
          aria-pressed={theme === "dark"}
        >
          <span aria-hidden="true" />
          {theme === "dark" ? "Light" : "Dark"}
        </button>
      </div>
    </header>
  );
}
