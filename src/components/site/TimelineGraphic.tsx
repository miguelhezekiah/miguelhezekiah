import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type TimelineRow = {
  id: string;
  kind: "project" | "skill" | "lane_label";
  lane: "academic" | "professional" | "personal" | null;
  label: string;
  start_year: number;
  end_year: number | null;
  page_ref: string | null;
  sort_order: number;
};

export function TimelineGraphic() {
  const { data = [] } = useQuery({
    queryKey: ["timeline_entries"],
    queryFn: async (): Promise<TimelineRow[]> => {
      const { data, error } = await supabase
        .from("timeline_entries" as any)
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as TimelineRow[];
    },
    staleTime: 30_000,
  });

  const projects = data.filter((d) => d.kind === "project");
  const skills = data.filter((d) => d.kind === "skill");
  const learning = data.filter((d) => d.kind === "lane_label");

  const ref = useRef<HTMLDivElement | null>(null);
  const [played, setPlayed] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setPlayed(true);
      },
      { threshold: 0.2 },
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  // ── Layout constants (desktop SVG) ─────────────────────────────
  const W = 1600;
  const H = 1000;
  const padL = 140;
  const padR = 280; // room for "Present" + learning cluster
  const axisY = 560;

  // Year ticks (2021..2026 + Present slot)
  const years = [2021, 2022, 2023, 2024, 2025, 2026];
  const presentX = W - padR;
  const yearGap = (presentX - padL) / years.length; // 7 slots
  const xForYear = (y: number) => {
    if (y >= 2027) return presentX;
    return padL + (y - years[0]) * yearGap;
  };

  // Lane base Y (pill rows above axis). 0=personal (top), 1=professional, 2=academic (closest to axis)
  const LANE_Y: Record<string, number> = {
    personal: 110,
    professional: 280,
    academic: 430,
  };
  const LANE_LABEL_Y: Record<string, number> = {
    personal: 60,
    professional: 230,
    academic: 380,
  };

  // Stack pills that share lane+year vertically
  const pillSlots = useMemo(() => {
    const out: Record<string, { x: number; y: number; w: number }> = {};
    const seen: Record<string, number> = {};
    const sorted = [...projects].sort(
      (a, b) => a.start_year - b.start_year || a.sort_order - b.sort_order,
    );
    for (const p of sorted) {
      const lane = p.lane ?? "academic";
      const key = `${lane}-${p.start_year}`;
      const stackIdx = seen[key] ?? 0;
      seen[key] = stackIdx + 1;
      const baseY = LANE_Y[lane];
      const w = Math.max(220, p.label.length * 11 + (p.page_ref ? 50 : 24));
      out[p.id] = {
        x: xForYear(p.start_year),
        y: baseY - stackIdx * 60,
        w,
      };
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects]);

  // Skill rows (below axis)
  const skillRowH = 38;
  const skillStartY = axisY + 70;

  const totalSweep = reduce ? 0 : 1.6;
  const sweepFor = (year: number) => {
    if (reduce) return 0;
    const t = (year - years[0]) / years.length;
    return Math.max(0, t) * totalSweep;
  };

  return (
    <div ref={ref} className="w-full">
      {/* Desktop / tablet */}
      <div className="hidden md:block text-foreground">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-auto"
          aria-hidden
          role="presentation"
        >
          {/* Lane labels (italic, left margin) */}
          {(["personal", "professional", "academic"] as const).map((lane, i) => (
            <motion.text
              key={lane}
              x={lane === "academic" ? 30 : 180}
              y={LANE_LABEL_Y[lane]}
              className="fill-foreground"
              style={{ font: "italic 18px var(--font-display-stack)" }}
              initial={{ opacity: 0 }}
              animate={played ? { opacity: 1 } : {}}
              transition={{ delay: 0.1 + i * 0.08, duration: 0.5 }}
            >
              {lane === "personal"
                ? "[Personal Projects]"
                : lane === "professional"
                  ? "[Professional]"
                  : "[Academic]"}
            </motion.text>
          ))}

          {/* Axis line */}
          <motion.line
            x1={padL - 20}
            y1={axisY}
            x2={presentX + 30}
            y2={axisY}
            stroke="currentColor"
            strokeWidth={1.4}
            initial={{ pathLength: 0 }}
            animate={played ? { pathLength: 1 } : {}}
            transition={{ duration: totalSweep, ease: [0.65, 0, 0.35, 1] }}
          />
          {/* Dashed extension + arrow past Present */}
          <motion.line
            x1={presentX + 30}
            y1={axisY}
            x2={W - 40}
            y2={axisY}
            stroke="currentColor"
            strokeWidth={1.2}
            strokeDasharray="6 6"
            initial={{ opacity: 0 }}
            animate={played ? { opacity: 1 } : {}}
            transition={{ delay: totalSweep, duration: 0.4 }}
          />
          <motion.polyline
            points={`${W - 50},${axisY - 7} ${W - 40},${axisY} ${W - 50},${axisY + 7}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.2}
            initial={{ opacity: 0 }}
            animate={played ? { opacity: 1 } : {}}
            transition={{ delay: totalSweep + 0.05, duration: 0.3 }}
          />

          {/* Year ticks (+) and labels */}
          {years.map((y) => {
            const x = xForYear(y);
            const t = sweepFor(y);
            return (
              <g key={y}>
                <motion.text
                  x={x}
                  y={axisY + 6}
                  textAnchor="middle"
                  className="fill-foreground"
                  style={{ font: "20px var(--font-sans-stack)" }}
                  initial={{ opacity: 0 }}
                  animate={played ? { opacity: 1 } : {}}
                  transition={{ delay: t }}
                >
                  +
                </motion.text>
                <motion.text
                  x={x}
                  y={axisY + 38}
                  textAnchor="middle"
                  className="fill-foreground"
                  style={{ font: "16px var(--font-sans-stack)" }}
                  initial={{ opacity: 0, y: 4 }}
                  animate={played ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: t + 0.1, duration: 0.4 }}
                >
                  {y}
                </motion.text>
              </g>
            );
          })}
          {/* Present */}
          <motion.text
            x={presentX}
            y={axisY + 6}
            textAnchor="middle"
            className="fill-foreground"
            style={{ font: "20px var(--font-sans-stack)" }}
            initial={{ opacity: 0 }}
            animate={played ? { opacity: 1 } : {}}
            transition={{ delay: totalSweep }}
          >
            +
          </motion.text>
          <motion.text
            x={presentX}
            y={axisY + 38}
            textAnchor="middle"
            className="fill-foreground"
            style={{ font: "16px var(--font-sans-stack)" }}
            initial={{ opacity: 0 }}
            animate={played ? { opacity: 1 } : {}}
            transition={{ delay: totalSweep + 0.05 }}
          >
            Present
          </motion.text>

          {/* Project pills with leader line + axis bar */}
          {projects.map((p) => {
            const slot = pillSlots[p.id];
            if (!slot) return null;
            const t = sweepFor(p.start_year);
            return (
              <g key={p.id}>
                {/* short solid bar on axis */}
                <motion.line
                  x1={slot.x - 30}
                  y1={axisY - 14}
                  x2={slot.x + 30}
                  y2={axisY - 14}
                  stroke="currentColor"
                  strokeWidth={3}
                  initial={{ pathLength: 0 }}
                  animate={played ? { pathLength: 1 } : {}}
                  transition={{ delay: t + 0.1, duration: 0.35 }}
                />
                {/* dashed leader from pill bottom to bar */}
                <motion.line
                  x1={slot.x}
                  y1={slot.y + 18}
                  x2={slot.x}
                  y2={axisY - 16}
                  stroke="currentColor"
                  strokeWidth={1}
                  strokeDasharray="3 4"
                  className="text-foreground/55"
                  initial={{ pathLength: 0 }}
                  animate={played ? { pathLength: 1 } : {}}
                  transition={{ delay: t + 0.15, duration: 0.5 }}
                />
                {/* pill */}
                <motion.g
                  initial={{ opacity: 0, y: -10 }}
                  animate={played ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: t + 0.25, duration: 0.4 }}
                >
                  <rect
                    x={slot.x - slot.w / 2}
                    y={slot.y - 18}
                    width={slot.w}
                    height={36}
                    fill="currentColor"
                    className="text-foreground"
                  />
                  <text
                    x={slot.x}
                    y={slot.y + 6}
                    textAnchor="middle"
                    className="fill-background"
                    style={{ font: "600 16px var(--font-sans-stack)" }}
                  >
                    {p.label}
                    {p.page_ref && (
                      <tspan
                        dx="8"
                        className="fill-background/70"
                        style={{ font: "13px var(--font-sans-stack)" }}
                      >
                        {p.page_ref}
                      </tspan>
                    )}
                  </text>
                </motion.g>
              </g>
            );
          })}

          {/* Skill bars (below axis) */}
          {skills.map((s, i) => {
            const startX = xForYear(s.start_year);
            const endX = s.end_year ? xForYear(s.end_year) : presentX;
            const y = skillStartY + i * skillRowH;
            const t = sweepFor(s.start_year);
            const span = (endX - startX) / (presentX - padL);
            const chipY = skillStartY + skills.length * skillRowH + 30 + i * 8;
            const chipW = Math.max(140, s.label.length * 9 + 20);
            // Stagger chips horizontally so they don't overlap
            const chipX = startX;
            return (
              <g key={s.id}>
                <motion.line
                  x1={startX}
                  y1={y}
                  x2={endX}
                  y2={y}
                  stroke="currentColor"
                  strokeWidth={4}
                  initial={{ pathLength: 0 }}
                  animate={played ? { pathLength: 1 } : {}}
                  transition={{
                    delay: t + 0.1,
                    duration: Math.max(0.4, span * totalSweep),
                    ease: [0.65, 0, 0.35, 1],
                  }}
                />
                {/* dashed drop to chip */}
                <motion.line
                  x1={startX}
                  y1={y + 6}
                  x2={chipX}
                  y2={chipY - 12}
                  stroke="currentColor"
                  strokeWidth={1}
                  strokeDasharray="3 4"
                  className="text-foreground/50"
                  initial={{ opacity: 0 }}
                  animate={played ? { opacity: 1 } : {}}
                  transition={{ delay: t + 0.4 }}
                />
                <motion.g
                  initial={{ opacity: 0, y: 6 }}
                  animate={played ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: t + 0.45, duration: 0.4 }}
                >
                  <rect
                    x={chipX - chipW / 2}
                    y={chipY - 12}
                    width={chipW}
                    height={32}
                    rx={16}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.2}
                  />
                  <text
                    x={chipX}
                    y={chipY + 9}
                    textAnchor="middle"
                    className="fill-foreground"
                    style={{ font: "13px var(--font-sans-stack)" }}
                  >
                    {s.label}
                  </text>
                  {s.page_ref && (
                    <text
                      x={chipX}
                      y={chipY + 36}
                      textAnchor="middle"
                      className="fill-foreground/70"
                      style={{ font: "italic 12px var(--font-display-stack)" }}
                    >
                      [{s.page_ref}]
                    </text>
                  )}
                </motion.g>
              </g>
            );
          })}

          {/* Learning cluster (far right, past Present) */}
          <motion.g
            initial={{ opacity: 0 }}
            animate={played ? { opacity: 1 } : {}}
            transition={{ delay: totalSweep + 0.3, duration: 0.5 }}
          >
            {learning.map((l, i) => {
              const cx = W - 140;
              const cy = 660 + i * 70;
              const w = 220;
              const lines = l.label.split(" & ");
              return (
                <g key={l.id}>
                  <rect
                    x={cx - w / 2}
                    y={cy - 22}
                    width={w}
                    height={lines.length > 1 ? 56 : 44}
                    rx={lines.length > 1 ? 28 : 22}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.2}
                  />
                  <text
                    x={cx}
                    y={cy + (lines.length > 1 ? -2 : 6)}
                    textAnchor="middle"
                    className="fill-foreground"
                    style={{ font: "13px var(--font-sans-stack)" }}
                  >
                    {lines.map((ln, j) => (
                      <tspan key={j} x={cx} dy={j === 0 ? 0 : 16}>
                        {ln}
                        {j < lines.length - 1 ? " &" : ""}
                      </tspan>
                    ))}
                  </text>
                </g>
              );
            })}
            <text
              x={W - 140}
              y={660 + learning.length * 70 + 10}
              textAnchor="middle"
              className="fill-foreground"
              style={{ font: "italic 14px var(--font-display-stack)" }}
            >
              [Learning in progress]
            </text>
          </motion.g>
        </svg>
      </div>

      {/* Mobile — vertical stacked */}
      <div className="md:hidden">
        <ol className="relative border-l border-foreground/30 pl-6 space-y-6">
          {[2021, 2022, 2023, 2024, 2025, 2026, 2027].map((y) => {
            const yp = projects.filter((p) => p.start_year === y);
            const ys = skills.filter((s) => s.start_year === y);
            const yl = y === 2027 ? learning : [];
            return (
              <motion.li
                key={y}
                initial={{ opacity: 0, x: -8 }}
                animate={played ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: sweepFor(y) }}
                className="relative"
              >
                <span className="absolute -left-[31px] top-1 inline-block h-2 w-2 rounded-full bg-foreground" />
                <div className="label">{y === 2027 ? "Present" : y}</div>
                {yp.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {yp.map((p) => (
                      <span
                        key={p.id}
                        className="bg-foreground text-background px-2 py-1 text-xs"
                      >
                        {p.label}
                        {p.page_ref && (
                          <span className="opacity-70 ml-1">{p.page_ref}</span>
                        )}
                      </span>
                    ))}
                  </div>
                )}
                {ys.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {ys.map((s) => (
                      <span
                        key={s.id}
                        className="text-xs border border-border rounded-full px-2 py-1"
                      >
                        {s.label}
                        {s.page_ref && (
                          <span className="opacity-60 ml-1">[{s.page_ref}]</span>
                        )}
                      </span>
                    ))}
                  </div>
                )}
                {yl.length > 0 && (
                  <div className="mt-2">
                    <div className="label label-muted italic mb-1">
                      Learning in progress
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {yl.map((l) => (
                        <span
                          key={l.id}
                          className="text-xs border border-border rounded-full px-2 py-1"
                        >
                          {l.label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
