import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GameProvider } from "@/context/GameContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Qlue - Social Guessing Game",
  description:
    "Describe the word without saying the forbidden ones. 12 categories, 275+ prompts, teams and timers. Free, no sign-up.",
  applicationName: "Qlue",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Qlue",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Zoom stays enabled on purpose: `maximumScale`/`userScalable: false` blocks
  // pinch-zoom for low-vision users.
  viewportFit: "cover",
  colorScheme: "dark",
  themeColor: "#0C0A1A",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-dvh flex flex-col bg-background text-foreground">
        <GameProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[100] focus:rounded-xl focus:bg-surface-raised focus:px-4 focus:py-2 focus:text-body focus:font-semibold"
          >
            Skip to content
          </a>
          <main id="main" className="flex-1 flex flex-col">
            {children}
          </main>
        </GameProvider>
      </body>
    </html>
  );
}
