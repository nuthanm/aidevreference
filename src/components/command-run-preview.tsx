"use client";

import Link from "next/link";
import { type CommandRunPreviewData, previewKindLabel } from "@/lib/command-run-preview";

export function CommandRunPreview({
  preview,
  tool,
}: {
  preview: CommandRunPreviewData;
  tool: "claude" | "cursor" | "copilot";
}) {
  return (
    <div
      className={`cmd-run-preview cmd-run-preview-${tool}`}
      aria-label={`Simulated output for ${preview.promptLine}`}
    >
      <div className="cmd-run-preview-chrome">
        <span className="cmd-run-preview-chrome-label">{preview.surfaceLabel}</span>
        <span className="cmd-run-preview-chrome-kind">{previewKindLabel(preview.previewKind)}</span>
      </div>

      <div className="cmd-run-preview-inner">
        <div className="cmd-run-preview-prompt-row">
          <span className="cmd-run-preview-prompt-glyph">›</span>
          <code className="cmd-run-preview-prompt-line">{preview.promptLine}</code>
        </div>

        <div className="cmd-run-preview-sim-badge">Simulated output</div>

        <div className="cmd-run-preview-title">{preview.title}</div>
        <p className="cmd-run-preview-desc">{preview.description}</p>

        {preview.status?.length ? (
          <div className="cmd-run-preview-status">
            {preview.status.map((row) => (
              <div className="cmd-run-preview-status-row" key={`${row.label}-${row.value}`}>
                <span className="cmd-run-preview-status-label">{row.label}:</span>{" "}
                <span className={row.warn ? "cmd-run-preview-warn" : "cmd-run-preview-value"}>{row.value}</span>
              </div>
            ))}
          </div>
        ) : null}

        {preview.menuItems?.length ? (
          <ul className="cmd-run-preview-menu">
            {preview.menuItems.map((item) => (
              <li
                key={item.label}
                className={[
                  "cmd-run-preview-menu-item",
                  item.active ? "active" : "",
                  item.muted ? "muted" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {item.active ? "› " : "  "}
                {item.label}
              </li>
            ))}
          </ul>
        ) : null}

        {preview.steps?.length ? (
          <div className="cmd-run-preview-steps">
            <div className="cmd-run-preview-section-label">What happens</div>
            <ol>
              {preview.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>
        ) : null}

        {preview.promptUsage ? (
          <div className="cmd-run-preview-usage">
            <span className="cmd-run-preview-section-label">Usage:</span> {preview.promptUsage}
          </div>
        ) : null}

        {preview.cliUsage ? (
          <div className="cmd-run-preview-usage">
            <span className="cmd-run-preview-section-label">CLI:</span> {preview.cliUsage}
          </div>
        ) : null}

        {preview.notes?.map((note) => (
          <p className="cmd-run-preview-note" key={note}>
            {note}
          </p>
        ))}

        {preview.docsUrl ? (
          <div className="cmd-run-preview-docs">
            Learn more:{" "}
            <Link href={preview.docsUrl} target="_blank" rel="noopener noreferrer">
              {preview.docsUrl}
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}
