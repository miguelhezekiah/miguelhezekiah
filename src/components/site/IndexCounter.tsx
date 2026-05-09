import { motion, AnimatePresence } from "framer-motion";
import { motionConfig } from "@/config/site";

function pad(n: number) {
  return String(Math.max(0, n)).padStart(2, "0");
}

export function IndexCounter({ idx, total }: { idx: number; total: number }) {
  const current = pad(idx);
  return (
    <span className="inline-flex items-center gap-1 tabular-nums">
      <span className="relative inline-block w-[1.4em] overflow-hidden text-center">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={current}
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "-100%", opacity: 0 }}
            transition={{ duration: motionConfig.hoverDuration, ease: motionConfig.ease }}
            className="block"
          >
            {current}
          </motion.span>
        </AnimatePresence>
      </span>
      <span className="opacity-40">/</span>
      <span>{pad(total)}</span>
    </span>
  );
}
