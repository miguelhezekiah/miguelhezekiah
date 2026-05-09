import { Link, useLocation } from "@tanstack/react-router";
import { siteConfig } from "@/config/site";
import { IndexCounter } from "./IndexCounter";

export function CornerLabels() {
  const { pathname } = useLocation();
  const activeNav =
    siteConfig.nav.find((n) => pathname.startsWith(n.to)) ?? null;
  const idx = activeNav ? siteConfig.nav.indexOf(activeNav) : -1;
  const total = siteConfig.nav.length;
  const sectionLabel = activeNav?.label ?? "Index";

  // Hide chrome on /admin* — admin has its own layout.
  if (pathname.startsWith("/admin")) return null;

  return (
    <header className="pointer-events-none fixed inset-0 z-40">
      <div
        className="pointer-events-auto absolute top-0 left-0 label"
        style={{ padding: "var(--site-padding-y) var(--site-padding-x)" }}
      >
        <Link to="/" className="hover:opacity-60 transition-opacity duration-500">
          {siteConfig.name}
        </Link>
      </div>

      <nav
        className="pointer-events-auto absolute top-0 right-0 label flex gap-6"
        style={{ padding: "var(--site-padding-y) var(--site-padding-x)" }}
      >
        {siteConfig.nav.map((n) => (
          <Link
            key={n.to}
            to={n.to}
            className="transition-opacity duration-500 hover:opacity-100"
            activeProps={{ className: "opacity-100" }}
            inactiveProps={{ className: "opacity-50" }}
          >
            {n.label}
          </Link>
        ))}
      </nav>

      <div
        className="pointer-events-auto absolute bottom-0 left-0 label label-muted flex items-center gap-3"
        style={{ padding: "var(--site-padding-y) var(--site-padding-x)" }}
      >
        <span>{sectionLabel}</span>
        {idx >= 0 && <IndexCounter idx={idx} total={total} />}
      </div>

      <div
        className="pointer-events-auto absolute bottom-0 right-0 label label-muted text-right"
        style={{ padding: "var(--site-padding-y) var(--site-padding-x)" }}
      >
        <div>{siteConfig.role}</div>
        <div className="opacity-60">{siteConfig.copyright}</div>
      </div>
    </header>
  );
}
