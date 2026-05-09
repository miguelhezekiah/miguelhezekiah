import { useLocation } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { motionConfig } from "@/config/site";
import type { ReactNode } from "react";

/** Subtle horizontal sweep. Outgoing slides left + fades; incoming slides in from right. */
export function PageTransition({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const d = motionConfig.pageSweepDistance;
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, x: d }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -d }}
        transition={{ duration: motionConfig.pageDuration, ease: motionConfig.ease }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export function ScrollReveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: motionConfig.revealDuration, ease: motionConfig.ease, delay }}
    >
      {children}
    </motion.div>
  );
}
