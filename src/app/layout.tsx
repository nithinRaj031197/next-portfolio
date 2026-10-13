import type { Metadata, Viewport } from "next";
import { Fraunces, Geist, Geist_Mono } from "next/font/google";
import { profile } from "@/content/profile";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { AtmosphereBackground } from "@/components/three/AtmosphereBackground";
import "./globals.css";

// Fraunces is reserved for display moments; Geist is UI/body; Geist Mono is technical labels.
const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"], axes: ["opsz"], display: "swap" });
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"], display: "swap" });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"], display: "swap" });

const title = `${SITE_NAME} — ${profile.headline}`;
const description = `${profile.headline} with ${profile.yearsExperience} years of experience in React.js, TypeScript and frontend architecture: AI-powered interfaces, real-time applications, design systems and performance.`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: title, template: `%s | ${SITE_NAME}` },
  description,
  alternates: { canonical: "/" },
  authors: [{ name: SITE_NAME, url: profile.links.github }],
  openGraph: { type: "website", url: "/", siteName: SITE_NAME, title, description },
  twitter: { card: "summary_large_image", title, description },
};

export const viewport: Viewport = { themeColor: "#07090c", colorScheme: "dark" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <AtmosphereBackground />
        {children}
      </body>
    </html>
  );
}
