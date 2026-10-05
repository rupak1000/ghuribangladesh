import type { Metadata, Viewport } from "next";
import { Fraunces, Noto_Sans_Bengali, Noto_Serif_Bengali, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Header, BottomNav, Footer } from "@/components/Header";
import { AuthModal, GlobalEffects, SearchOverlay, Toasts } from "@/components/Overlays";
import { ProfileSync } from "@/components/me/ProfileSync";
import { AccountSync } from "@/components/me/AccountSync";
import { T } from "@/components/T";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta", display: "swap" });
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", display: "swap", axes: ["opsz"] });
const bn = Noto_Sans_Bengali({ subsets: ["bengali"], variable: "--font-bn", display: "swap" });
const bnSerif = Noto_Serif_Bengali({ subsets: ["bengali"], variable: "--font-bn-serif", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Ghuri Bangladesh — Discover Bangladesh. Your way.", template: "%s · Ghuri Bangladesh" },
  description: "Explore all 64 districts, discover places and local flavors, track where you've been and plan your next trip.",
};

export const viewport: Viewport = { themeColor: "#f6f3ec", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${jakarta.variable} ${fraunces.variable} ${bn.variable} ${bnSerif.variable}`}>
      <body>
        <a href="#main" className="sr-only z-[80] rounded-full bg-forest px-4 py-2 text-sm font-semibold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-3"><T>Skip to content</T></a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <BottomNav />
        <SearchOverlay />
        <AuthModal />
        <Toasts />
        <GlobalEffects />
        <ProfileSync />
        <AccountSync />
      </body>
    </html>
  );
}
