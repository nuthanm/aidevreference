"use client";

import Link from "next/link";
import { type EntryRunPreviewData, previewKindLabel } from "@/lib/command-run-preview";

export function CommandRunPreview({
  preview,
  tool,
}: {
  preview: EntryRunPreviewData;
  tool: "claude" | "cursor" | "copilot";
}) {
  const kindLabel = previewKindLabel(preview.previewKind);

  return (
    <div
      className={`cmd-run-preview cmd-run-preview-${tool}`}
      aria-label={`Run guide for ${preview.name}`}
    >
      <div className="cmd-run-preview-chrome">
        <span className="cmd-run-preview-chrome-label">
          {preview.toolLabel} · {preview.entryKind}
        </span>
        <span className="cmd-run-preview-chrome-kind">{kindLabel}</span>
      </div>

      <div className="cmd-run-preview-inner">
        {preview.promptLine && preview.entryKind === "command" ? (
          <div className="cmd-run-preview-prompt-row">
            <span className="cmd-run-preview-prompt-glyph">›</span>
            <code className="cmd-run-preview-prompt-line">{preview.promptLine}</code>
          </div>
        ) : null}

        <section className="cmd-run-preview-section">
          <h4 className="cmd-run-preview-section-title">1. Name</h4>
          <div className="cmd-run-preview-name">{preview.name}</div>
        </section>

        <section className="cmd-run-preview-section">
          <h4 className="cmd-run-preview-section-title">2. Purpose</h4>
          <p className="cmd-run-preview-desc">{preview.purpose}</p>
        </section>

        <section className="cmd-run-preview-section">
          <h4 className="cmd-run-preview-section-title">3. Works on</h4>
          <div className="cmd-run-preview-surface-tags">
            {preview.surfaces.map((surface) => (
              <span className={`cmd-run-preview-surface-tag cmd-run-preview-surface-tag-${tool}`} key={surface}>
                {surface}
              </span>
            ))}
          </div>
          <p className="cmd-run-preview-tool-note">
            Catalog section: <strong>{preview.toolLabel}</strong>
            {preview.entryKind !== "command" ? ` · ${preview.entryKind}` : ""}
          </p>
        </section>

        <section className="cmd-run-preview-section">
          <h4 className="cmd-run-preview-section-title">4. Example</h4>
          <pre className="cmd-run-preview-example">{preview.example}</pre>
          {preview.usage && preview.usage !== preview.example ? (
            <div className="cmd-run-preview-usage">
              <span className="cmd-run-preview-section-label">Pattern:</span> {preview.usage}
            </div>
          ) : null}
          {preview.configPath ? (
            <div className="cmd-run-preview-config">
              <span className="cmd-run-preview-section-label">Configure in:</span>{" "}
              <code>{preview.configPath}</code>
            </div>
          ) : null}
          {preview.configExample ? (
            <pre className="cmd-run-preview-config-example">{preview.configExample}</pre>
          ) : null}
        </section>

        {preview.surfaceGuides.map((guide) => (
          <div className="cmd-run-preview-surface-block" key={guide.surface}>
            <div className="cmd-run-preview-surface-head">
              <span className="cmd-run-preview-surface-badge">{guide.surface}</span>
            </div>

            <section className="cmd-run-preview-section">
              <h4 className="cmd-run-preview-section-title">5. Where to access</h4>
              <p className="cmd-run-preview-body">{guide.whereToAccess}</p>
            </section>

            <section className="cmd-run-preview-section">
              <h4 className="cmd-run-preview-section-title">6. How to run</h4>
              <ol className="cmd-run-preview-steps-list">
                {guide.howToRun.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </section>

            <section className="cmd-run-preview-section">
              <h4 className="cmd-run-preview-section-title">7. What you&apos;ll see</h4>
              <p className="cmd-run-preview-body cmd-run-preview-output">{guide.expectedOutput}</p>
            </section>
          </div>
        ))}

        {preview.notes?.map((note) => (
          <p className="cmd-run-preview-note" key={note}>
            {note}
          </p>
        ))}

        {preview.docsUrl ? (
          <div className="cmd-run-preview-docs">
            Official docs:{" "}
            <Link href={preview.docsUrl} target="_blank" rel="noopener noreferrer">
              {preview.docsUrl}
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}
