"use client";

import { ChevronDown, ChevronUp, Keyboard } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export function ScrollNav({ onOpenShortcuts }: { onOpenShortcuts?: () => void }) {
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

  const update = useCallback(() => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    setCanScrollUp(window.scrollY > 120);
    setCanScrollDown(maxScroll > 120 && window.scrollY < maxScroll - 120);
    setShowShortcuts(window.scrollY > 120);
  }, []);

  useEffect(() => {
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [update]);

  const showStack = (showShortcuts && onOpenShortcuts) || canScrollUp || canScrollDown;
  if (!showStack) return null;

  return (
    <div className="scroll-nav" aria-label="Page scroll">
      {showShortcuts && onOpenShortcuts ? (
        <button
          type="button"
          className="scroll-nav-btn scroll-nav-shortcuts"
          onClick={onOpenShortcuts}
          aria-label="Keyboard shortcuts"
          title="Keyboard shortcuts"
        >
          <Keyboard size={18} />
        </button>
      ) : null}
      {canScrollUp ? (
        <button
          type="button"
          className="scroll-nav-btn"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Scroll to top"
          title="Top"
        >
          <ChevronUp size={18} />
        </button>
      ) : null}
      {canScrollDown ? (
        <button
          type="button"
          className="scroll-nav-btn"
          onClick={() =>
            window.scrollTo({
              top: document.documentElement.scrollHeight,
              behavior: "smooth",
            })
          }
          aria-label="Scroll to bottom"
          title="Bottom"
        >
          <ChevronDown size={18} />
        </button>
      ) : null}
    </div>
  );
}
