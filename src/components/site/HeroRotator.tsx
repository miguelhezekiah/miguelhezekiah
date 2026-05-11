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
    <div className="absolute inset-0 overflow-hidden bg-background flex flex-col">
      {/* Image plane — top portion, hard-cropped */}
      <div className="relative flex-1 overflow-hidden">
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
            </motion.div>
          );
        })}
      </div>

      {/* Paper caption slab — hard horizontal edge against image */}
      <div
        className="relative z-10 bg-background border-t border-foreground"
        style={{ padding: "calc(var(--site-padding-y) * 1.5) var(--site-padding-x) calc(var(--site-padding-y) * 2)" }}
      >
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.7, ease: motionConfig.ease }}
              className="grid grid-cols-12 gap-4 md:gap-6 items-end"
            >
              <div className="col-span-2 label label-muted num">
                <span className="accent">{String(i + 1).padStart(2, "0")}</span>
                <span className="opacity-40"> / {String(projects.length).padStart(2, "0")}</span>
              </div>
              <div className="col-span-12 md:col-span-6 -order-1 md:order-none">
                <Link to="/work/$slug" params={{ slug: current.slug }}>
                  <h1 className="display text-[clamp(2.5rem,7vw,6.5rem)] hover:opacity-80 transition-opacity">
                    {current.title}
                  </h1>
                </Link>
                <p className="mt-5 max-w-md text-sm leading-relaxed text-foreground/80">
                  {current.summary}
                </p>
              </div>
              <div className="col-span-10 md:col-span-4 label label-muted leading-[1.8]">
                <div>{current.category}</div>
                <div>{current.location}</div>
                <div className="num">{current.year}</div>
              </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
