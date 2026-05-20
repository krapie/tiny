# tiny

URL shortener with QR code generation.

**Live:** https://tiny.kevinprk.com

## Features

- **Shorten URLs** — generate a short link for any URL
- **QR codes** — generate a QR code for any shortened link
- **Analytics** — track click counts per link

## Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js + React + TypeScript |
| Backend API | Go + chi |
| Database | PostgreSQL |
| QR codes | go-qrcode |
| Deploy | Docker + Kubernetes (ArgoCD) |
| CI | GitHub Actions |

## Project Structure

```
tiny/
├── web/                    # Next.js frontend
│   ├── src/
│   │   └── app/
│   │       ├── layout.tsx
│   │       └── page.tsx
│   └── public/
├── api/                    # Go backend
│   ├── cmd/                # entrypoint
│   ├── internal/
│   │   ├── handler/
│   │   │   ├── url.go      # shorten / redirect
│   │   │   └── qr.go       # QR code generation
│   │   ├── model/
│   │   ├── service/
│   │   └── db/
│   └── go.mod
└── Dockerfile
```

## Local Setup

```bash
# API
cd api
cp .env.example .env        # set DATABASE_URL
go run ./cmd

# Frontend
cd web
npm install
npm run dev                 # http://localhost:3000
```

Or run with Docker:

```bash
docker build -t tiny .
docker run -p 8080:80 tiny
# open http://localhost:8080
```

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |

## CI/CD

Push to `main` → GitHub Actions builds `krapi0314/tiny:<sha>` and pushes to Docker Hub → updates `k8s/tiny/deployment.yaml` in [krapie/homeserver](https://github.com/krapie/homeserver) → ArgoCD syncs to the cluster.
