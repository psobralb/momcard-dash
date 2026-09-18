"use client";

import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  formatUsd,
  type CitiMonth,
} from "@/lib/types";

type Props = {
  months: CitiMonth[];
  categoryKeys: string[];
};

const W = 720;
const H = 280;
const PAD = { t: 16, r: 12, b: 36, l: 44 };
const plotW = W - PAD.l - PAD.r;
const plotH = H - PAD.t - PAD.b;

export function CategoryChart({ months, categoryKeys }: Props) {
  if (!months.length || !categoryKeys.length) {
    return (
      <div className="card">
        <h2 className="m-0 text-[14px] font-medium">monthly spend by category</h2>
        <p className="mt-6 text-[13px]" style={{ color: "var(--muted)" }}>
          no category rows loaded
        </p>
      </div>
    );
  }

  const rows = months.map((m) => ({
    label: m.month.replace("2026-", ""),
    values: categoryKeys.map((k) => m.byCategory[k] ?? 0),
    total: categoryKeys.reduce((s, k) => s + (m.byCategory[k] ?? 0), 0),
  }));
  const maxTotal = Math.max(...rows.map((r) => r.total), 1);
  const gap = 8;
  const barW = Math.min(48, (plotW - gap * (rows.length - 1)) / rows.length);

  return (
    <div className="card">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 className="m-0 text-[14px] font-medium">
          monthly spend by category
        </h2>
        <span className="stat-k">citi ****0183 · 2026</span>
      </div>

      <div style={{ width: "100%", overflowX: "auto" }}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width="100%"
          height={H}
          role="img"
          aria-label="Monthly spend by category stacked bars"
        >
          {/* y grid */}
          {[0.25, 0.5, 0.75, 1].map((t) => {
            const y = PAD.t + plotH * (1 - t);
            return (
              <g key={t}>
                <line
                  x1={PAD.l}
                  x2={W - PAD.r}
                  y1={y}
                  y2={y}
                  stroke="#262a33"
                />
                <text
                  x={PAD.l - 6}
                  y={y + 3}
                  textAnchor="end"
                  fill="#5c616c"
                  fontSize="11"
                >
                  {`$${Math.round((maxTotal * t) / 1000)}k`}
                </text>
              </g>
            );
          })}

          {rows.map((row, i) => {
            const x = PAD.l + i * (barW + gap);
            let y = PAD.t + plotH;
            return (
              <g key={row.label}>
                {categoryKeys.map((k, ki) => {
                  const v = row.values[ki];
                  const h = (v / maxTotal) * plotH;
                  y -= h;
                  if (h <= 0) return null;
                  return (
                    <rect
                      key={k}
                      x={x}
                      y={y}
                      width={barW}
                      height={h}
                      fill={CATEGORY_COLORS[k] ?? "#5c616c"}
                    >
                      <title>{`${row.label} · ${CATEGORY_LABELS[k] ?? k}: ${formatUsd(v)}`}</title>
                    </rect>
                  );
                })}
                <text
                  x={x + barW / 2}
                  y={H - 12}
                  textAnchor="middle"
                  fill="#8a8f9a"
                  fontSize="11"
                >
                  {row.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
        {categoryKeys.map((k) => (
          <span
            key={k}
            className="inline-flex items-center gap-1.5 text-[11px]"
            style={{ color: "var(--muted)" }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: 2,
                background: CATEGORY_COLORS[k] ?? "#5c616c",
                display: "inline-block",
              }}
            />
            {CATEGORY_LABELS[k] ?? k}
          </span>
        ))}
      </div>
    </div>
  );
}
