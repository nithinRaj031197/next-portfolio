import { describe, expect, it } from "vitest";
import { experience } from "./experience";
import { notes } from "./notes";
import { profile } from "./profile";
import { projects } from "./projects";
import { skills } from "./skills";

const allPublicText = JSON.stringify({ profile, experience, notes, skills, projects: projects.map((p) => ({ ...p, internalNotes: undefined })) });

describe("content", () => {
  it("never exposes a phone number", () => {
    expect(allPublicText).not.toMatch(/\+?91[\s-]?\d{5}[\s-]?\d{5}|tel:/);
  });

  it("orders projects by priority", () => {
    expect(projects.map((p) => p.id)).toEqual(["ai-console", "workflow-builder", "vehicle-ops", "federation"]);
  });

  it("uses unique ids", () => {
    for (const list of [projects, experience, notes]) {
      const ids = list.map((item) => item.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it("only links repositories that represent the case study", () => {
    expect(projects.find((p) => p.id === "ai-console")?.repo).toBeUndefined();
    expect(projects.find((p) => p.id === "workflow-builder")?.repo).toBeUndefined();
  });

  it("keeps resume metrics exact", () => {
    const groyyo = experience.find((r) => r.id === "groyyo")?.highlights.join(" ") ?? "";
    expect(groyyo).toContain("approximately 40%");
    expect(groyyo).toContain("25% improvement");
    expect(groyyo).toContain("approximately 50%");
    expect(groyyo).toContain("1,000+");
  });
});

describe("Phase 6 content structure", () => {
  it("keeps the project scan layer to three strong points", () => {
    for (const project of projects) expect(project.highlights.length, project.id).toBeLessThanOrEqual(3);
  });

  it("only uses case-study kinds that have real content, with a heading and body for each", () => {
    const allowed = ["approach", "architecture", "challenge", "quality", "scope"];
    for (const project of projects) {
      expect(project.caseStudy.length, project.id).toBeGreaterThan(0);
      for (const section of project.caseStudy) {
        expect(allowed).toContain(section.kind);
        expect(section.heading.length).toBeGreaterThan(2);
        expect(section.body.length).toBeGreaterThan(20);
      }
    }
  });

  it("gives every architecture note a concept, why, trade-off and where it was applied", () => {
    for (const note of notes) {
      for (const field of [note.concept, note.why, note.tradeoff, note.applied]) expect(field.length, note.id).toBeGreaterThan(20);
    }
    expect(notes).toHaveLength(6);
  });

  it("marks core skills as a real subset, and keeps frontend positioning on top", () => {
    for (const group of skills) for (const item of group.core) expect(group.items, `${group.name}/${item}`).toContain(item);
    const core = skills.filter((group) => group.tier === "core").flatMap((group) => group.core);
    expect(core).toEqual(expect.arrayContaining(["React.js", "Next.js", "TypeScript", "JavaScript (ES6+)", "WebSockets", "WCAG", "Cypress"]));
    expect(skills.filter((group) => group.tier === "supporting").map((group) => group.name)).toEqual(["Backend integration", "Cloud and tooling"]);
    expect(skills.filter((group) => group.tier === "supporting").every((group) => group.core.length === 0)).toBe(true);
  });

  it("states role metrics exactly as the resume does, and only where it does", () => {
    const groyyo = experience.find((role) => role.id === "groyyo")!;
    expect(groyyo.metrics?.map((metric) => metric.value)).toEqual(["~40%", "~50%", "25%"]);
    expect(experience.find((role) => role.id === "exzatech")?.metrics?.[0]?.value).toBe("50+");
    expect(experience.find((role) => role.id === "tellius")?.metrics).toBeUndefined();
    expect(experience.find((role) => role.id === "kenpath")?.metrics).toBeUndefined();
  });

  it("has valid ISO year-months for <time>, with no end date only for the current role", () => {
    for (const role of experience) {
      expect(role.startIso).toMatch(/^\d{4}-\d{2}$/);
      if (role.end === "Present") expect(role.endIso).toBeUndefined();
      else expect(role.endIso).toMatch(/^\d{4}-\d{2}$/);
    }
  });
});
