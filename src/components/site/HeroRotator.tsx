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
      {/* Image plane — full bleed */}
      <div className="absolute inset-0 overflow-hidden">
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

      {/* Title + summary — bottom left, overlaid on image */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id + "-title"}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.7, ease: motionConfig.ease }}
          className="absolute z-10 max-w-[60ch] text-background"
          style={{
            left: "var(--site-padding-x)",
            bottom: "var(--site-padding-y)",
            right: "var(--site-padding-x)",
          }}
        >
          <Link to="/work/$slug" params={{ slug: current.slug }}>
            <h1
              className="display leading-[0.9] hover:opacity-80 transition-opacity"
              style={{ fontSize: "clamp(2.5rem, 9vw, 8rem)" }}
            >
              {current.title}
            </h1>
          </Link>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-background/85">
            {current.summary}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Slide counter — bottom right */}
      <div
        className="absolute z-10 label num text-background"
        style={{
          right: "var(--site-padding-x)",
          bottom: "var(--site-padding-y)",
        }}
      >
        <span className="accent">{String(i + 1).padStart(2, "0")}</span>
        <span className="text-background/50"> / {String(projects.length).padStart(2, "0")}</span>
      </div>
    </div>
  );
}
