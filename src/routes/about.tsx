import { createFileRoute } from "@tanstack/react-router";
import { siteConfig } from "@/config/site";
import { useExperience } from "@/lib/portfolio";
import { ScrollReveal } from "@/components/site/PageTransition";

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
  const { data: experience = [] } = useExperience();

  return (
    <main
      className="mx-auto max-w-6xl"
      style={{ padding: "calc(var(--site-padding-y) * 6) var(--site-padding-x)" }}
    >
      <div className="grid gap-16 md:grid-cols-12">
        <div className="md:col-span-8">
          <div className="label label-muted mb-6">About</div>
          <h1 className="display text-[clamp(2rem,5vw,4rem)]">
            {siteConfig.bio.short}
          </h1>
          <div className="mt-12 max-w-2xl space-y-6 text-base leading-relaxed text-foreground/85">
            {siteConfig.bio.long.map((p, i) => (
              <ScrollReveal key={i} delay={i * 0.06}>
                <p>{p}</p>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>

      {/* experience */}
      <section className="mt-32 border-t border-border pt-12">
        <div className="label label-muted mb-8">Experience</div>
        <ul className="divide-y divide-border">
          {experience.map((e, i) => (
            <ScrollReveal key={e.id} delay={i * 0.04}>
              <li className="grid grid-cols-1 gap-4 py-6 md:grid-cols-12">
                <div className="md:col-span-3 label label-muted">{e.years}</div>
                <div className="md:col-span-4">
                  <div className="text-base">{e.role}</div>
                  <div className="label label-muted mt-1">{e.org}</div>
                </div>
                <p className="md:col-span-5 text-sm leading-relaxed text-foreground/75">
                  {e.note}
                </p>
              </li>
            </ScrollReveal>
          ))}
        </ul>
      </section>

      {/* now */}
      <section className="mt-32 border-t border-border pt-12">
        <div className="label label-muted mb-8">Now</div>
        <ul className="space-y-6">
          {siteConfig.nowItems.map((n, i) => (
            <ScrollReveal key={i} delay={i * 0.04}>
              <li className="grid grid-cols-1 gap-3 md:grid-cols-12">
                <div className="md:col-span-2 label label-muted">{n.kind}</div>
                <div className="md:col-span-10">
                  <div className="text-base">
                    {n.title}
                    {"author" in n && n.author ? (
                      <span className="text-muted-foreground"> — {n.author}</span>
                    ) : null}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">{n.note}</div>
                </div>
              </li>
            </ScrollReveal>
          ))}
        </ul>
      </section>
    </main>
  );
}
