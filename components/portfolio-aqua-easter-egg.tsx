"use client";

import { useEffect, useRef, useState } from "react";

export const AQUA_EASTER_EGG_STORAGE_KEY =
  "baileypoe-portfolio-aqua-easter-egg";

const TRIGGER = "easteregg";
const SEQUENCE_TIMEOUT_MS = 2_000;
const STATUS_DURATION_MS = 2_500;
const TEXT_ENTRY_SELECTOR = [
  "input",
  "textarea",
  "select",
  '[contenteditable="true"]',
  '[contenteditable=""]',
  '[role="textbox"]',
  '[role="dialog"]',
  "dialog",
  ".CodeMirror",
  ".cm-editor",
  ".monaco-editor",
  "[data-code-editor]",
].join(",");

function isTextEntryTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) return false;
  if (target instanceof HTMLElement && target.isContentEditable) return true;
  return target.closest(TEXT_ENTRY_SELECTOR) !== null;
}

function readStoredState() {
  try {
    return (
      window.sessionStorage.getItem(AQUA_EASTER_EGG_STORAGE_KEY) === "true"
    );
  } catch {
    return false;
  }
}

function storeState(active: boolean) {
  try {
    if (active) {
      window.sessionStorage.setItem(AQUA_EASTER_EGG_STORAGE_KEY, "true");
    } else {
      window.sessionStorage.removeItem(AQUA_EASTER_EGG_STORAGE_KEY);
    }
  } catch {
    // The theme still works when storage is blocked by the browser.
  }
}

export function PortfolioAquaEasterEgg({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [active, setActive] = useState(false);
  const [status, setStatus] = useState<"activated" | "disabled" | null>(null);
  const activeRef = useRef(false);
  const sequenceRef = useRef("");
  const lastKeyTimeRef = useRef(0);
  const statusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const storedState = readStoredState();
    activeRef.current = storedState;
    setActive(storedState);
  }, []);

  useEffect(() => {
    const resetSequence = () => {
      sequenceRef.current = "";
      lastKeyTimeRef.current = 0;
    };

    const announce = (nextActive: boolean) => {
      if (statusTimerRef.current) clearTimeout(statusTimerRef.current);
      setStatus(nextActive ? "activated" : "disabled");
      statusTimerRef.current = setTimeout(
        () => setStatus(null),
        STATUS_DURATION_MS,
      );
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.ctrlKey ||
        event.altKey ||
        event.metaKey ||
        document.visibilityState !== "visible" ||
        !document.hasFocus()
      ) {
        return;
      }

      if (isTextEntryTarget(event.target)) {
        resetSequence();
        return;
      }

      if (event.key.length !== 1) {
        resetSequence();
        return;
      }

      const now = Date.now();
      if (now - lastKeyTimeRef.current > SEQUENCE_TIMEOUT_MS) {
        sequenceRef.current = "";
      }
      lastKeyTimeRef.current = now;

      const key = event.key.toLowerCase();
      const candidate = `${sequenceRef.current}${key}`;
      sequenceRef.current = TRIGGER.startsWith(candidate)
        ? candidate
        : TRIGGER.startsWith(key)
          ? key
          : "";

      if (sequenceRef.current !== TRIGGER) return;

      const nextActive = !activeRef.current;
      activeRef.current = nextActive;
      setActive(nextActive);
      storeState(nextActive);
      announce(nextActive);
      resetSequence();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      if (statusTimerRef.current) clearTimeout(statusTimerRef.current);
    };
  }, []);

  return (
    <div
      className="portfolio-boundary"
      data-site-layout="portfolio"
      data-theme={active ? "aqua-2000" : undefined}
    >
      {children}
      {status && (
        <div
          className="aqua-easter-egg-status"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          Aqua mode {status}
        </div>
      )}
    </div>
  );
}
