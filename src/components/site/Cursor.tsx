import { useEffect, useRef, useState } from "react";

export function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const reticleRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const hoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    setEnabled(true);
    document.body.dataset.cursor = "on";

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let rx = x;
    let ry = y;
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${x - 2}px, ${y - 2}px, 0)`;
      }
      if (hoverRef.current) {
        hoverRef.current.style.transform = `translate3d(${x - 5}px, ${y - 5}px, 0)`;
      }
    };

    const tick = () => {
      rx += (x - rx) * 0.18;
      ry += (y - ry) * 0.18;
      if (reticleRef.current) {
        reticleRef.current.style.transform = `translate3d(${rx - 12}px, ${ry - 12}px, 0)`;
      }
      raf = requestAnimationFrame(tick);
    };

    const onOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const interactive = !!target?.closest("a,button,[role='button']");
      if (reticleRef.current) reticleRef.current.style.opacity = interactive ? "0" : "1";
      if (dotRef.current) dotRef.current.style.opacity = interactive ? "0" : "1";
      if (hoverRef.current) hoverRef.current.style.opacity = interactive ? "1" : "0";
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("mouseover", onOver);
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("mouseover", onOver);
      cancelAnimationFrame(raf);
      delete document.body.dataset.cursor;
    };
  }, []);

  if (!enabled) return null;
  return (
    <>
      {/* Crosshair reticle (lerped) */}
      <div
        ref={reticleRef}
        className="pointer-events-none fixed top-0 left-0 z-50 h-6 w-6"
      >
        <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-foreground" />
        <span className="absolute top-1/2 left-0 h-px w-full -translate-y-1/2 bg-foreground" />
      </div>
      {/* Center accent dot (instant) */}
      <div
        ref={dotRef}
        className="pointer-events-none fixed top-0 left-0 z-50 h-1 w-1"
        style={{ background: "var(--color-accent)" }}
      />
      {/* Hover state — filled vermilion square */}
      <div
        ref={hoverRef}
        className="pointer-events-none fixed top-0 left-0 z-50 h-[10px] w-[10px] opacity-0"
        style={{ background: "var(--color-accent)" }}
      />
    </>
  );
}
