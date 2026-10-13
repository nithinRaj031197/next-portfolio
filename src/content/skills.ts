import type { SkillGroup } from "@/types/content";

// Grouped by engineering responsibility. Items come from the latest resume. `core` marks the strongest items.
export const skills: SkillGroup[] = [
  {
    name: "Frontend",
    tier: "core",
    items: ["React.js", "Next.js", "TypeScript", "JavaScript (ES6+)", "HTML5", "CSS3", "Tailwind CSS", "Material UI", "Ant Design", "Styled Components"],
    core: ["React.js", "Next.js", "TypeScript", "JavaScript (ES6+)"],
  },
  {
    name: "Architecture",
    tier: "core",
    items: ["Frontend System Design", "Design Systems", "Component Architecture", "SSR", "SSG", "ISR", "Code Splitting", "Lazy Loading", "Virtualization", "Core Web Vitals"],
    core: ["Frontend System Design", "Design Systems", "Component Architecture", "Virtualization", "Core Web Vitals"],
  },
  {
    name: "State and data",
    tier: "core",
    items: ["Redux Toolkit", "RTK Query", "Context API", "Zustand", "React Router"],
    core: ["Redux Toolkit", "RTK Query"],
  },
  { name: "Real-time", tier: "core", items: ["WebSockets", "SSE"], core: ["WebSockets", "SSE"] },
  {
    name: "Testing",
    tier: "core",
    items: ["Jest", "React Testing Library", "Cypress", "Unit testing", "Integration testing", "E2E testing"],
    core: ["Jest", "React Testing Library", "Cypress"],
  },
  { name: "Accessibility", tier: "core", items: ["WCAG", "ARIA", "Semantic HTML", "Keyboard navigation"], core: ["WCAG", "ARIA"] },
  {
    name: "Backend integration",
    tier: "supporting",
    items: ["Node.js", "NestJS", "Express.js", "REST APIs", "GraphQL", "OAuth 2.0", "Keycloak", "MySQL", "PostgreSQL", "MongoDB", "Oracle SQL"],
    core: [],
  },
  { name: "Cloud and tooling", tier: "supporting", items: ["AWS", "Docker", "Git", "GitHub", "CI/CD", "Claude", "Cursor", "ChatGPT"], core: [] },
];
