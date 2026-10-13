import type { Metadata } from "next";
import Link from "next/link";
import { profile } from "@/content/profile";

// Next adds <meta name="robots" content="noindex"> to not-found pages itself, so only the title is set here.
export const metadata: Metadata = { title: "Page not found" };

/** Deliberately plain: branded, readable, one way home. No WebGL, no motion. */
export default function NotFound() {
  return (
    <main id="main" className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-24 sm:px-8">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">404</p>
      <h1 className="mt-3 font-display text-4xl font-light text-white sm:text-6xl">Page not found.</h1>
      <p className="mt-5 max-w-md text-mist">That address does not exist on {profile.name}&apos;s portfolio. The page you want is probably one click away.</p>
      <p className="mt-8">
        <Link href="/" className="inline-flex items-center gap-2 rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-abyss transition-colors duration-200 hover:bg-white">
          Back to the portfolio
        </Link>
      </p>
    </main>
  );
}
