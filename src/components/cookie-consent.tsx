"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const CONSENT_KEY = "aidevreference-cookie-consent";

type ConsentValue = "accepted" | "essential";

function readConsent(): ConsentValue | null {
  try {
    const value = localStorage.getItem(CONSENT_KEY);
    if (value === "accepted" || value === "essential") return value;
  } catch {
    // localStorage may be unavailable
  }
  return null;
}

function writeConsent(value: ConsentValue) {
  try {
    localStorage.setItem(CONSENT_KEY, value);
  } catch {
    // ignore write failures
  }
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(readConsent() === null);
  }, []);

  function acceptAll() {
    writeConsent("accepted");
    setVisible(false);
  }

  function essentialOnly() {
    writeConsent("essential");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="cookie-consent" role="dialog" aria-label="Cookie consent" aria-live="polite">
      <div className="cookie-consent-inner">
        <p className="cookie-consent-text">
          We use cookies and similar technologies for essential site features, abuse prevention, and
          — when enabled — advertising and measurement (including Google AdSense). See our{" "}
          <Link href="/privacy-policy">Privacy Policy</Link> for details.
        </p>
        <div className="cookie-consent-actions">
          <button type="button" className="cookie-consent-btn secondary" onClick={essentialOnly}>
            Essential only
          </button>
          <button type="button" className="cookie-consent-btn primary" onClick={acceptAll}>
            Accept all
          </button>
        </div>
      </div>
    </div>
  );
}
