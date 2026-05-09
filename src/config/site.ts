// Single source of truth for site-wide repeatable values.
// Change once, cascade everywhere.

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
  nav: [
    { label: "Index", to: "/" },
    { label: "Work", to: "/work" },
    { label: "Thinking", to: "/thinking" },
    { label: "About", to: "/about" },
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
  nowItems: [
    { kind: "reading", title: "On Growth and Form", author: "D'Arcy Wentworth Thompson", note: "Re-reading. Still finds new things every chapter." },
    { kind: "building", title: "Bone Bridge — phase II", note: "Tuning the deck microstructure for vibration. Sample 14 of 22." },
    { kind: "watching", title: "Erosion patterns, North Sea", note: "Daily satellite tile, looking for a feature for a coastal pavilion." },
    { kind: "listening", title: "Field recordings — Ravenna mosaics", note: "Reverb studies for a sacred-space proposal." },
    { kind: "thinking", title: "Stochastic vs deterministic generation", note: "Working through whether the seed should ever be visible to the client." },
  ],
} as const;

export const motionConfig = {
  ease: [0.65, 0, 0.35, 1] as [number, number, number, number],
  pageDuration: 0.7,
  heroCrossfadeDuration: 1.2,
  heroIntervalMs: 5200,
  hoverDuration: 0.5,
  revealDuration: 0.7,
  staggerChildren: 0.06,
} as const;

export type NavItem = (typeof siteConfig.nav)[number];
