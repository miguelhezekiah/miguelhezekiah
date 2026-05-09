import type { ReactNode } from "react";
import { useLocation } from "@tanstack/react-router";

/** Wrap every page in this. Children use Tailwind col-span-* utilities. */
export function PageGrid({ children, className = "" }: { children: ReactNode; className?: string }) {
  const { search } = useLocation();
  const debug = typeof search === "string" && search.includes("debug=grid");
  return (
    <div className={`page-grid ${className}`}>
      {children}
      {debug ? <GridDebug /> : null}
    </div>
  );
}

function GridDebug() {
  return (
    <div className="grid-debug">
      {Array.from({ length: 12 }).map((_, i) => (
        <span key={i} />
      ))}
    </div>
  );
}
