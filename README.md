# Tiny

URL shortener with QR code generation and click analytics. Paste a long URL, get a short link and a scannable QR code to share anywhere. **Live:** [tiny.kevinprk.com](https://tiny.kevinprk.com)

## Getting Started

```bash
# API (Go)
cd api && go run ./cmd

# Frontend (separate terminal)
cd web && npm install && npm run dev   # http://localhost:3000
```

The API requires a PostgreSQL database; set `DATABASE_URL` in the environment.

## Features

- **URL shortening** — paste any URL and get a short link under `tiny.kevinprk.com/<code>` in one click
- **QR code generation** — every shortened link comes with a downloadable QR code for sharing in print or on screen
- **Click analytics** — each short link tracks its total click count so you can see how often it's been used
- **Redirect** — visiting a short link redirects immediately to the original URL with no interstitial page
