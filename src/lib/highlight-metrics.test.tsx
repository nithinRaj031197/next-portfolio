import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { highlightMetrics } from "./highlight-metrics";

describe("highlightMetrics", () => {
  it("emphasizes the numbers a resume states and leaves the rest of the sentence alone", () => {
    const { container } = render(<p>{highlightMetrics("Cut load time by approximately 50% for 1,000+ users and integrated 50+ APIs.")}</p>);
    const strong = [...container.querySelectorAll("strong")].map((el) => el.textContent);
    expect(strong).toEqual(["50%", "1,000+", "50+"]);
    expect(container.textContent).toBe("Cut load time by approximately 50% for 1,000+ users and integrated 50+ APIs.");
  });

  it("returns plain text untouched when there are no numbers", () => {
    const { container } = render(<p>{highlightMetrics("No figures here.")}</p>);
    expect(container.querySelectorAll("strong")).toHaveLength(0);
  });
});
