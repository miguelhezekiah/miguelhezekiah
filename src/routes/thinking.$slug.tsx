import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useArticle } from "@/lib/portfolio";
import { siteConfig } from "@/config/site";

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

  if (isLoading) {
    return (
      <main className="flex min-h-dvh items-center justify-center">
        <span className="label label-muted">Loading…</span>
      </main>
    );
  }
  if (!article) throw notFound();

  return (
    <main
      className="mx-auto max-w-3xl"
      style={{ padding: "calc(var(--site-padding-y) * 6) var(--site-padding-x)" }}
    >
      <div className="label label-muted mb-6 flex gap-3">
        <span>{article.date}</span>
        <span>·</span>
        <span>{article.tag}</span>
        <span>·</span>
        <span>{article.read_time}</span>
      </div>
      <h1 className="display text-[clamp(2rem,5vw,4rem)]">{article.title}</h1>
      <p className="mt-8 text-lg leading-relaxed text-foreground/85">{article.excerpt}</p>
      {article.body && (
        <div className="mt-12 space-y-6 text-base leading-relaxed text-foreground/85 whitespace-pre-line">
          {article.body}
        </div>
      )}
      <Link to="/thinking" className="label mt-16 inline-block underline-offset-4 hover:underline">
        ← All writing
      </Link>
    </main>
  );
}
