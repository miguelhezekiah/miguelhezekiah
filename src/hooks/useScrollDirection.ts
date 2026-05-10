import { useEffect, useState } from "react";

/** Returns "up" | "down" based on recent scroll movement. Initial value is "up". */
export function useScrollDirection(threshold = 6) {
  const [direction, setDirection] = useState<"up" | "down">("up");
  const [atTop, setAtTop] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let last = window.scrollY;
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        const cur = window.scrollY;
        setAtTop(cur < 8);
        if (Math.abs(cur - last) > threshold) {
          setDirection(cur > last ? "down" : "up");
          last = cur;
        }
        ticking = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return { direction, atTop };
}

/** Subscribe to whether an element is intersecting the viewport. */
export function useInView(ref: React.RefObject<Element | null>, rootMargin = "0px") {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin },
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [ref, rootMargin]);
  return inView;
}
