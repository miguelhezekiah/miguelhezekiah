import { createFileRoute, Link } from "@tanstack/react-router";
import { useWriting } from "@/lib/portfolio";
import { siteConfig } from "@/config/site";
import { ScrollReveal } from "@/components/site/PageTransition";

export const Route = createFileRoute("/thinking")({
  head: () => ({
    meta: [
      { title: `Thinking — ${siteConfig.name}` },
      {
        name: "description",
        content: `Essays, notes, and technical writing by ${siteConfig.name}.`,
      },
      { property: "og:title", content: `Thinking — ${siteConfig.name}` },
    ],
  }),
  component: ThinkingIndex,
});

function ThinkingIndex() {
  const { data: writing = [], isLoading } = useWriting();
  return (
    <main
      className="mx-auto max-w-5xl"
      style={{ padding: "calc(var(--site-padding-y) * 6) var(--site-padding-x)" }}
    >
      <div className="label label-muted mb-8">Thinking</div>
      <h1 className="display text-[clamp(2rem,5vw,4rem)] mb-16">
        Essays, notes, and technical writing.
      </h1>
      <ul className="divide-y divide-border">
        {isLoading && <li className="py-8 label label-muted">Loading…</li>}
        {writing.map((w, i) => (
          <ScrollReveal key={w.id} delay={i * 0.05}>
            <li>
              <Link
                to="/thinking/$slug"
                params={{ slug: w.slug }}
                className="grid grid-cols-1 gap-4 py-8 transition-opacity duration-500 hover:opacity-60 md:grid-cols-12"
              >
                <div className="md:col-span-2 label label-muted">{w.date}</div>
                <div className="md:col-span-7">
                  <div className="display text-2xl md:text-3xl">{w.title}</div>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground max-w-xl">
                    {w.excerpt}
                  </p>
                </div>
                <div className="md:col-span-3 label label-muted md:text-right">
                  {w.tag} · {w.read_time}
                </div>
              </Link>
            </li>
          </ScrollReveal>
        ))}
      </ul>
    </main>
  );
}
