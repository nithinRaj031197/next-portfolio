import type { Education, Certification, Pillar, Profile } from "@/types/content";

// Source of truth: the latest résumé. Profile links match its hyperlinks. The phone number is deliberately not stored here.
export const profile: Profile = {
  name: "Nithin Raj",
  headline: "Frontend Engineer",
  tagline: "React.js · TypeScript · Frontend Architecture",
  location: "Bengaluru, India",
  openTo: "Open to Bengaluru, Pune and Hyderabad",
  yearsExperience: "4+",
  summary:
    "I build scalable, accessible and data-intensive web applications: AI-powered product workflows, real-time interfaces, design systems and the performance and testing practices that keep them reliable.",
  email: "nithinraj.official3@gmail.com",
  links: {
    github: "https://github.com/nithinRaj031197",
    linkedin: "https://www.linkedin.com/in/nithin-raj-831108214/",
  },
  // No résumé file ships with the site. Set NEXT_PUBLIC_RESUME_URL to a public, phone-number-free PDF (a path under
  // /public or an external URL). When it is unset, the Resume buttons and links are simply not rendered.
  resumeHref: process.env.NEXT_PUBLIC_RESUME_URL?.trim() || null,
};

export const pillars: Pillar[] = [
  {
    title: "Frontend architecture",
    body: "Component architecture, explicit state boundaries and typed contracts that keep large interfaces maintainable as they grow.",
  },
  {
    title: "Reusable systems",
    body: "Component libraries and design-system work that cut feature effort and keep products consistent.",
  },
  {
    title: "Data-intensive, real-time UI",
    body: "Streaming AI responses, WebSocket-driven dashboards, visualization schemas and virtualized rendering for large data.",
  },
  {
    title: "Quality, performance and accessibility",
    body: "Core Web Vitals, lazy loading and data-fetching work, accessible semantics and keyboard support, backed by unit and E2E tests.",
  },
];

export const education: Education = {
  degree: "Bachelor of Engineering, Mechanical Engineering",
  school: "SJB Institute of Technology, Bengaluru",
  period: "Aug 2015 – May 2019",
  score: "CGPA 8.39/10",
};

export const certifications: Certification[] = [
  {
    name: "Core Software Development",
    issuer: "Scaler Academy",
    period: "2022 – 2024",
    detail: "DSA, SQL, Computer Networks, Low-Level and High-Level Design",
  },
  { name: "Frontend React", issuer: "HackerRank", period: "Mar 2025" },
];
