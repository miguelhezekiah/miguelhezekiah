import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useProject, useProjects, heroFor } from "@/lib/portfolio";
import { motionConfig, siteConfig } from "@/config/site";
import { ScrollReveal } from "@/components/site/PageTransition";

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
      {/* hero */}
      <div className="relative h-[88dvh] w-full overflow-hidden bg-card">
        <motion.img
          src={heroFor(project)}
          alt={project.title}
          className="h-full w-full object-cover"
          initial={{ scale: 1.06, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.4, ease: motionConfig.ease }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        <div
          className="absolute inset-x-0 bottom-0"
          style={{ padding: "calc(var(--site-padding-y) * 4) var(--site-padding-x)" }}
        >
          <div className="label label-muted mb-4 flex flex-wrap gap-4">
            <span>{project.category}</span>
            <span>·</span>
            <span>{project.location}</span>
            <span>·</span>
            <span>{project.year}</span>
            <span>·</span>
            <span>{project.role}</span>
          </div>
          <h1 className="display text-[clamp(2.5rem,8vw,7rem)] max-w-5xl">{project.title}</h1>
        </div>
      </div>

      {/* body */}
      <section
        className="mx-auto max-w-6xl"
        style={{ padding: "calc(var(--site-padding-y) * 6) var(--site-padding-x)" }}
      >
        <div className="grid gap-16 md:grid-cols-12">
          <div className="md:col-span-4">
            <div className="label label-muted">Summary</div>
            <p className="display mt-4 text-2xl leading-snug">{project.summary}</p>
          </div>
          <div className="md:col-span-7 md:col-start-6 space-y-6 text-base leading-relaxed text-foreground/85">
            {project.body.map((para, i) => (
              <ScrollReveal key={i} delay={i * 0.05}>
                <p>{para}</p>
              </ScrollReveal>
            ))}
          </div>
        </div>

        {/* metrics */}
        {project.metrics?.length > 0 && (
          <div className="mt-24 grid grid-cols-2 gap-8 border-t border-border pt-12 md:grid-cols-4">
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

        {/* tags */}
        {project.tags?.length > 0 && (
          <div className="mt-24 flex flex-wrap gap-3 border-t border-border pt-12">
            {project.tags.map((t) => (
              <span key={t} className="label label-muted rounded-full border border-border px-3 py-1">
                {t}
              </span>
            ))}
          </div>
        )}

        {/* gallery */}
        {project.gallery_urls?.length > 0 && (
          <div className="mt-24 grid grid-cols-1 gap-4 md:grid-cols-2">
            {project.gallery_urls.map((url, i) => (
              <ScrollReveal key={url} delay={i * 0.05}>
                <img src={url} alt="" className="w-full" loading="lazy" />
              </ScrollReveal>
            ))}
          </div>
        )}
      </section>

      {/* next */}
      {next && next.slug !== project.slug && (
        <Link
          to="/work/$slug"
          params={{ slug: next.slug }}
          className="block border-t border-border"
          style={{ padding: "calc(var(--site-padding-y) * 5) var(--site-padding-x)" }}
        >
          <div className="label label-muted mb-3">Next</div>
          <div className="display text-3xl md:text-5xl group-hover:opacity-60">
            {next.title} →
          </div>
        </Link>
      )}
    </main>
  );
}
