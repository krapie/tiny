"use client";

import { useState, useEffect } from "react";

function TinyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="14" height="14">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.69a4.5 4.5 0 016.36 6.36l-3.18 3.18a4.5 4.5 0 01-6.36-6.36m6.36-3.18l-3.18 3.18m-3.18 3.18l-3.18 3.18a4.5 4.5 0 01-6.36-6.36l3.18-3.18a4.5 4.5 0 016.36 0" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="16" height="16">
      <circle cx="12" cy="12" r="4" />
      <path strokeLinecap="round" d="M12 3v1.5M12 19.5V21M3 12h1.5M19.5 12H21M5.6 5.6l1.06 1.06M17.34 17.34l1.06 1.06M5.6 18.4l1.06-1.06M17.34 6.66l1.06-1.06" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="16" height="16">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z" />
    </svg>
  );
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

interface Result {
  code: string;
  short_url: string;
  original_url: string;
  clicks: number;
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  async function handleShorten(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/shorten`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, code: customCode || undefined }),
      });
      if (!res.ok) {
        const text = await res.text();
        setError(text.trim() || "Something went wrong");
        return;
      }
      setResult(await res.json());
    } catch {
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!result) return;
    await navigator.clipboard.writeText(result.short_url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownloadQR() {
    if (!result) return;
    const a = document.createElement("a");
    a.href = `${API_URL}/api/qr/${result.code}`;
    a.download = `qr-${result.code}.png`;
    a.click();
  }

  return (
    <main className="tiny-page">
      <div className="tiny-card">
        <div className="tiny-header">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span className="tiny-app-icon">
              <TinyIcon />
            </span>
            <span className="tiny-title">Tiny</span>
          </div>
          <button
            className="theme-toggle"
            onClick={() => setTheme((t) => t === "light" ? "dark" : "light")}
            aria-label="toggle theme"
            title="toggle theme"
          >
            {theme === "dark" ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>

        <form onSubmit={handleShorten} className="tiny-form">
          <input
            type="url"
            placeholder="https://example.com/very-long-url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            className="kp-input"
          />
          <input
            type="text"
            placeholder="custom code (optional)"
            value={customCode}
            onChange={(e) => setCustomCode(e.target.value)}
            pattern="[a-zA-Z0-9-]{1,20}"
            title="Alphanumeric and hyphens only, max 20 chars"
            className="kp-input"
            style={{ fontFamily: "var(--kp-font-mono)", letterSpacing: "var(--kp-tracking-mono)" }}
          />
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "Shortening…" : "Shorten URL"}
          </button>
        </form>

        {error && <p className="tiny-error">{error}</p>}

        {result && (
          <div className="tiny-result">
            <div className="tiny-result-row">
              <div style={{ minWidth: 0 }}>
                <a
                  href={result.short_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tiny-short-url"
                >
                  {result.short_url}
                </a>
                <p className="tiny-original-url">{result.original_url}</p>
              </div>
              <button onClick={handleCopy} className="btn-secondary" style={{ flexShrink: 0 }}>
                {copied ? "Copied" : "Copy"}
              </button>
            </div>

            <div className="tiny-qr-wrap">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${API_URL}/api/qr/${result.code}`}
                alt={`QR code for ${result.short_url}`}
                width={160}
                height={160}
              />
              <button onClick={handleDownloadQR} className="tiny-download-link">
                Download QR
              </button>
            </div>

            <p className="tiny-clicks">
              {result.clicks} click{result.clicks !== 1 ? "s" : ""}
            </p>
          </div>
        )}

        <footer className="tiny-footer">
          <a href="https://kevinprk.com" style={{ color: "inherit" }}>← kevinprk.com</a>
          <span className="pi" title="3.14">π</span>
        </footer>
      </div>
    </main>
  );
}
