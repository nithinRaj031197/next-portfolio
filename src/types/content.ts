export interface SocialLink {
  label: string;
  href: string;
}

export interface Profile {
  name: string;
  headline: string;
  tagline: string;
  location: string;
  openTo: string;
  yearsExperience: string;
  summary: string;
  email: string;
  links: { github: string; linkedin: string };
  /** Public résumé URL, or null when none is configured (every Resume entry point is then omitted). */
  resumeHref: string | null;
}

export interface Pillar {
  title: string;
  body: string;
}

export interface Role {
  id: string;
  company: string;
  title: string;
  start: string;
  end: string;
  location: string;
  stack: string[];
  highlights: string[];
  summary: string;
  /** ISO year-month, for <time dateTime>. `endIso` is omitted for the current role. */
  startIso: string;
  endIso?: string;
  /** Numbers the resume states for this role, shown as a scannable row. Never invented. */
  metrics?: { value: string; label: string }[];
  /** Secondary contributions, shown as one compact line. */
  also?: string[];
}

export interface ArchitectureStage {
  label: string;
  detail?: string;
}

/** Groups the expanded case study under a small, fixed vocabulary. Only kinds with real evidence are used. */
export type CaseStudyKind = "approach" | "architecture" | "challenge" | "quality" | "scope";

export interface CaseStudySection {
  heading: string;
  body: string;
  kind: CaseStudyKind;
}

export interface Project {
  id: string;
  title: string;
  /** Short category label, e.g. "Streaming AI interface". */
  kind: string;
  /** One-sentence positioning shown under the title. */
  positioning: string;
  /** The problem, in one or two sentences. */
  context: string;
  stack: string[];
  highlights: string[];
  /** Ordered stages of the system architecture this case study describes. */
  architecture: ArchitectureStage[];
  /** Expandable depth. Only claims supported by the resume or source code. */
  caseStudy: CaseStudySection[];
  /** Public repository, only when its source genuinely represents the case study. */
  repo?: string;
  /** Development-only notes about repo completeness. Never rendered. */
  internalNotes?: string;
}

export interface SkillGroup {
  name: string;
  /** Core groups carry the frontend positioning; supporting groups are shown quieter. */
  tier: "core" | "supporting";
  items: string[];
  /** The strongest items in the group (a subset of `items`), emphasized in the UI. */
  core: string[];
}

export interface ArchitectureNote {
  id: string;
  title: string;
  /** The idea, in a sentence. Shown while collapsed. */
  concept: string;
  why: string;
  tradeoff: string;
  /** Where in my work it shows up (roles and projects). */
  applied: string;
}

export interface Education {
  degree: string;
  school: string;
  period: string;
  score: string;
}

export interface Certification {
  name: string;
  issuer: string;
  period: string;
  detail?: string;
}
