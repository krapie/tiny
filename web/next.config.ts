import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export, served by the shared nginx in krapie/homeserver k8s/web.
  // Short-code redirects (/{code}) are routed to tiny-api by the HTTPRoute.
  output: "export",
};

export default nextConfig;
