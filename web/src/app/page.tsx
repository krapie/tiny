"use client";

import { useState } from "react";

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
          <span className="tiny-pi-mark">π</span>
          <span className="tiny-title">Tiny</span>
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
