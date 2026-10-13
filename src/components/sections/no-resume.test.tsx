import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("without a configured resume URL", () => {
  it("renders no Resume link, button or menu entry anywhere, and the rest of the page is intact", async () => {
    vi.stubEnv("NEXT_PUBLIC_RESUME_URL", "");
    vi.resetModules();
    const { default: Home } = await import("@/app/page");
    const { container } = render(<Home />);

    expect(screen.queryAllByRole("link", { name: /resume/i })).toHaveLength(0);
    expect(container.querySelector('a[href$=".pdf"]')).toBeNull();
    // Everything else still renders: hero actions, contact links, the four projects.
    expect(screen.getByRole("link", { name: "View Projects" })).toBeInTheDocument();
    expect(screen.getByRole("list", { name: "Contact links" }).querySelectorAll("a")).toHaveLength(3);
    expect(container.querySelectorAll("[data-project]")).toHaveLength(4);
  });
});
