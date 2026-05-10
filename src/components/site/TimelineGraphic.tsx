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

const LANE_ORDER: Record<string, number> = {
  personal: 0,
  professional: 1,
  academic: 2,
};

const LANE_LABEL: Record<string, string> = {
  academic: "[Academic]",
  professional: "[Professional]",
  personal: "[Personal Projects]",
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
    staleTime: 60_000,
  });

  const projects = data.filter((d) => d.kind === "project");
  const skills = data.filter((d) => d.kind === "skill");
  const learning = data.filter((d) => d.kind === "lane_label");

  const years = [2021, 2022, 2023, 2024, 2025, 2026];

  const ref = useRef<HTMLDivElement | null>(null);
  const [played, setPlayed] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setPlayed(true);
      },
      { threshold: 0.25 },
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  // SVG layout (horizontal — desktop)
  const W = 1400;
  const H = 720;
  const padL = 60;
  const padR = 120;
  const axisY = 420;
  const tickGap = (W - padL - padR) / (years.length); // last slot for "Present"

  const xForYear = (y: number) => {
    if (y >= 2027) return W - padR; // "Present"
    return padL + (y - years[0]) * tickGap;
  };

  // Stack projects vertically in their lane to avoid overlap
  const lanePillSlots = useMemo(() => {
    const slots: Record<string, { id: string; x: number; y: number }[]> = {};
    const lanes: Record<string, number> = { personal: 0, professional: 0, academic: 0 };
    const laneBaseY: Record<string, number> = {
      personal: 60,
      professional: 200,
      academic: 320,
    };
    const sorted = [...projects].sort((a, b) => a.start_year - b.start_year);
    for (const p of sorted) {
      const laneKey = p.lane ?? "academic";
      const idx = lanes[laneKey] ?? 0;
      lanes[laneKey] = idx + 1;
      slots[p.id] = [
        {
          id: p.id,
          x: xForYear(p.start_year),
          y: laneBaseY[laneKey] + (idx % 2) * 40,
        },
      ];
    }
    return slots;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects]);

  const totalSweep = reduce ? 0 : 1.4;
  const sweepFor = (year: number) => {
    if (reduce) return 0;
    const t = (year - years[0]) / (years.length); // 0..1
    return t * totalSweep;
  };

  return (
    <div ref={ref} className="w-full">
      {/* Desktop / tablet */}
      <div className="hidden md:block">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-auto"
          aria-hidden
          role="presentation"
        >
          {/* Lane labels */}
          <motion.text
            x={padL - 20}
            y={80}
            className="fill-foreground/70"
            style={{ font: "italic 16px var(--font-display-stack)" }}
            initial={{ opacity: 0 }}
            animate={played ? { opacity: 1 } : {}}
            transition={{ delay: totalSweep + 0.1 }}
          >
            [Personal Projects]
          </motion.text>
          <motion.text
            x={padL - 20}
            y={220}
            className="fill-foreground/70"
            style={{ font: "italic 16px var(--font-display-stack)" }}
            initial={{ opacity: 0 }}
            animate={played ? { opacity: 1 } : {}}
            transition={{ delay: totalSweep + 0.15 }}
          >
            [Professional]
          </motion.text>
          <motion.text
            x={padL - 20}
            y={340}
            className="fill-foreground/70"
            style={{ font: "italic 16px var(--font-display-stack)" }}
            initial={{ opacity: 0 }}
            animate={played ? { opacity: 1 } : {}}
            transition={{ delay: totalSweep + 0.2 }}
          >
            [Academic]
          </motion.text>

          {/* Axis line (animated draw) */}
          <motion.line
            x1={padL}
            y1={axisY}
            x2={W - padR + 60}
            y2={axisY}
            stroke="currentColor"
            strokeWidth={1.2}
            className="text-foreground/70"
            initial={{ pathLength: 0 }}
            animate={played ? { pathLength: 1 } : {}}
            transition={{ duration: totalSweep, ease: [0.65, 0, 0.35, 1] }}
          />
          {/* Arrow */}
          <motion.polyline
            points={`${W - padR + 50},${axisY - 6} ${W - padR + 60},${axisY} ${W - padR + 50},${axisY + 6}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.2}
            className="text-foreground/70"
            initial={{ opacity: 0 }}
            animate={played ? { opacity: 1 } : {}}
            transition={{ delay: totalSweep, duration: 0.3 }}
          />

          {/* Year ticks + labels */}
          {years.map((y) => {
            const x = xForYear(y);
            const t = sweepFor(y);
            return (
              <g key={y}>
                <motion.text
                  x={x}
                  y={axisY - 8}
                  textAnchor="middle"
                  className="fill-foreground/60"
                  style={{ font: "12px var(--font-sans-stack)" }}
                  initial={{ opacity: 0 }}
                  animate={played ? { opacity: 1 } : {}}
                  transition={{ delay: t }}
                >
                  +
                </motion.text>
                <motion.text
                  x={x}
                  y={axisY + 28}
                  textAnchor="middle"
                  className="fill-foreground"
                  style={{ font: "13px var(--font-sans-stack)" }}
                  initial={{ opacity: 0, y: 4 }}
                  animate={played ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: t + 0.1, duration: 0.4 }}
                >
                  {y}
                </motion.text>
              </g>
            );
          })}
          {/* Present label */}
          <motion.text
            x={W - padR}
            y={axisY + 28}
            textAnchor="middle"
            className="fill-foreground"
            style={{ font: "13px var(--font-sans-stack)" }}
            initial={{ opacity: 0 }}
            animate={played ? { opacity: 1 } : {}}
            transition={{ delay: totalSweep + 0.05 }}
          >
            Present
          </motion.text>

          {/* Project pills */}
          {projects.map((p) => {
            const slot = lanePillSlots[p.id]?.[0];
            if (!slot) return null;
            const t = sweepFor(p.start_year);
            const labelW = Math.max(180, p.label.length * 9 + (p.page_ref ? 40 : 20));
            // Connector — small horizontal bar on axis below the pill
            const barX1 = slot.x - 22;
            const barX2 = slot.x + 22;
            return (
              <g key={p.id}>
                {/* dashed connector pill -> bar */}
                <motion.line
                  x1={slot.x}
                  y1={slot.y + 14}
                  x2={slot.x}
                  y2={axisY - 14}
                  stroke="currentColor"
                  strokeWidth={1}
                  strokeDasharray="3 3"
                  className="text-foreground/40"
                  initial={{ pathLength: 0 }}
                  animate={played ? { pathLength: 1 } : {}}
                  transition={{ delay: t + 0.2, duration: 0.5 }}
                />
                {/* axis bar */}
                <motion.line
                  x1={barX1}
                  y1={axisY - 12}
                  x2={barX2}
                  y2={axisY - 12}
                  stroke="currentColor"
                  strokeWidth={2}
                  className="text-foreground"
                  initial={{ pathLength: 0 }}
                  animate={played ? { pathLength: 1 } : {}}
                  transition={{ delay: t + 0.1, duration: 0.4 }}
                />
                {/* pill */}
                <motion.g
                  initial={{ opacity: 0, y: 8 }}
                  animate={played ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: t + 0.25, duration: 0.4 }}
                >
                  <rect
                    x={slot.x - labelW / 2}
                    y={slot.y - 14}
                    width={labelW}
                    height={28}
                    fill="currentColor"
                    className="text-foreground"
                  />
                  <text
                    x={slot.x - labelW / 2 + 12}
                    y={slot.y + 4}
                    className="fill-background"
                    style={{ font: "600 13px var(--font-sans-stack)" }}
                  >
                    {p.label}
                    {p.page_ref ? (
                      <tspan className="fill-background/70" style={{ font: "11px var(--font-sans-stack)" }}>
                        {"  "}{p.page_ref}
                      </tspan>
                    ) : null}
                  </text>
                </motion.g>
              </g>
            );
          })}

          {/* Skill bars (below axis) */}
          {skills.map((s, i) => {
            const startX = xForYear(s.start_year);
            const endX = s.end_year ? xForYear(s.end_year) : W - padR;
            const y = axisY + 80 + i * 26;
            const t = sweepFor(s.start_year);
            const fullSweep = (endX - startX) / (W - padL - padR);
            return (
              <g key={s.id}>
                <motion.line
                  x1={startX}
                  y1={y}
                  x2={endX}
                  y2={y}
                  stroke="currentColor"
                  strokeWidth={3}
                  className="text-foreground"
                  initial={{ pathLength: 0 }}
                  animate={played ? { pathLength: 1 } : {}}
                  transition={{
                    delay: t + 0.1,
                    duration: Math.max(0.4, fullSweep * totalSweep),
                    ease: [0.65, 0, 0.35, 1],
                  }}
                />
                <motion.line
                  x1={startX}
                  y1={y + 8}
                  x2={startX}
                  y2={y + 22}
                  stroke="currentColor"
                  strokeWidth={1}
                  strokeDasharray="2 2"
                  className="text-foreground/40"
                  initial={{ opacity: 0 }}
                  animate={played ? { opacity: 1 } : {}}
                  transition={{ delay: t + 0.4 }}
                />
                <motion.g
                  initial={{ opacity: 0 }}
                  animate={played ? { opacity: 1 } : {}}
                  transition={{ delay: t + 0.5 }}
                >
                  <rect
                    x={startX - 70}
                    y={y + 24}
                    width={140}
                    height={22}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1}
                    rx={11}
                    className="text-foreground/60"
                  />
                  <text
                    x={startX}
                    y={y + 39}
                    textAnchor="middle"
                    className="fill-foreground"
                    style={{ font: "11px var(--font-sans-stack)" }}
                  >
                    {s.label}
                  </text>
                  {s.page_ref && (
                    <text
                      x={startX}
                      y={y + 60}
                      textAnchor="middle"
                      className="fill-foreground/50"
                      style={{ font: "italic 10px var(--font-display-stack)" }}
                    >
                      [{s.page_ref}]
                    </text>
                  )}
                </motion.g>
              </g>
            );
          })}

          {/* Learning in progress — right cluster */}
          <motion.g
            initial={{ opacity: 0 }}
            animate={played ? { opacity: 1 } : {}}
            transition={{ delay: totalSweep + 0.4 }}
          >
            {learning.map((l, i) => (
              <g key={l.id}>
                <rect
                  x={W - padR - 60}
                  y={120 + i * 60}
                  width={180}
                  height={44}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1}
                  rx={22}
                  className="text-foreground/70"
                />
                <text
                  x={W - padR + 30}
                  y={140 + i * 60}
                  textAnchor="middle"
                  className="fill-foreground"
                  style={{ font: "12px var(--font-sans-stack)" }}
                >
                  {l.label.split(" & ").map((part, j, arr) => (
                    <tspan key={j} x={W - padR + 30} dy={j === 0 ? 0 : 14}>
                      {part}{j < arr.length - 1 ? " &" : ""}
                    </tspan>
                  ))}
                </text>
              </g>
            ))}
            <text
              x={W - padR + 30}
              y={120 + learning.length * 60 + 16}
              textAnchor="middle"
              className="fill-foreground/50"
              style={{ font: "italic 11px var(--font-display-stack)" }}
            >
              [Learning in progress]
            </text>
          </motion.g>
        </svg>
      </div>

      {/* Mobile — vertical stacked timeline */}
      <div className="md:hidden">
        <ol className="relative border-l border-foreground/30 pl-6 space-y-6">
          {years.concat([2027]).map((y) => {
            const yearProjects = projects.filter((p) => p.start_year === y);
            const yearSkills = skills.filter((s) => s.start_year === y);
            const yearLearning = y === 2027 ? learning : [];
            if (yearProjects.length === 0 && yearSkills.length === 0 && yearLearning.length === 0) {
              return (
                <li key={y} className="relative">
                  <span className="absolute -left-[31px] top-1 inline-block h-2 w-2 rounded-full bg-foreground/40" />
                  <div className="label label-muted">{y === 2027 ? "Present" : y}</div>
                </li>
              );
            }
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
                <div className="mt-2 space-y-1">
                  {yearProjects.map((p) => (
                    <div key={p.id} className="inline-block bg-foreground text-background px-2 py-1 mr-2 mb-1 text-xs">
                      {p.label} {p.page_ref && <span className="opacity-70">{p.page_ref}</span>}
                    </div>
                  ))}
                </div>
                {yearSkills.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {yearSkills.map((s) => (
                      <span key={s.id} className="text-xs border border-border rounded-full px-2 py-1">
                        {s.label}
                      </span>
                    ))}
                  </div>
                )}
                {yearLearning.length > 0 && (
                  <div className="mt-2">
                    <div className="label label-muted italic mb-1">Learning in progress</div>
                    <div className="flex flex-wrap gap-2">
                      {yearLearning.map((l) => (
                        <span key={l.id} className="text-xs border border-border rounded-full px-2 py-1">
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
