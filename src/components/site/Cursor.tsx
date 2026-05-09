import { useEffect, useRef, useState } from "react";

export function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

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
    };

    const tick = () => {
      rx += (x - rx) * 0.12;
      ry += (y - ry) * 0.12;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${rx - 16}px, ${ry - 16}px, 0)`;
      }
      raf = requestAnimationFrame(tick);
    };

    const onOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const interactive = target?.closest("a,button,[role='button']");
      if (ringRef.current) {
        ringRef.current.style.opacity = interactive ? "1" : "0.5";
        ringRef.current.style.width = interactive ? "44px" : "32px";
        ringRef.current.style.height = interactive ? "44px" : "32px";
        ringRef.current.style.marginLeft = interactive ? "-22px" : "-16px";
        ringRef.current.style.marginTop = interactive ? "-22px" : "-16px";
      }
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
      <div
        ref={ringRef}
        className="pointer-events-none fixed top-0 left-0 z-50 h-8 w-8 rounded-full border border-foreground/40 mix-blend-difference transition-[width,height,margin,opacity] duration-300"
      />
      <div
        ref={dotRef}
        className="pointer-events-none fixed top-0 left-0 z-50 h-1 w-1 rounded-full bg-foreground mix-blend-difference"
      />
    </>
  );
}
