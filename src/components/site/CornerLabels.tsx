import { Link, useLocation } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { siteConfig } from "@/config/site";
import { IndexCounter } from "./IndexCounter";
import { useScrollDirection } from "@/hooks/useScrollDirection";
import { useFooterVisible } from "@/lib/footer-visibility";

export function CornerLabels() {
  const { pathname } = useLocation();
  const activeNav = siteConfig.nav.find((n) => pathname.startsWith(n.to)) ?? null;
  const idx = activeNav ? siteConfig.nav.indexOf(activeNav) : -1;
  const total = siteConfig.nav.length;
  const sectionLabel = activeNav?.label ?? "Index";
  const sectionNum = idx >= 0 ? String(idx + 1).padStart(2, "0") : "00";

  const { direction, atTop } = useScrollDirection();
  const footerVisible = useFooterVisible();
  const navHidden = !atTop && direction === "down";

  if (pathname.startsWith("/admin")) return null;

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-40">
      {/* Top hairline-ruled bar — wordmark left, nav right */}
      <motion.div
        animate={{ y: navHidden ? -56 : 0, opacity: navHidden ? 0 : 1 }}
        transition={{ duration: 0.3, ease: [0.65, 0, 0.35, 1] }}
        className="pointer-events-auto w-full bg-background"
      >
        <div
          className="flex items-center justify-between"
          style={{ padding: "var(--site-padding-y) var(--site-padding-x)" }}
        >
          <Link to="/" className="label flex items-center gap-2 hover:opacity-60 transition-opacity duration-300">
            <span className="num accent">§</span>
            <span>{siteConfig.name}</span>
          </Link>
          <nav className="label flex items-center gap-6">
            {siteConfig.nav.map((n, i) => {
              const isActive = activeNav?.to === n.to;
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className="flex items-baseline gap-1.5 transition-opacity duration-300 hover:opacity-100"
                >
                  <span className={`num text-[9px] ${isActive ? "accent" : "opacity-40"}`}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className={isActive ? "accent" : "opacity-60 hover:opacity-100"}>{n.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </motion.div>

      {/* Bottom-left section + counter */}
      <motion.div
        animate={{ opacity: footerVisible ? 0 : 1 }}
        transition={{ duration: 0.4 }}
        className="pointer-events-auto fixed bottom-0 left-0 label label-muted flex items-center gap-3"
        style={{ padding: "var(--site-padding-y) var(--site-padding-x)" }}
      >
        <span className="num accent">{sectionNum}</span>
        <span className="opacity-50">/</span>
        <span>{sectionLabel}</span>
        {idx >= 0 && (
          <>
            <span className="opacity-30">·</span>
            <IndexCounter idx={idx} total={total} />
          </>
        )}
      </motion.div>
    </header>
  );
}
