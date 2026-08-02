import { profile } from "@/content/profile";
import type { Project } from "@/content/types";

const SITE = "https://sooryakumar9.github.io";

/**
 * JSON-LD. Server rendered into the static HTML, so crawlers get it without
 * running any JavaScript.
 *
 * Everything here restates facts that are already visible on the page — the
 * markup is a machine readable copy of the content, never a place to assert
 * something the site does not say.
 */
export function PersonSchema() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    jobTitle: profile.role,
    email: `mailto:${profile.email}`,
    url: SITE,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Bengaluru",
      addressCountry: "IN",
    },
    alumniOf: {
      "@type": "CollegeOrUniversity",
      name: profile.education.school,
    },
    sameAs: [profile.github, profile.linkedin, profile.leetcode],
    knowsAbout: [
      "Full stack development",
      "Systems automation",
      "Retrieval augmented generation",
      "Android development",
    ],
  };

  return (
    <script
      type="application/ld+json"
      // the payload is built from our own content, not user input
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function ProjectSchema({ project }: { project: Project }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.blurb,
    url: `${SITE}/work/${project.slug}/`,
    author: { "@type": "Person", name: profile.name, url: SITE },
    keywords: project.tech.join(", "),
    ...(project.org ? { sourceOrganization: { "@type": "Organization", name: project.org } } : {}),
    ...(project.live ? { sameAs: [project.live] } : {}),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
