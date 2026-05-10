// Tiny pub/sub so CornerLabels knows when the Footer is on screen and can
// hand off the bottom-left section/index labels into the footer's top-left.
import { useEffect, useState } from "react";

let visible = false;
const listeners = new Set<(v: boolean) => void>();

export function setFooterVisible(v: boolean) {
  if (v === visible) return;
  visible = v;
  listeners.forEach((l) => l(v));
}

export function useFooterVisible() {
  const [v, setV] = useState(visible);
  useEffect(() => {
    listeners.add(setV);
    setV(visible);
    return () => {
      listeners.delete(setV);
    };
  }, []);
  return v;
}
