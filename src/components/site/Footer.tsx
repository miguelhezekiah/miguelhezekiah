import { useEffect, useRef } from "react";
import { useLocation } from "@tanstack/react-router";
import { siteConfig } from "@/config/site";
import { setFooterVisible } from "@/lib/footer-visibility";

export function Footer() {
  const { pathname } = useLocation();
  const ref = useRef<HTMLElement | null>(null);

  const activeNav = siteConfig.nav.find((n) => pathname.startsWith(n.to)) ?? null;
  const idx = activeNav ? siteConfig.nav.indexOf(activeNav) : -1;
  const total = siteConfig.nav.length;
  const sectionLabel = activeNav?.label ?? "Index";

  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(([e]) => setFooterVisible(e.isIntersecting), {
      rootMargin: "0px 0px -20% 0px",
    });
    obs.observe(ref.current);
    return () => {
      obs.disconnect();
      setFooterVisible(false);
    };
  }, []);

  const rows: Array<[string, string, string]> = [
    ["Email", siteConfig.email, `mailto:${siteConfig.email}`],
    ["Instagram", "@" + siteConfig.name.toLowerCase().replace(/\s/g, ""), siteConfig.socials.instagram],
    ["LinkedIn", siteConfig.name, siteConfig.socials.linkedin],
    ["GitHub", siteConfig.name.toLowerCase().replace(/\s/g, ""), siteConfig.socials.github],
  ];

  return (
    <footer
      ref={ref}
      style={{
        padding: "calc(var(--site-padding-y) * 4) var(--site-padding-x)",
        background: "var(--color-foreground)",
        color: "var(--color-background)",
      }}
    >
      <div className="grid grid-cols-12 gap-6 items-start">
        {/* Left — wordmark colophon */}
        <div className="col-span-12 md:col-span-4">
          <div className="display text-[clamp(2rem,5vw,4rem)] leading-[0.9]">{siteConfig.name}</div>
          <div className="label mt-4 opacity-60">{siteConfig.role}</div>
        </div>

        {/* Middle — contact list */}
        <dl className="col-span-12 md:col-span-5 mt-8 md:mt-0">
          {rows.map(([k, v, href]) => (
            <a
              key={k}
              href={href}
              className="grid grid-cols-12 gap-3 py-3 group"
              style={{ borderTop: "1px solid color-mix(in oklab, currentColor 22%, transparent)" }}
            >
              <dt className="col-span-8 label transition-colors group-hover:text-[color:var(--color-accent)]">{k}</dt>
            </a>
          ))}
        </dl>

        {/* Right — folio */}
        <div className="col-span-12 md:col-span-3 mt-8 md:mt-0 flex flex-col items-start md:items-end gap-3">
          <div className="display num text-[clamp(2.5rem,4vw,3.5rem)] leading-none">© '26</div>
          {idx >= 0 && (
            <div className="label opacity-60">
              <span className="num" style={{ color: "var(--color-accent)" }}>
                {String(idx + 1).padStart(2, "0")}
              </span>
              <span className="opacity-50"> / {String(total).padStart(2, "0")}</span>
              <span className="ml-2">{sectionLabel}</span>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
