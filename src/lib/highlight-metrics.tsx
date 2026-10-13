import type { ReactNode } from "react";

/** Wraps numbers the resume states (40%, 1,000+, 50+) so a recruiter's eye lands on them. */
const METRIC = /(~?\d[\d,]*\+?%?)/g;

export function highlightMetrics(text: string): ReactNode[] {
  return text.split(METRIC).map((part, index) =>
    index % 2 === 1 ? (
      <strong key={index} className="font-semibold text-white">
        {part}
      </strong>
    ) : (
      part
    ),
  );
}
