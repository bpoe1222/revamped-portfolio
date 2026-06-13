import { useEffect, useState } from 'react';
import './navbar.scss';

const getStoredTheme = () => {
  try {
    const storedTheme = window.localStorage.getItem('theme');
    return storedTheme === 'light' || storedTheme === 'dark' ? storedTheme : null;
  } catch (error) {
    return null;
  }
};

const getSystemTheme = () =>
  window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

const getInitialTheme = () => {
  const storedTheme = getStoredTheme();

  if (storedTheme) {
    return storedTheme;
  }

  return document.documentElement.getAttribute('data-theme') || getSystemTheme();
};

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [theme, setTheme] = useState(getInitialTheme);
  const [hasManualTheme, setHasManualTheme] = useState(() => Boolean(getStoredTheme()));

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.style.colorScheme = theme;

    if (hasManualTheme) {
      try {
        window.localStorage.setItem('theme', theme);
      } catch (error) {
        return;
      }
    }
  }, [hasManualTheme, theme]);

  useEffect(() => {
    if (hasManualTheme) {
      return undefined;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const syncSystemTheme = (event) => {
      setTheme(event.matches ? 'dark' : 'light');
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', syncSystemTheme);
      return () => mediaQuery.removeEventListener('change', syncSystemTheme);
    }

    mediaQuery.addListener(syncSystemTheme);
    return () => mediaQuery.removeListener(syncSystemTheme);
  }, [hasManualTheme]);

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'));
    setHasManualTheme(true);
  };

  const nextTheme = theme === 'dark' ? 'light' : 'dark';

  return (
    <header className={`nav-container ${scrolled ? 'scrolled' : ''}`}>
      <a className="brand-mark" href="/" aria-label="Bailey Poe home">
        BP
      </a>

      <p className="nav-descriptor">Quality Program Manager</p>

      <nav className="nav-links" aria-label="Primary navigation">
        <a href="/#about">About</a>
        <a href="/#work">Work</a>
        <a href="/#experience">Experience</a>
        <a href="/#skills">Skills</a>
        <a href="/#contact">Contact</a>
      </nav>

      <div className="nav-actions">
        <a className="resume-link" href="/resume">
          Resume <span aria-hidden="true">→</span>
        </a>
        <button
          className="theme-toggle"
          type="button"
          onClick={toggleTheme}
          aria-label={`Switch to ${nextTheme} theme`}
          aria-pressed={theme === 'dark'}
        >
          <span aria-hidden="true" />
          {theme === 'dark' ? 'Light' : 'Dark'}
        </button>
      </div>
    </header>
  );
}

export default Nav;
