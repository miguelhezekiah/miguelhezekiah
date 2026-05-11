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
  const related = all.length > 1
    ? [all[(idx + 1) % all.length], all[(idx + 2) % all.length]].filter(
        (p, i, arr) => p.slug !== project.slug && arr.findIndex((x) => x.slug === p.slug) === i,
      )
    : [];

  // Metadata fields, omitting empties
  const meta: Array<[string, string]> = [];
  if (project.location) meta.push(["Place", project.location]);
  if (project.year) meta.push(["Year", project.year]);
  if (project.category) meta.push(["Program", project.category]);
  if (project.role) meta.push(["Role", project.role]);
  if (project.tags?.length) meta.push(["Type", project.tags[0]]);

  // Interleave: image after paragraph 1, 3, 5… then dump remainder
  const paras = project.body ?? [];
  const imgs = project.gallery_urls ?? [];
  const stream: Array<{ kind: "p"; value: string; i: number } | { kind: "img"; value: string; i: number }> = [];
  let imgCursor = 0;
  paras.forEach((p, pIdx) => {
    stream.push({ kind: "p", value: p, i: pIdx });
    if (pIdx % 2 === 1 && imgCursor < imgs.length) {
      stream.push({ kind: "img", value: imgs[imgCursor], i: imgCursor });
      imgCursor++;
    }
  });
  while (imgCursor < imgs.length) {
    stream.push({ kind: "img", value: imgs[imgCursor], i: imgCursor });
    imgCursor++;
  }

  return (
    <main className="relative">
      {/* Hero with title overlay */}
      <div className="relative h-[85dvh] w-full overflow-hidden bg-card mt-12">
        <motion.img
          src={heroFor(project)}
          alt={project.title}
          className="h-full w-full object-cover"
          initial={{ scale: 1.06, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.4, ease: motionConfig.ease }}
        />
        <h1
          className="display absolute leading-[0.9] text-background pointer-events-none"
          style={{
            left: "var(--site-padding-x)",
            bottom: "var(--site-padding-y)",
            right: "var(--site-padding-x)",
            fontSize: "clamp(2.5rem, 9vw, 8rem)",
          }}
        >
          {project.title}
        </h1>
      </div>

      {/* Metadata — vertical stacked credits list, left-aligned */}
      {meta.length > 0 && (
        <section
          style={{ padding: "calc(var(--site-padding-y) * 3) var(--site-padding-x) calc(var(--site-padding-y) * 2)" }}
        >
          <dl className="max-w-[44ch]">
            {meta.map(([label, value]) => (
              <div key={label} className="py-3 border-b border-foreground/20 first:border-t first:border-foreground/20">
                <dt className="display text-xl md:text-2xl text-foreground/55">
                  {label} <span style={{ color: "var(--color-accent)" }}>/</span>
                </dt>
                <dd className={`display text-xl md:text-2xl mt-1 ${label === "Year" ? "num" : ""}`}>
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {/* Body + interleaved gallery */}
      <section
        style={{ padding: "calc(var(--site-padding-y) * 2) var(--site-padding-x) calc(var(--site-padding-y) * 4)" }}
      >
        <div className="space-y-12 md:space-y-16">
          {project.summary && (
            <p className="text-lg md:text-2xl leading-relaxed text-foreground/95 max-w-[72ch]">
              {project.summary}
            </p>
          )}

          {stream.map((item, i) =>
            item.kind === "p" ? (
              <ScrollReveal key={`p-${item.i}`} delay={0.04}>
                <p className="text-base md:text-lg leading-relaxed text-foreground/85 max-w-[72ch]">
                  {item.value}
                </p>
              </ScrollReveal>
            ) : (
              <ScrollReveal key={`img-${item.i}`} delay={0.04}>
                <img
                  src={item.value}
                  alt=""
                  loading="lazy"
                  className="w-full h-auto"
                />
              </ScrollReveal>
            ),
          )}
        </div>

        {/* Metrics band */}
        {project.metrics?.length > 0 && (
          <div className="mt-24 grid grid-cols-2 gap-8 border-y border-foreground py-10 md:grid-cols-4">
            {project.metrics.map(([k, v], i) => (
              <ScrollReveal key={k} delay={i * 0.04}>
                <div>
                  <div className="display text-3xl num">{v}</div>
                  <div className="label label-muted mt-2">{k}</div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        )}
      </section>

      {/* Related works */}
      {related.length > 0 && (
        <section
          className="border-t border-foreground"
          style={{ padding: "calc(var(--site-padding-y) * 3) var(--site-padding-x)" }}
        >
          <div className="label label-muted mb-8">
            <span style={{ color: "var(--color-accent)" }}>—</span> Related works
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
            {related.map((p) => (
              <Link
                key={p.id}
                to="/work/$slug"
                params={{ slug: p.slug }}
                className="group block"
              >
                <div className="aspect-[4/3] overflow-hidden bg-card">
                  <img
                    src={heroFor(p)}
                    alt={p.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                </div>
                <div className="mt-3 border-t border-foreground pt-2 flex items-baseline justify-between gap-3">
                  <span className="display text-xl md:text-2xl transition-transform duration-500 group-hover:-translate-y-0.5">
                    {p.title} →
                  </span>
                  <span className="label label-muted">
                    {p.category} — <span className="num">{p.year}</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <Footer />
    </main>
  );
}
