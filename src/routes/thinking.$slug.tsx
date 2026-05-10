import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useArticle, useWriting } from "@/lib/portfolio";
import { siteConfig } from "@/config/site";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/thinking/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug} — Thinking — ${siteConfig.name}` },
      { name: "description", content: `An essay by ${siteConfig.name}.` },
    ],
  }),
  component: ArticlePage,
});

function ArticlePage() {
  const { slug } = Route.useParams();
  const { data: article, isLoading } = useArticle(slug);
  const { data: all = [] } = useWriting();

  if (isLoading) {
    return (
      <main className="flex min-h-dvh items-center justify-center">
        <span className="label label-muted">Loading…</span>
      </main>
    );
  }
  if (!article) throw notFound();

  const idx = all.findIndex((a) => a.slug === slug);
  const next = all[(idx + 1) % Math.max(all.length, 1)];

  return (
    <main className="pt-24 md:pt-32">
      <article
        className="mx-auto max-w-6xl"
        style={{ padding: "calc(var(--site-padding-y) * 2) var(--site-padding-x)" }}
      >
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12 md:gap-12">
          <aside className="md:col-span-3">
            <div className="md:sticky md:top-24 space-y-4">
              <div className="label label-muted">Essay</div>
              <div className="space-y-1">
                <div className="text-sm">{article.date}</div>
                <div className="label label-muted">{article.tag}</div>
                <div className="label label-muted">{article.read_time}</div>
              </div>
            </div>
          </aside>
          <div className="md:col-span-9">
            <h1 className="display text-[clamp(2rem,5vw,4.5rem)] leading-[1.05]">{article.title}</h1>
            <p className="mt-8 text-lg md:text-xl leading-relaxed text-foreground/90 first-letter:display first-letter:text-5xl first-letter:float-left first-letter:mr-3 first-letter:leading-none">
              {article.excerpt}
            </p>
            {article.body && (
              <div className="mt-10 max-w-2xl space-y-6 text-base leading-relaxed text-foreground/85 whitespace-pre-line">
                {article.body}
              </div>
            )}
          </div>
        </div>

        <div className="mt-24 flex items-center justify-between border-t border-border pt-8">
          <Link to="/thinking" className="label hover:underline underline-offset-4">
            ← All writing
          </Link>
          {next && next.slug !== article.slug && (
            <Link
              to="/thinking/$slug"
              params={{ slug: next.slug }}
              className="label hover:underline underline-offset-4 text-right"
            >
              <span className="label-muted block">Next essay</span>
              <span>{next.title} →</span>
            </Link>
          )}
        </div>
      </article>
      <Footer />
    </main>
  );
}
