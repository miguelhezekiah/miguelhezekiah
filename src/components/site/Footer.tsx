import { useEffect, useRef } from "react";
import { useLocation } from "@tanstack/react-router";
import { siteConfig } from "@/config/site";
import { IndexCounter } from "./IndexCounter";
import { setFooterVisible } from "@/lib/footer-visibility";

export function Footer() {
  const { pathname } = useLocation();
  const ref = useRef<HTMLElement | null>(null);

  const activeNav =
    siteConfig.nav.find((n) => pathname.startsWith(n.to)) ?? null;
  const idx = activeNav ? siteConfig.nav.indexOf(activeNav) : -1;
  const total = siteConfig.nav.length;
  const sectionLabel = activeNav?.label ?? "Index";

  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([e]) => setFooterVisible(e.isIntersecting),
      { rootMargin: "0px 0px -20% 0px" },
    );
    obs.observe(ref.current);
    return () => {
      obs.disconnect();
      setFooterVisible(false);
    };
  }, []);

  return (
    <footer
      ref={ref}
      className="border-t border-border"
      style={{ padding: "calc(var(--site-padding-y) * 2) var(--site-padding-x)" }}
    >
      <div className="grid grid-cols-12 items-start gap-6">
        {/* Top-left — handed off from CornerLabels */}
        <div className="col-span-6 md:col-span-3 label label-muted flex items-center gap-3">
          <span>{sectionLabel}</span>
          {idx >= 0 && <IndexCounter idx={idx} total={total} />}
        </div>

        {/* Center — email */}
        <div className="col-span-12 md:col-span-5 md:text-center label order-3 md:order-2">
          <a href={`mailto:${siteConfig.email}`} className="hover:opacity-60 transition-opacity">
            {siteConfig.email}
          </a>
        </div>

        {/* Right — socials */}
        <div className="col-span-6 md:col-span-4 label flex gap-4 md:gap-6 justify-end order-2 md:order-3">
          <a href={siteConfig.socials.instagram} className="hover:opacity-60">Instagram</a>
          <a href={siteConfig.socials.linkedin} className="hover:opacity-60">LinkedIn</a>
          <a href={siteConfig.socials.github} className="hover:opacity-60">GitHub</a>
        </div>
      </div>

      <div className="mt-10 label label-muted text-right">
        {siteConfig.copyright} {siteConfig.name}
      </div>
    </footer>
  );
}
