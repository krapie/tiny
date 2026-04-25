import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tiny",
  description: "Shorten any URL instantly.",
  metadataBase: new URL("https://tiny.kevinprk.com"),
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: { url: "/apple-touch-icon.png", sizes: "180x180" },
  },
  manifest: "/manifest.json",
  themeColor: "#6366f1",
  appleWebApp: {
    capable: true,
    title: "Tiny",
    statusBarStyle: "black-translucent",
  },
  openGraph: {
    type: "website",
    url: "https://tiny.kevinprk.com",
    title: "Tiny",
    description: "Shorten any URL instantly.",
  },
  twitter: {
    card: "summary",
    title: "Tiny",
    description: "Shorten any URL instantly.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`}>
      <body className="h-full bg-zinc-950 text-zinc-100">{children}</body>
    </html>
  );
}
