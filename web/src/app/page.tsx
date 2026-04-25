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
    <main className="flex min-h-full flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg">
        <h1 className="mb-2 text-4xl font-bold tracking-tight text-white">tiny</h1>
        <p className="mb-8 text-zinc-400">Shorten any URL, share it anywhere.</p>

        <form onSubmit={handleShorten} className="space-y-3">
          <input
            type="url"
            placeholder="https://example.com/very-long-url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none"
          />
          <input
            type="text"
            placeholder="Custom code (optional)"
            value={customCode}
            onChange={(e) => setCustomCode(e.target.value)}
            pattern="[a-zA-Z0-9-]{1,20}"
            title="Alphanumeric and hyphens only, max 20 chars"
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-50"
          >
            {loading ? "Shortening…" : "Shorten URL"}
          </button>
        </form>

        {error && (
          <p className="mt-4 rounded-lg border border-red-800 bg-red-900/30 px-4 py-3 text-sm text-red-400">
            {error}
          </p>
        )}

        {result && (
          <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900 p-5">
            <div className="flex items-center justify-between gap-3">
              <a
                href={result.short_url}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate text-lg font-semibold text-indigo-400 hover:text-indigo-300"
              >
                {result.short_url}
              </a>
              <button
                onClick={handleCopy}
                className="shrink-0 rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 transition hover:border-zinc-500 hover:text-white"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <p className="mt-1 truncate text-xs text-zinc-500">{result.original_url}</p>

            <div className="mt-5 flex flex-col items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${API_URL}/api/qr/${result.code}`}
                alt={`QR code for ${result.short_url}`}
                className="rounded-lg bg-white p-2"
                width={160}
                height={160}
              />
              <button
                onClick={handleDownloadQR}
                className="text-xs text-zinc-400 underline-offset-2 hover:text-zinc-200 hover:underline"
              >
                Download QR
              </button>
            </div>

            <p className="mt-4 text-center text-xs text-zinc-500">
              {result.clicks} click{result.clicks !== 1 ? "s" : ""}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
