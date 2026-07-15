"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

function initialTheme() {
  if (typeof window === "undefined") return "light";
  const stored = window.localStorage.getItem("theme");
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function SiteNav() {
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

  return (
    <header className={`nav-container ${scrolled ? "scrolled" : ""}`}>
      <Link className="brand-mark" href="/" aria-label="Bailey Poe home">
        BP
      </Link>
      <p className="nav-descriptor">Quality Program Manager</p>
      <nav className="nav-links" aria-label="Primary navigation">
        <Link href="/#about">About</Link>
        <Link href="/#work">Work</Link>
        <Link href="/#experience">Experience</Link>
        <Link href="/blog">Blog</Link>
        <Link href="/#contact">Contact</Link>
      </nav>
      <div className="nav-actions">
        <a className="resume-link" href="/resume">
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
