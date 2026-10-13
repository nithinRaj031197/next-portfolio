import { profile } from "@/content/profile";
import { skills } from "@/content/skills";
import { SITE_NAME, absoluteUrl } from "@/lib/site";

/**
 * Person structured data: only facts that are already public on the page. Deliberately omitted: phone, email
 * (it is on the page, but there is no reason to hand it to scrapers twice), street address and employment dates.
 */
export const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: SITE_NAME,
  jobTitle: profile.headline,
  url: absoluteUrl("/"),
  address: { "@type": "PostalAddress", addressLocality: "Bengaluru", addressRegion: "Karnataka", addressCountry: "IN" },
  sameAs: [profile.links.github, profile.links.linkedin],
  knowsAbout: skills.flatMap((group) => group.core),
};
