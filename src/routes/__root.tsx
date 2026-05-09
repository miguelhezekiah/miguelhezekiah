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
        <div className="label label-muted">404 — Not Found</div>
        <h1 className="display mt-6 text-[clamp(3rem,10vw,7rem)]">Off the map.</h1>
        <p className="mt-6 text-sm text-muted-foreground max-w-sm mx-auto">
          The page you're looking for has either moved, never existed, or was a passing thought.
        </p>
        <Link to="/" className="label mt-10 inline-block underline-offset-4 hover:underline">
          ← Return home
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
    ],
    links: [{ rel: "stylesheet", href: appCss }],
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
