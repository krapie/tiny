import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export const metadata: Metadata = {
  title: "Tiny",
  description: "URL shortener with QR code generation.",
  metadataBase: new URL("https://tiny.kevinprk.com"),
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: { url: "/apple-touch-icon.png", sizes: "180x180" },
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Tiny",
    statusBarStyle: "black-translucent",
  },
  openGraph: {
    type: "website",
    url: "https://tiny.kevinprk.com",
    title: "Tiny",
    description: "URL shortener with QR code generation.",
  },
  twitter: {
    card: "summary",
    title: "Tiny",
    description: "URL shortener with QR code generation.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" style={{ height: "100%" }}>
      <body style={{ height: "100%" }}>{children}</body>
      <Script
        src="https://analytics.kevinprk.com/script.js"
        data-website-id="7ef222d4-ecb2-4902-80d9-34dbb33de61c"
        strategy="afterInteractive"
      />
    </html>
  );
}
