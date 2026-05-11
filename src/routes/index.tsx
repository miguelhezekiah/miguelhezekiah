import { createFileRoute, Link } from "@tanstack/react-router";
import { HeroRotator } from "@/components/site/HeroRotator";
import { useProjects } from "@/lib/portfolio";
import { siteConfig } from "@/config/site";
import { AboutSection } from "@/components/site/AboutSection";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${siteConfig.name} — Index` },
      {
        name: "description",
        content: `Selected work by ${siteConfig.name}, ${siteConfig.role}. ${siteConfig.bio.short}`,
      },
    ],
  }),
  component: Index,
});

function Index() {
  const { data: projects = [] } = useProjects();
  return (
    <main className="relative">
      {/* Full-viewport hero */}
      <section className="relative h-[100dvh] w-full overflow-hidden">
        <HeroRotator projects={projects} />
        <Link
          to="/"
          hash="about"
          aria-label="Continue"
          className="absolute right-[var(--site-padding-x)] top-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-2"
          style={{ color: "var(--color-accent)" }}
        >
          <span className="block h-16 w-px" style={{ background: "var(--color-accent)" }} />
          <span aria-hidden className="text-lg leading-none">↓</span>
        </Link>
      </section>

      <div id="about" />
      <AboutSection />
      <Footer />
    </main>
  );
}
