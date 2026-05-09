// Single source of truth for site-wide repeatable values.

export const siteConfig = {
  name: "Miguel Hezekiah",
  role: "Computational Designer",
  copyright: "©2026",
  email: "hello@miguelhezekiah.com",
  location: "Practice — Worldwide",
  socials: {
    instagram: "https://instagram.com/",
    linkedin: "https://linkedin.com/",
    github: "https://github.com/miguelhezekiah",
  },
  // 4-section nav. Index (/) is reachable via the name in the top-left.
  nav: [
    { label: "About", to: "/about" },
    { label: "Work", to: "/work" },
    { label: "Thinking", to: "/thinking" },
    { label: "Contact", to: "/contact" },
  ] as const,
  bio: {
    short:
      "Computational designer working at the seam of architecture, biology, and code. Form-finding, generative geometry, fabrication.",
    long: [
      "I design buildings, structures, and objects that are grown rather than drawn — letting biological growth rules, agent swarms, and topology optimisation produce form, then disciplining the result back into something that can be built.",
      "Currently leading Studio Hyperform. Previously at ZHA, Foster + Partners, and TU Delft Hyperbody. Open to collaborations on pavilions, infrastructure, and cultural buildings.",
    ],
  },
} as const;

export const motionConfig = {
  ease: [0.65, 0, 0.35, 1] as [number, number, number, number],
  pageDuration: 0.5,
  pageSweepDistance: 24,
  heroCrossfadeDuration: 1.4,
  heroIntervalMs: 5500,
  hoverDuration: 0.5,
  revealDuration: 0.7,
  staggerChildren: 0.06,
} as const;

export type NavItem = (typeof siteConfig.nav)[number];
