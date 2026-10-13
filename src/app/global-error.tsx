"use client";

import "./globals.css";

/** Replaces the root layout when it fails to render. Stays dependency-free: no fonts, no scene, one way out. */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body>
        <main id="main" className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-24 sm:px-8">
          <h1 className="text-4xl font-light text-white sm:text-5xl">Something went wrong.</h1>
          <p className="mt-5 max-w-md text-mist">The page could not be displayed. Please try again.</p>
          <p className="mt-8">
            <button type="button" onClick={reset} className="rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-abyss hover:bg-white">
              Try again
            </button>
          </p>
        </main>
      </body>
    </html>
  );
}
