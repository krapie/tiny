# tiny

## Local Setup

```bash
# build
docker build -t tiny .

# run
docker run -p 8080:80 tiny
```

## CI/CD

Push to `main` → GitHub Actions builds and pushes `krapi0314/tiny:<sha>` → ArgoCD deploys to k8s.

## URL

https://tiny.kevinprk.com
