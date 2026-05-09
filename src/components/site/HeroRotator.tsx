import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { motionConfig } from "@/config/site";
import { heroFor, type Project } from "@/lib/portfolio";

/**
 * Two stacked layers always present. We crossfade by toggling opacity.
 * Neither layer ever unmounts → no flash of empty (black) frame.
 */
export function HeroRotator({ projects }: { projects: Project[] }) {
  const [i, setI] = useState(0);
  const [front, setFront] = useState(0); // 0 or 1: which layer is on top
  const [layers, setLayers] = useState<[Project | null, Project | null]>([null, null]);
  const ready = useRef(false);

  // initialise both layers to first project so neither is ever empty
  useEffect(() => {
    if (!projects.length) return;
    setLayers([projects[0], projects[0]]);
    setI(0);
    setFront(0);
    ready.current = true;
  }, [projects]);

  useEffect(() => {
    if (projects.length < 2) return;
    const id = window.setInterval(() => {
      setI((n) => {
        const next = (n + 1) % projects.length;
        const nextProj = projects[next];
        // preload, then swap
        const img = new Image();
        const swap = () => {
          setLayers((cur) => {
            const back = front === 0 ? 1 : 0;
            const updated: [Project | null, Project | null] = [...cur] as [Project | null, Project | null];
            updated[back] = nextProj;
            return updated;
          });
          // next tick, flip front
          requestAnimationFrame(() => setFront((f) => (f === 0 ? 1 : 0)));
        };
        img.onload = swap;
        img.onerror = swap;
        img.src = heroFor(nextProj);
        return next;
      });
    }, motionConfig.heroIntervalMs);
    return () => window.clearInterval(id);
  }, [projects, front]);

  if (!projects.length) return <div className="absolute inset-0 bg-background" />;
  const current = projects[i];

  return (
    <div className="absolute inset-0 overflow-hidden bg-background">
      {[0, 1].map((idx) => {
        const p = layers[idx];
        if (!p) return null;
        const isFront = front === idx;
        return (
          <motion.div
            key={idx}
            className="absolute inset-0"
            initial={false}
            animate={{ opacity: isFront ? 1 : 0 }}
            transition={{ duration: motionConfig.heroCrossfadeDuration, ease: motionConfig.ease }}
            style={{ zIndex: isFront ? 1 : 0 }}
          >
            <img
              src={heroFor(p)}
              alt={p.title}
              className="h-full w-full object-cover"
              draggable={false}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/10 to-background/40" />
          </motion.div>
        );
      })}

      {/* centered project label */}
      <div className="relative z-10 flex h-full w-full items-end pointer-events-none">
        <div
          className="w-full pointer-events-auto"
          style={{ padding: "calc(var(--site-padding-y) * 4) var(--site-padding-x)" }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.7, ease: motionConfig.ease }}
              className="max-w-5xl"
            >
              <div className="label label-muted mb-4 flex flex-wrap gap-x-4 gap-y-1">
                <span>{current.category}</span>
                <span aria-hidden>·</span>
                <span>{current.location}</span>
                <span aria-hidden>·</span>
                <span>{current.year}</span>
              </div>
              <Link to="/work/$slug" params={{ slug: current.slug }}>
                <h1 className="display text-[clamp(2.5rem,7vw,6.5rem)]">{current.title}</h1>
              </Link>
              <p className="mt-6 max-w-xl text-sm leading-relaxed text-muted-foreground">
                {current.summary}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
