"use client";

import { X } from "lucide-react";
import { useEffect } from "react";
import { CopyButton } from "@/components/copy-button";

export function DetailModal({
  title,
  content,
  onClose,
}: {
  title: string;
  content: string;
  onClose: () => void;
}) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="detail-modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="detail-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="detail-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="detail-modal-head">
          <h4 id="detail-modal-title">{title}</h4>
          <div className="detail-modal-actions">
            <CopyButton text={content} label="Copy all content" className="copy-btn-lg" />
            <button type="button" className="detail-modal-close" onClick={onClose} aria-label="Close">
              <X size={16} />
            </button>
          </div>
        </div>
        <pre className="detail-modal-body">{content}</pre>
      </div>
    </div>
  );
}
