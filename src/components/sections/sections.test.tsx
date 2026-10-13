import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { projects } from "@/content/projects";
import { navItems } from "@/lib/navigation";
import Home from "@/app/page";

describe("Home", () => {
  it("renders every nav target as a section", () => {
    const { container } = render(<Home />);
    for (const item of navItems) expect(container.querySelector(`#${item.id}`)).not.toBeNull();
  });

  it("renders all projects with title, diagram and case study, in priority order", () => {
    render(<Home />);
    const articles = screen.getAllByRole("article").filter((el) => el.hasAttribute("data-project"));
    expect(articles.map((a) => a.getAttribute("data-project"))).toEqual(projects.map((p) => p.id));
    for (const article of articles) {
      expect(within(article).getByRole("heading", { level: 3 })).toBeInTheDocument();
      expect(within(article).getByRole("list", { name: /technologies/i })).toBeInTheDocument();
      expect(within(article).getByText("Case study")).toBeInTheDocument();
    }
  });

  it("never renders internal repository status", () => {
    const { container } = render(<Home />);
    expect(container.textContent).not.toMatch(/Source repo today|mocked|placeholder/i);
  });

  it("has a skip link and a single h1", () => {
    render(<Home />);
    expect(screen.getByRole("link", { name: /skip to content/i })).toHaveAttribute("href", "#main");
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  });

  it("builds architecture notes on native details/summary so they are keyboard operable", () => {
    render(<Home />);
    const summary = screen.getByText("Streaming UI architecture").closest("summary");
    expect(summary?.parentElement?.tagName).toBe("DETAILS");
    expect(summary?.parentElement).not.toHaveAttribute("open");
  });

  it("has one h1 and a heading outline that never skips a level", () => {
    const { container } = render(<Home />);
    const levels = [...container.querySelectorAll("h1,h2,h3,h4,h5,h6")].map((el) => Number(el.tagName[1]));
    expect(levels.filter((level) => level === 1)).toHaveLength(1);
    expect(levels[0]).toBe(1);
    levels.slice(1).forEach((level, i) => expect(level - levels[i]!, `heading #${i + 2}`).toBeLessThanOrEqual(1));
  });

  it("orders the hero actions by priority: View Projects, then View Resume, then Contact Me", () => {
    render(<Home />);
    const hero = screen.getByRole("region", { name: /nithin raj/i });
    const links = within(hero).getAllByRole("link").map((link) => link.textContent?.replace(/\s*\(opens in a new tab\)/, "").replace("→", "").trim());
    expect(links.slice(0, 3)).toEqual(["View Projects", "View Resume", "Contact Me"]);
    expect(within(hero).getByRole("link", { name: "View Projects" })).toHaveAttribute("href", "#projects");
    expect(within(hero).getByRole("link", { name: /Contact Me/ })).toHaveAttribute("href", "#contact");
  });

  it("opens external links safely and says so", () => {
    const { container } = render(<Home />);
    for (const anchor of container.querySelectorAll('a[target="_blank"]')) {
      expect(anchor.getAttribute("rel")).toContain("noopener");
      expect(anchor.textContent).toMatch(/opens in a new tab/);
    }
  });

  it("marks up role dates with <time> and exposes case studies as deep-linkable details", () => {
    const { container } = render(<Home />);
    expect(container.querySelectorAll("#experience time").length).toBeGreaterThanOrEqual(7);
    for (const id of ["ai-console", "workflow-builder", "vehicle-ops", "federation"]) {
      const details = container.querySelector(`details#case-${id}`);
      expect(details, id).not.toBeNull();
      expect(details?.querySelector("summary")).not.toBeNull();
    }
  });

  it("gives each architecture note a heading inside its summary and three labelled rows", () => {
    const { container } = render(<Home />);
    const note = container.querySelector("details#note-streaming-ui")!;
    expect(note.querySelector("summary h3")?.textContent).toBe("Streaming UI architecture");
    expect([...note.querySelectorAll("dt")].map((dt) => dt.textContent)).toEqual(["Why it matters", "Trade-off", "Where I applied it"]);
  });

  it("renders no phone number anywhere", () => {
    const { container } = render(<Home />);
    expect(container.innerHTML).not.toMatch(/(?<![\w.])(?:\+?91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}(?![\w.])|tel:/);
  });
});
