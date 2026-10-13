export interface NavItem {
  id: string;
  label: string;
}

/** Order matches the page. `id` is the section anchor. */
export const navItems: NavItem[] = [
  { id: "about", label: "About" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "architecture", label: "Architecture" },
  { id: "skills", label: "Skills" },
  { id: "contact", label: "Contact" },
];
