import { siteConfig } from "@/config/site";

export function Footer() {
  return (
    <footer className="page-grid !py-12 border-t border-border">
      <div className="col-span-full md:col-span-4 label label-muted">
        {siteConfig.copyright} {siteConfig.name}
      </div>
      <div className="col-span-full md:col-span-4 label">
        <a href={`mailto:${siteConfig.email}`} className="hover:opacity-60 transition-opacity">
          {siteConfig.email}
        </a>
      </div>
      <div className="col-span-full md:col-span-4 label flex gap-6 md:justify-end">
        <a href={siteConfig.socials.instagram} className="hover:opacity-60">Instagram</a>
        <a href={siteConfig.socials.linkedin} className="hover:opacity-60">LinkedIn</a>
        <a href={siteConfig.socials.github} className="hover:opacity-60">GitHub</a>
      </div>
    </footer>
  );
}
