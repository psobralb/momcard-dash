"use client";

import { formatUsd, type PedroBurnMonth } from "@/lib/types";

type Props = {
  monthly: PedroBurnMonth[];
};

const W = 420;
const H = 240;
const PAD = { t: 16, r: 12, b: 36, l: 48 };
const plotW = W - PAD.l - PAD.r;
const plotH = H - PAD.t - PAD.b;

export function PedroBurnChart({ monthly }: Props) {
  const rows = monthly.map((m) => ({
    label: m.month.replace("2026-", ""),
    pedro: m.pedroTechExApple,
    apple: m.appleFamilyAmbiguous,
  }));
  const maxY = Math.max(...rows.map((r) => Math.max(r.pedro, r.apple)), 1);
  const groupGap = 10;
  const groupW = (plotW - groupGap * (rows.length - 1)) / Math.max(rows.length, 1);
  const barW = Math.min(16, (groupW - 4) / 2);

  return (
    <div className="card">
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="m-0 text-[14px] font-medium">pedro-sub burn</h2>
        <div className="flex gap-2">
          <span className="pill pedro">pedro tech ex-apple</span>
          <span className="pill amb">apple · family-ambiguous</span>
        </div>
      </div>
      <p className="mb-3 mt-0 text-[12px]" style={{ color: "var(--muted)" }}>
        Apple.com/bill parked as family-ambiguous — not counted as Pedro burn.
      </p>

      <div style={{ width: "100%", overflowX: "auto" }}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width="100%"
          height={H}
          role="img"
          aria-label="Pedro burn versus Apple family-ambiguous by month"
        >
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
                  {`$${Math.round(maxY * t)}`}
                </text>
              </g>
            );
          })}

          {rows.map((row, i) => {
            const gx = PAD.l + i * (groupW + groupGap);
            const pedroH = (row.pedro / maxY) * plotH;
            const appleH = (row.apple / maxY) * plotH;
            return (
              <g key={row.label}>
                <rect
                  x={gx}
                  y={PAD.t + plotH - pedroH}
                  width={barW}
                  height={pedroH}
                  fill="#c9a66b"
                  rx={2}
                >
                  <title>{`${row.label} pedro: ${formatUsd(row.pedro)}`}</title>
                </rect>
                <rect
                  x={gx + barW + 4}
                  y={PAD.t + plotH - appleH}
                  width={barW}
                  height={appleH}
                  fill="#9a958c"
                  rx={2}
                >
                  <title>{`${row.label} apple: ${formatUsd(row.apple)}`}</title>
                </rect>
                <text
                  x={gx + groupW / 2 - 2}
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
    </div>
  );
}
