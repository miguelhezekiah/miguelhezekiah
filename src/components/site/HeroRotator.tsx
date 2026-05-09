import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { motionConfig } from "@/config/site";
import { heroFor, type Project } from "@/lib/portfolio";

export function HeroRotator({ projects }: { projects: Project[] }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (projects.length < 2) return;
    const id = window.setInterval(
      () => setI((n) => (n + 1) % projects.length),
      motionConfig.heroIntervalMs,
    );
    return () => window.clearInterval(id);
  }, [projects.length]);

  if (!projects.length) return <div className="fixed inset-0 bg-background" />;
  const p = projects[i];

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-background">
      <AnimatePresence>
        <motion.div
          key={p.id}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1 }}
          transition={{ duration: motionConfig.heroCrossfadeDuration, ease: motionConfig.ease }}
        >
          <img
            src={heroFor(p)}
            alt={p.title}
            className="h-full w-full object-cover"
            draggable={false}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-background/10 to-background/40" />
        </motion.div>
      </AnimatePresence>

      {/* centered project label */}
      <div className="relative z-10 flex h-full w-full items-end">
        <div
          className="w-full"
          style={{ padding: "calc(var(--site-padding-y) * 4) var(--site-padding-x)" }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.9, ease: motionConfig.ease }}
              className="max-w-5xl"
            >
              <div className="label label-muted mb-4 flex gap-4">
                <span>{p.category}</span>
                <span>·</span>
                <span>{p.location}</span>
                <span>·</span>
                <span>{p.year}</span>
              </div>
              <Link to="/work/$slug" params={{ slug: p.slug }}>
                <h1 className="display text-[clamp(2.5rem,7vw,6.5rem)]">{p.title}</h1>
              </Link>
              <p className="mt-6 max-w-xl text-sm leading-relaxed text-muted-foreground">
                {p.summary}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
