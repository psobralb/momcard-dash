"use client";

import { useMemo, useState } from "react";
import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  formatUsd,
  type CitiMonth,
  type PedroBurnMonth,
} from "@/lib/types";

type Props = {
  months: CitiMonth[];
  pedroBurnMonthly: PedroBurnMonth[];
  categoryKeys: string[];
};

export function MonthDetail({
  months,
  pedroBurnMonthly,
  categoryKeys,
}: Props) {
  const [selected, setSelected] = useState(
    months[months.length - 1]?.month ?? ""
  );

  const month = useMemo(
    () => months.find((m) => m.month === selected) ?? months[months.length - 1],
    [months, selected]
  );

  const burn = useMemo(
    () => pedroBurnMonthly.find((m) => m.month === selected),
    [pedroBurnMonthly, selected]
  );

  if (!month) return null;

  const cats = categoryKeys
    .map((k) => ({ key: k, amount: month.byCategory[k] ?? 0 }))
    .filter((c) => c.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  const catTotal = cats.reduce((s, c) => s + c.amount, 0) || 1;

  const pedroTxs = [...month.transactions]
    .filter((t) => t.category === "pedro-tech-saas")
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 12);

  return (
    <div className="card">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="m-0 text-[14px] font-medium">month detail</h2>
        <span className="mono text-[12px]" style={{ color: "var(--muted)" }}>
          {month.summary.period} · purchases {formatUsd(month.summary.purchases)}
        </span>
      </div>

      <div className="mb-5 flex flex-wrap gap-1.5">
        {months.map((m) => (
          <button
            key={m.month}
            type="button"
            className={`month-tab${m.month === selected ? " active" : ""}`}
            onClick={() => setSelected(m.month)}
          >
            {m.month.replace("2026-", "")}
          </button>
        ))}
      </div>

      {burn ? (
        <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
          <div
            className="rounded-[8px] border px-3 py-2"
            style={{ borderColor: "var(--line)", background: "var(--bg3)" }}
          >
            <div className="stat-k">pedro tech ex-apple</div>
            <div className="stat-v" style={{ fontSize: 18, color: "var(--gold)" }}>
              {formatUsd(burn.pedroTechExApple)}
            </div>
          </div>
          <div
            className="rounded-[8px] border px-3 py-2"
            style={{ borderColor: "var(--line)", background: "var(--bg3)" }}
          >
            <div className="stat-k">apple family-ambiguous</div>
            <div className="stat-v" style={{ fontSize: 18, color: "var(--amb)" }}>
              {formatUsd(burn.appleFamilyAmbiguous)}
            </div>
          </div>
          <div
            className="rounded-[8px] border px-3 py-2"
            style={{ borderColor: "var(--line)", background: "var(--bg3)" }}
          >
            <div className="stat-k">citi pedro-tech-saas</div>
            <div className="stat-v" style={{ fontSize: 18 }}>
              {formatUsd(month.byCategory["pedro-tech-saas"] ?? 0)}
            </div>
          </div>
        </div>
      ) : null}

      <div className="mb-2 text-[11px] uppercase tracking-[0.08em]" style={{ color: "var(--dim)" }}>
        category breakdown
      </div>
      <div className="mb-5 space-y-2">
        {cats.map((c) => (
          <div key={c.key}>
            <div className="mb-1 flex justify-between text-[12px]">
              <span style={{ color: "var(--muted)" }}>
                {CATEGORY_LABELS[c.key] ?? c.key}
              </span>
              <span className="mono" style={{ color: "var(--text)" }}>
                {formatUsd(c.amount)}
              </span>
            </div>
            <div className="bar-track">
              <div
                className="bar-seg"
                style={{
                  width: `${(c.amount / catTotal) * 100}%`,
                  background: CATEGORY_COLORS[c.key] ?? "#5c616c",
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mb-2 text-[11px] uppercase tracking-[0.08em]" style={{ color: "var(--dim)" }}>
        top pedro-tech-saas
      </div>
      <div>
        {pedroTxs.length === 0 ? (
          <p className="text-[13px]" style={{ color: "var(--muted)" }}>
            no pedro-tech-saas transactions this month
          </p>
        ) : (
          pedroTxs.map((t, i) => (
            <div className="tx-row" key={`${t.description}-${i}`}>
              <span className="mono text-[11px]" style={{ color: "var(--dim)" }}>
                {t.transDate ?? t.postDate ?? "—"}
              </span>
              <span style={{ color: "var(--text)" }}>
                {t.merchant || t.description}
                <span
                  className="mt-0.5 block text-[11px]"
                  style={{ color: "var(--dim)" }}
                >
                  {t.description}
                </span>
              </span>
              <span className="mono" style={{ color: "var(--gold)" }}>
                {formatUsd(t.amount)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
