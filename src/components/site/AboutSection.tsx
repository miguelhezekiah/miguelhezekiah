import { siteConfig } from "@/config/site";
import { useExperience } from "@/lib/portfolio";
import { ScrollReveal } from "@/components/site/PageTransition";
import { PageGrid } from "@/components/site/PageGrid";

export function AboutSection() {
  const { data: experience = [] } = useExperience();

  return (
    <section>
      <PageGrid>
        <div className="col-span-full md:col-span-8">
          <div className="label label-muted mb-6">About</div>
          <h1 className="display text-[clamp(2rem,5vw,4rem)]">{siteConfig.bio.short}</h1>
          <div className="mt-12 max-w-2xl space-y-6 text-base leading-relaxed text-foreground/85">
            {siteConfig.bio.long.map((p, i) => (
              <ScrollReveal key={i} delay={i * 0.06}>
                <p>{p}</p>
              </ScrollReveal>
            ))}
          </div>
        </div>

        <div className="col-span-full mt-24 border-t border-border pt-12">
          <div className="label label-muted mb-8">Experience</div>
          <ul className="divide-y divide-border">
            {experience.map((e, i) => (
              <ScrollReveal key={e.id} delay={i * 0.04}>
                <li className="grid grid-cols-1 gap-4 py-6 md:grid-cols-12">
                  <div className="label label-muted md:col-span-3">{e.years}</div>
                  <div className="md:col-span-4">
                    <div className="text-base">{e.role}</div>
                    <div className="label label-muted mt-1">{e.org}</div>
                  </div>
                  <p className="text-sm leading-relaxed text-foreground/75 md:col-span-5">{e.note}</p>
                </li>
              </ScrollReveal>
            ))}
          </ul>
        </div>
      </PageGrid>
    </section>
  );
}
