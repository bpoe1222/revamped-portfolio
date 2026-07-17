import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  AQUA_EASTER_EGG_STORAGE_KEY,
  PortfolioAquaEasterEgg,
} from "@/components/portfolio-aqua-easter-egg";

const trigger = (keys = "easteregg", target: Document | Element = document) => {
  for (const key of keys) fireEvent.keyDown(target, { key });
};

describe("portfolio Aqua easter egg", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    vi.spyOn(document, "hasFocus").mockReturnValue(true);
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      value: "visible",
    });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("toggles case-insensitively, persists for the session, and announces state", () => {
    const { container, unmount } = render(
      <PortfolioAquaEasterEgg>
        <main>Portfolio</main>
      </PortfolioAquaEasterEgg>,
    );
    const boundary = container.firstElementChild;

    trigger("EaStErEgG");
    expect(boundary).toHaveAttribute("data-theme", "aqua-2000");
    expect(screen.getByRole("status")).toHaveTextContent("Aqua mode activated");
    expect(window.sessionStorage.getItem(AQUA_EASTER_EGG_STORAGE_KEY)).toBe(
      "true",
    );

    trigger();
    expect(boundary).not.toHaveAttribute("data-theme");
    expect(screen.getByRole("status")).toHaveTextContent("Aqua mode disabled");
    expect(
      window.sessionStorage.getItem(AQUA_EASTER_EGG_STORAGE_KEY),
    ).toBeNull();

    unmount();
    trigger();
    expect(
      window.sessionStorage.getItem(AQUA_EASTER_EGG_STORAGE_KEY),
    ).toBeNull();
  });

  it("removes the non-modal status after approximately 2.5 seconds", () => {
    vi.useFakeTimers();
    const { container } = render(
      <PortfolioAquaEasterEgg>
        <main>Portfolio</main>
      </PortfolioAquaEasterEgg>,
    );

    trigger();
    expect(screen.getByRole("status")).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(2_500));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(container.firstElementChild).toHaveAttribute(
      "data-theme",
      "aqua-2000",
    );
  });

  it("restores an active theme after remounting without announcing it", () => {
    window.sessionStorage.setItem(AQUA_EASTER_EGG_STORAGE_KEY, "true");
    const { container } = render(
      <PortfolioAquaEasterEgg>
        <main>Another portfolio route</main>
      </PortfolioAquaEasterEgg>,
    );

    expect(container.firstElementChild).toHaveAttribute(
      "data-theme",
      "aqua-2000",
    );
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("does not overwrite the existing light or dark mode setting", () => {
    document.documentElement.dataset.theme = "dark";
    const { container } = render(
      <PortfolioAquaEasterEgg>
        <main>Portfolio</main>
      </PortfolioAquaEasterEgg>,
    );

    trigger();
    expect(container.firstElementChild).toHaveAttribute(
      "data-theme",
      "aqua-2000",
    );
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
    trigger();
    expect(container.firstElementChild).not.toHaveAttribute("data-theme");
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
  });

  it("rejects partial, incorrect, and delayed sequences", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));
    const { container } = render(
      <PortfolioAquaEasterEgg>
        <main>Portfolio</main>
      </PortfolioAquaEasterEgg>,
    );
    const boundary = container.firstElementChild;

    trigger("easter");
    expect(boundary).not.toHaveAttribute("data-theme");
    trigger("xegg");
    expect(boundary).not.toHaveAttribute("data-theme");

    trigger("easter");
    vi.advanceTimersByTime(2_001);
    trigger("egg");
    expect(boundary).not.toHaveAttribute("data-theme");
  });

  it("ignores forms, editable regions, editors, and dialogs", () => {
    const { container } = render(
      <PortfolioAquaEasterEgg>
        <input aria-label="Search" type="search" />
        <textarea aria-label="Message" />
        <div contentEditable suppressContentEditableWarning>
          Editable
        </div>
        <div className="cm-editor" tabIndex={0}>
          Editor
        </div>
        <section role="dialog" tabIndex={0} aria-label="Text dialog">
          Dialog
        </section>
      </PortfolioAquaEasterEgg>,
    );
    const boundary = container.firstElementChild;

    trigger("easteregg", screen.getByLabelText("Search"));
    trigger("easteregg", screen.getByLabelText("Message"));
    trigger("easteregg", screen.getByText("Editable"));
    trigger("easteregg", screen.getByText("Editor"));
    trigger("easteregg", screen.getByRole("dialog"));
    expect(boundary).not.toHaveAttribute("data-theme");
  });

  it("ignores modified keys and does not prevent ordinary typing", () => {
    const { container } = render(
      <PortfolioAquaEasterEgg>
        <main>Portfolio</main>
      </PortfolioAquaEasterEgg>,
    );
    const boundary = container.firstElementChild;

    for (const modifier of ["ctrlKey", "altKey", "metaKey"] as const) {
      for (const key of "easteregg") {
        const result = fireEvent.keyDown(document, { key, [modifier]: true });
        expect(result).toBe(true);
      }
    }
    expect(boundary).not.toHaveAttribute("data-theme");

    const result = fireEvent.keyDown(document, { key: "a" });
    expect(result).toBe(true);
    expect(boundary).not.toHaveAttribute("data-theme");
  });

  it("does not listen while the document is hidden or unfocused", () => {
    const { container } = render(
      <PortfolioAquaEasterEgg>
        <main>Portfolio</main>
      </PortfolioAquaEasterEgg>,
    );
    const boundary = container.firstElementChild;

    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      value: "hidden",
    });
    trigger();
    expect(boundary).not.toHaveAttribute("data-theme");

    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      value: "visible",
    });
    vi.mocked(document.hasFocus).mockReturnValue(false);
    trigger();
    expect(boundary).not.toHaveAttribute("data-theme");
  });
});
