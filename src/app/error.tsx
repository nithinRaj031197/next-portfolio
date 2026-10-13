"use client";

import Link from "next/link";
/**
 * Route-level fallback for an unexpected render error. Enhancements have their own boundaries, so this is the last
 * resort: say so plainly and offer a retry and a way home.
 */
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main id="main" className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-24 sm:px-8">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Something went wrong</p>
      <h1 className="mt-3 font-display text-4xl font-light text-white sm:text-6xl">This page did not load.</h1>
      <p className="mt-5 max-w-md text-mist">An unexpected error stopped the page from rendering. Trying again usually fixes it.</p>
      <p className="mt-8 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-abyss transition-colors duration-200 hover:bg-white"
        >
          Try again
        </button>
        <Link href="/" className="rounded-md border border-mist/35 px-5 py-2.5 text-sm font-medium text-silver transition-colors duration-200 hover:border-accent/70 hover:text-white">
          Back to the start
        </Link>
      </p>
    </main>
  );
}
