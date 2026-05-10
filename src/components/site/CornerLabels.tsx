import { Link, useLocation } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { siteConfig } from "@/config/site";
import { IndexCounter } from "./IndexCounter";
import { useScrollDirection } from "@/hooks/useScrollDirection";
import { useFooterVisible } from "@/lib/footer-visibility";

export function CornerLabels() {
  const { pathname } = useLocation();
  const activeNav =
    siteConfig.nav.find((n) => pathname.startsWith(n.to)) ?? null;
  const idx = activeNav ? siteConfig.nav.indexOf(activeNav) : -1;
  const total = siteConfig.nav.length;
  const sectionLabel = activeNav?.label ?? "Index";

  const { direction, atTop } = useScrollDirection();
  const footerVisible = useFooterVisible();
  const navHidden = !atTop && direction === "down";

  if (pathname.startsWith("/admin")) return null;

  return (
    <header className="pointer-events-none fixed inset-0 z-40">
      {/* Wordmark — top left */}
      <div
        className="pointer-events-auto absolute top-0 left-0 label"
        style={{ padding: "var(--site-padding-y) var(--site-padding-x)" }}
      >
        <Link to="/" className="hover:opacity-60 transition-opacity duration-500">
          {siteConfig.name}
        </Link>
      </div>

      {/* Nav — top right (hides on scroll-down) */}
      <motion.nav
        animate={{
          y: navHidden ? -40 : 0,
          opacity: navHidden ? 0 : 1,
        }}
        transition={{ duration: 0.3, ease: [0.65, 0, 0.35, 1] }}
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
      </motion.nav>

      {/* Bottom-left section + counter — hides when footer is visible (handed off to footer) */}
      <motion.div
        animate={{ opacity: footerVisible ? 0 : 1 }}
        transition={{ duration: 0.4 }}
        className="pointer-events-auto absolute bottom-0 left-0 label label-muted flex items-center gap-3"
        style={{ padding: "var(--site-padding-y) var(--site-padding-x)" }}
      >
        <span>{sectionLabel}</span>
        {idx >= 0 && <IndexCounter idx={idx} total={total} />}
      </motion.div>

      {/* Bottom-right meta — hidden on small screens */}
      <div
        className="pointer-events-auto absolute bottom-0 right-0 label label-muted text-right hidden sm:block"
        style={{ padding: "var(--site-padding-y) var(--site-padding-x)" }}
      >
        <div>{siteConfig.role}</div>
        <div className="opacity-60">{siteConfig.copyright}</div>
      </div>
    </header>
  );
}
