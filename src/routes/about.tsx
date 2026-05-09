import { createFileRoute } from "@tanstack/react-router";
import { siteConfig } from "@/config/site";
import { AboutSection } from "@/components/site/AboutSection";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: `About — ${siteConfig.name}` },
      { name: "description", content: siteConfig.bio.short },
      { property: "og:title", content: `About — ${siteConfig.name}` },
      { property: "og:description", content: siteConfig.bio.short },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <main>
      <AboutSection />
      <Footer />
    </main>
  );
}
