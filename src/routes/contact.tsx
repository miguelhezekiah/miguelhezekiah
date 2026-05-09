import { createFileRoute } from "@tanstack/react-router";
import { siteConfig } from "@/config/site";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: `Contact — ${siteConfig.name}` },
      {
        name: "description",
        content: `Get in touch with ${siteConfig.name}, ${siteConfig.role}.`,
      },
      { property: "og:title", content: `Contact — ${siteConfig.name}` },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <main
      className="flex min-h-dvh flex-col justify-center"
      style={{ padding: "calc(var(--site-padding-y) * 5) var(--site-padding-x)" }}
    >
      <div className="mx-auto w-full max-w-5xl">
        <div className="label label-muted mb-8">Contact</div>
        <h1 className="display text-[clamp(2.5rem,8vw,6.5rem)]">
          Open to commissions, collaborations, lectures.
        </h1>
        <div className="mt-16 grid gap-12 md:grid-cols-12">
          <div className="md:col-span-6">
            <div className="label label-muted mb-3">Write</div>
            <a
              href={`mailto:${siteConfig.email}`}
              className="display text-2xl underline-offset-8 hover:underline md:text-3xl"
            >
              {siteConfig.email}
            </a>
          </div>
          <div className="md:col-span-6">
            <div className="label label-muted mb-3">Elsewhere</div>
            <ul className="space-y-3 text-base">
              {Object.entries(siteConfig.socials).map(([k, v]) => (
                <li key={k}>
                  <a
                    href={v}
                    target="_blank"
                    rel="noreferrer"
                    className="capitalize underline-offset-4 hover:underline"
                  >
                    {k}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
