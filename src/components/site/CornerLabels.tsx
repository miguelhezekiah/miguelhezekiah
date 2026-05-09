import { Link, useLocation } from "@tanstack/react-router";
import { siteConfig } from "@/config/site";
import { IndexCounter } from "./IndexCounter";

export function CornerLabels() {
  const { pathname } = useLocation();
  const activeNav =
    siteConfig.nav.find(
      (n) => (n.to === "/" ? pathname === "/" : pathname.startsWith(n.to)),
    ) ?? siteConfig.nav[0];
  const idx = siteConfig.nav.indexOf(activeNav);
  const total = siteConfig.nav.length;

  return (
    <header className="pointer-events-none fixed inset-0 z-40">
      {/* top-left: name */}
      <div
        className="pointer-events-auto absolute top-0 left-0 label"
        style={{ padding: "var(--site-padding-y) var(--site-padding-x)" }}
      >
        <Link to="/" className="hover:opacity-60 transition-opacity duration-500">
          {siteConfig.name}
        </Link>
      </div>

      {/* top-right: nav */}
      <nav
        className="pointer-events-auto absolute top-0 right-0 label flex gap-6"
        style={{ padding: "var(--site-padding-y) var(--site-padding-x)" }}
      >
        {siteConfig.nav.slice(1).map((n) => (
          <Link
            key={n.to}
            to={n.to}
            className="transition-opacity duration-500 hover:opacity-60"
            activeProps={{ className: "opacity-100" }}
            inactiveProps={{ className: "opacity-50" }}
          >
            {n.label}
          </Link>
        ))}
      </nav>

      {/* bottom-left: section + counter */}
      <div
        className="pointer-events-auto absolute bottom-0 left-0 label label-muted flex items-center gap-3"
        style={{ padding: "var(--site-padding-y) var(--site-padding-x)" }}
      >
        <span>{activeNav.label}</span>
        <IndexCounter idx={idx} total={total - 1} />
      </div>

      {/* bottom-right: copyright + role */}
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
