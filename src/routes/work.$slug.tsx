import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useProject, useProjects, heroFor } from "@/lib/portfolio";
import { motionConfig, siteConfig } from "@/config/site";
import { ScrollReveal } from "@/components/site/PageTransition";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/work/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug} — ${siteConfig.name}` },
      { name: "description", content: `Project — ${params.slug}` },
      { property: "og:title", content: `${params.slug} — ${siteConfig.name}` },
    ],
  }),
  component: WorkDetail,
});

function WorkDetail() {
  const { slug } = Route.useParams();
  const { data: project, isLoading } = useProject(slug);
  const { data: all = [] } = useProjects();

  if (isLoading) {
    return (
      <main className="flex min-h-dvh items-center justify-center">
        <span className="label label-muted">Loading…</span>
      </main>
    );
  }
  if (!project) throw notFound();

  const idx = all.findIndex((p) => p.slug === slug);
  const next = all[(idx + 1) % Math.max(all.length, 1)];

  return (
    <main className="relative">
      {/* Full-bleed hero */}
      <div className="relative h-[88dvh] w-full overflow-hidden bg-card">
        <motion.img
          src={heroFor(project)}
          alt={project.title}
          className="h-full w-full object-cover"
          initial={{ scale: 1.06, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.4, ease: motionConfig.ease }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div
          className="absolute inset-x-0 bottom-0"
          style={{ padding: "calc(var(--site-padding-y) * 4) var(--site-padding-x)" }}
        >
          <div className="label label-muted mb-4 flex flex-wrap gap-x-4 gap-y-1">
            <span>{project.category}</span>
            <span className="opacity-40">·</span>
            <span>{project.location}</span>
            <span className="opacity-40">·</span>
            <span>{project.year}</span>
          </div>
          <h1 className="display text-[clamp(2.25rem,8vw,7rem)] max-w-5xl leading-[0.95]">{project.title}</h1>
        </div>
      </div>

      {/* Body — sticky meta + long form */}
      <section
        className="mx-auto max-w-7xl"
        style={{ padding: "calc(var(--site-padding-y) * 5) var(--site-padding-x)" }}
      >
        <div className="grid gap-12 md:grid-cols-12 md:gap-16">
          <aside className="md:col-span-4 lg:col-span-3">
            <div className="md:sticky md:top-24 space-y-6">
              <div>
                <div className="label label-muted">Year</div>
                <div className="mt-1 text-sm">{project.year}</div>
              </div>
              <div>
                <div className="label label-muted">Role</div>
                <div className="mt-1 text-sm">{project.role}</div>
              </div>
              <div>
                <div className="label label-muted">Location</div>
                <div className="mt-1 text-sm">{project.location}</div>
              </div>
              <div>
                <div className="label label-muted">Category</div>
                <div className="mt-1 text-sm">{project.category}</div>
              </div>
              {project.tags?.length > 0 && (
                <div>
                  <div className="label label-muted mb-2">Tags</div>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((t) => (
                      <span key={t} className="label label-muted rounded-full border border-border px-2 py-1">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>

          <div className="md:col-span-8 lg:col-span-8 lg:col-start-5 space-y-10">
            <p className="display text-2xl md:text-3xl leading-snug text-foreground/95">
              {project.summary}
            </p>
            <div className="space-y-6 text-base leading-relaxed text-foreground/85">
              {project.body.map((para, i) => (
                <ScrollReveal key={i} delay={i * 0.05}>
                  <p>{para}</p>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>

        {/* metrics band */}
        {project.metrics?.length > 0 && (
          <div className="mt-24 grid grid-cols-2 gap-8 border-y border-border py-10 md:grid-cols-4">
            {project.metrics.map(([k, v], i) => (
              <ScrollReveal key={k} delay={i * 0.04}>
                <div>
                  <div className="display text-3xl">{v}</div>
                  <div className="label label-muted mt-2">{k}</div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        )}

        {/* asymmetric gallery */}
        {project.gallery_urls?.length > 0 && (
          <div className="mt-24 space-y-4 md:space-y-6">
            {chunkAsymmetric(project.gallery_urls).map((row, i) => (
              <div
                key={i}
                className={
                  row.length === 1
                    ? "grid grid-cols-1"
                    : "grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6"
                }
              >
                {row.map((url, j) => (
                  <ScrollReveal key={url} delay={j * 0.05}>
                    <img src={url} alt="" className="w-full" loading="lazy" />
                  </ScrollReveal>
                ))}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Next */}
      {next && next.slug !== project.slug && (
        <Link
          to="/work/$slug"
          params={{ slug: next.slug }}
          className="group block border-t border-border relative overflow-hidden"
        >
          <div
            className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center"
            style={{ padding: "calc(var(--site-padding-y) * 4) var(--site-padding-x)" }}
          >
            <div className="md:col-span-3 aspect-[4/3] overflow-hidden bg-card">
              <img
                src={heroFor(next)}
                alt={next.title}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
            </div>
            <div className="md:col-span-9">
              <div className="label label-muted mb-3">Next project</div>
              <div className="display text-3xl md:text-5xl transition-transform duration-500 group-hover:translate-x-2">
                {next.title} →
              </div>
            </div>
          </div>
        </Link>
      )}
      <Footer />
    </main>
  );
}

function chunkAsymmetric(urls: string[]): string[][] {
  // pattern: 1, 2, 1, 2, …
  const out: string[][] = [];
  let i = 0;
  let big = true;
  while (i < urls.length) {
    if (big) {
      out.push([urls[i]]);
      i += 1;
    } else {
      out.push(urls.slice(i, i + 2));
      i += 2;
    }
    big = !big;
  }
  return out;
}
