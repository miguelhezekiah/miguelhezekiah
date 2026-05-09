import { createFileRoute } from "@tanstack/react-router";
import { HeroRotator } from "@/components/site/HeroRotator";
import { useProjects } from "@/lib/portfolio";
import { siteConfig } from "@/config/site";

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
    <main className="relative min-h-dvh">
      <HeroRotator projects={projects} />
    </main>
  );
}
