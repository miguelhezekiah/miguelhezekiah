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
          className="absolute bottom-32 right-[var(--site-padding-x)] label z-20 flex flex-col items-end gap-2"
          style={{ color: "var(--color-accent)" }}
        >
          <span className="block h-12 w-px" style={{ background: "var(--color-accent)" }} />
          <span>↓ Continue</span>
        </Link>
      </section>

      <div id="about" />
      <AboutSection />
      <Footer />
    </main>
  );
}
