import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { siteConfig } from "@/config/site";
import { CornerLabels } from "@/components/site/CornerLabels";
import { Cursor } from "@/components/site/Cursor";
import { PageTransition } from "@/components/site/PageTransition";

function NotFoundComponent() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-6">
      <div className="text-center">
        <div className="label label-muted">404</div>
        <h1 className="display mt-4 text-5xl">Not here.</h1>
        <p className="mt-4 text-sm text-muted-foreground">This page does not exist.</p>
        <Link to="/" className="label mt-8 inline-block underline-offset-4 hover:underline">
          ← Index
        </Link>
      </div>
    </main>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <main className="flex min-h-dvh items-center justify-center px-6">
      <div className="max-w-md text-center">
        <div className="label label-muted">Error</div>
        <h1 className="display mt-4 text-3xl">Something broke quietly.</h1>
        <p className="mt-4 text-sm text-muted-foreground">{error.message}</p>
        <button
          onClick={() => {
            router.invalidate();
            reset();
          }}
          className="label mt-8 underline-offset-4 hover:underline"
        >
          Try again
        </button>
      </div>
    </main>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: `${siteConfig.name} — ${siteConfig.role}` },
      {
        name: "description",
        content: siteConfig.bio.short,
      },
      { name: "author", content: siteConfig.name },
      { property: "og:title", content: `${siteConfig.name} — ${siteConfig.role}` },
      { property: "og:description", content: siteConfig.bio.short },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Miguel Hezekiah" },
      { property: "og:title", content: "Miguel Hezekiah" },
      { name: "twitter:title", content: "Miguel Hezekiah" },
      { name: "description", content: "Computational Designer" },
      { property: "og:description", content: "Computational Designer" },
      { name: "twitter:description", content: "Computational Designer" },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/BEYdjKvsIzV05Ink0t1ZJ07KcZA3/social-images/social-1778361295239-logo-black.webp" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/BEYdjKvsIzV05Ink0t1ZJ07KcZA3/social-images/social-1778361295239-logo-black.webp" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter+Tight:wght@300;400;500&family=Fraunces:opsz,wght@9..144,200;9..144,300;9..144,400&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <Cursor />
      <CornerLabels />
      <PageTransition>
        <Outlet />
      </PageTransition>
    </QueryClientProvider>
  );
}
