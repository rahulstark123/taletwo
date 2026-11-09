import type { DailyPoint } from "@/server/admin/stats";

/** Two bars per day (new people and new spaces) for the last 30 days. Drawn as plain SVG, no library. */
export function DailyChart({ points }: { points: DailyPoint[] }) {
  const max = Math.max(1, ...points.map((p) => Math.max(p.users, p.workspaces)));
  const width = 720;
  const height = 180;
  const slot = width / points.length;
  const barW = Math.max(2, slot * 0.36);
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${width} ${height + 4}`} role="img" aria-label="New people and new spaces per day, last 30 days" className="h-auto w-full">
        {points.map((p, i) => {
          const x = i * slot + slot * 0.14;
          const hu = (p.users / max) * height;
          const hw = (p.workspaces / max) * height;
          return (
            <g key={p.day}>
              <rect x={x} y={height - hu} width={barW} height={hu} rx={2} className="fill-ld-primary" />
              <rect x={x + barW + 2} y={height - hw} width={barW} height={hw} rx={2} className="fill-ld-tertiary" />
            </g>
          );
        })}
        <line x1="0" x2={width} y1={height} y2={height} className="stroke-ld-outline-variant" strokeWidth="1" />
      </svg>
      <div className="flex flex-wrap items-center gap-4 text-ld-caption text-ld-on-surface-variant">
        <span className="inline-flex items-center gap-2"><span className="size-2.5 rounded-sm bg-ld-primary" aria-hidden="true" />New people</span>
        <span className="inline-flex items-center gap-2"><span className="size-2.5 rounded-sm bg-ld-tertiary" aria-hidden="true" />New spaces</span>
        <span className="ml-auto">{points[0]?.day} to {points[points.length - 1]?.day}</span>
      </div>
    </div>
  );
}
