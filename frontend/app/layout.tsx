import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "LinguaAtlas · Multi-Language Learning Platform",
  description: "A modern, intelligent language learning workspace for vocabulary, grammar, pronunciation, and fluency across 8+ global languages.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/logo-mark.svg",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased selection:bg-blue-500/20 selection:text-blue-600">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

