import { siteConfig } from "@/config/site";
import { useExperience, placeholderFor } from "@/lib/portfolio";
import { ScrollReveal } from "@/components/site/PageTransition";
import { PageGrid } from "@/components/site/PageGrid";
import { TimelineGraphic } from "@/components/site/TimelineGraphic";

export function AboutSection() {
  const { data: experience = [] } = useExperience();

  return (
    <section className="pt-24 md:pt-32">
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

        {/* Animated timeline */}
        <div className="col-span-full mt-24 md:mt-32 border-t border-border pt-12">
          <div className="label label-muted mb-8">Trajectory</div>
          <TimelineGraphic />
        </div>

        {/* Experience */}
        <div className="col-span-full mt-24 md:mt-32 border-t border-border pt-12">
          <div className="label label-muted mb-8">Experience</div>
          <ul className="divide-y divide-border">
            {experience.map((e, i) => (
              <ScrollReveal key={e.id} delay={i * 0.04}>
                <li className="py-8">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
                    <div className="label label-muted md:col-span-3">{e.years}</div>
                    <div className="md:col-span-4">
                      <div className="text-base">{e.role}</div>
                      <div className="label label-muted mt-1">{e.org}</div>
                    </div>
                    <p className="text-sm leading-relaxed text-foreground/75 md:col-span-5">{e.note}</p>
                  </div>
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-12">
                    <div className="hidden md:block md:col-span-3" />
                    <div className="col-span-1 md:col-span-9">
                      <div className="aspect-[16/7] w-full overflow-hidden bg-card">
                        <img
                          src={e.image_url || placeholderFor(`exp-${e.id}`)}
                          alt=""
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    </div>
                  </div>
                </li>
              </ScrollReveal>
            ))}
          </ul>
        </div>
      </PageGrid>
    </section>
  );
}
