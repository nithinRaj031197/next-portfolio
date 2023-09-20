import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Raleway, Fira_Code } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });
const raleway = Raleway({ subsets: ["latin"] });
const firaCode = Fira_Code({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nithin Raj Portfolio",
  description: "Nithin Raj Personal Portfolio",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="shortcut icon" href="/download.png" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
