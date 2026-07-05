"use client";

import { Printer, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useRef } from "react";
import {
  KEYBOARD_SHORTCUTS,
  SHORTCUT_TOOL_ORDER,
  type ShortcutTool,
} from "@/lib/keyboard-shortcuts";
import { ToolIcon } from "@/components/tool-icon";

function ShortcutKeys({ value }: { value: string }) {
  if (value === "—") return <span className="shortcuts-empty">—</span>;

  if (value.includes(" or ") || value.includes(" at start") || value.includes("\\")) {
    return <span className="shortcuts-keys-text">{value}</span>;
  }

  const parts = value.split(/\s*\+\s*/);
  if (parts.length === 1) {
    return <kbd className="shortcuts-kbd">{value}</kbd>;
  }

  return (
    <span className="shortcuts-keys">
      {parts.map((part, index) => (
        <kbd key={`${part}-${index}`} className="shortcuts-kbd">
          {part}
        </kbd>
      ))}
    </span>
  );
}

export function KeyboardShortcutsModal({
  open,
  onClose,
  selectedTool,
  onSelectTool,
}: {
  open: boolean;
  onClose: () => void;
  selectedTool: ShortcutTool;
  onSelectTool: (tool: ShortcutTool) => void;
}) {
  const titleId = useId();
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const toolData = KEYBOARD_SHORTCUTS[selectedTool];

  function handlePrint() {
    window.print();
  }

  return (
    <>
      <div className="shortcuts-modal-backdrop" role="presentation" onClick={onClose}>
        <div
          className="shortcuts-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="shortcuts-modal-head">
            <h2 id={titleId}>Keyboard shortcuts</h2>
            <div className="shortcuts-modal-actions">
              <button type="button" className="shortcuts-print-btn" onClick={handlePrint}>
                <Printer size={14} />
                Print
              </button>
              <button type="button" className="shortcuts-modal-close" onClick={onClose} aria-label="Close">
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="shortcuts-tool-tabs" role="tablist" aria-label="Tools">
            {SHORTCUT_TOOL_ORDER.map((tool) => (
              <button
                key={tool}
                type="button"
                role="tab"
                aria-selected={selectedTool === tool}
                className={`shortcuts-tool-tab ${tool} ${selectedTool === tool ? "active" : ""}`}
                onClick={() => onSelectTool(tool)}
              >
                <ToolIcon tool={tool} size={14} />
                {KEYBOARD_SHORTCUTS[tool].label}
              </button>
            ))}
          </div>

          <div className="shortcuts-modal-body" ref={printRef}>
            <div className="shortcuts-print-root">
              <p className="shortcuts-source">
                Sourced from{" "}
                <Link href={toolData.sourceUrl} target="_blank" rel="noreferrer">
                  {toolData.sourceLabel}
                </Link>
                . Shortcuts may vary by OS, IDE, or remapped keybindings.
              </p>

              {toolData.sections.map((section) => (
                <section key={section.title} className="shortcuts-section">
                  <h3 className="shortcuts-section-title">{section.title}</h3>
                  <table className="shortcuts-table">
                    <thead>
                      <tr>
                        <th scope="col">Action</th>
                        <th scope="col">Mac</th>
                        <th scope="col">Win / Linux</th>
                      </tr>
                    </thead>
                    <tbody>
                      {section.shortcuts.map((row) => (
                        <tr key={`${section.title}-${row.action}`}>
                          <td>{row.action}</td>
                          <td>
                            <ShortcutKeys value={row.mac} />
                          </td>
                          <td>
                            <ShortcutKeys value={row.winLinux} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </section>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
