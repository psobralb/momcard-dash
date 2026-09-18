import { CategoryChart } from "@/components/CategoryChart";
import { LogoutButton } from "@/components/LogoutButton";
import { MonthDetail } from "@/components/MonthDetail";
import { PedroBurnChart } from "@/components/PedroBurnChart";
import { PedroSubsPanel } from "@/components/PedroSubsPanel";
import { loadDashboardData } from "@/lib/data";
import { formatUsd } from "@/lib/types";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  const data = loadDashboardData();

  return (
    <div className="relative z-10 mx-auto max-w-[1180px] px-4 pb-16 pt-7 sm:px-8">
      <header className="mb-7 flex flex-wrap items-start justify-between gap-6">
        <div className="flex items-center gap-3.5">
          <span className="mark">mc</span>
          <div>
            <h1 className="m-0 text-[22px] font-medium tracking-tight">
              momcard
            </h1>
            <p className="m-0 text-[13px]" style={{ color: "var(--muted)" }}>
              family billing · Citi ****{data.accountLast4} /{" "}
              {titleCase(data.cardholder)} · no work ops
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div
            className="mono text-right text-[12px] leading-relaxed"
            style={{ color: "var(--muted)" }}
          >
            <div>Paula · ****{data.accountLast4}</div>
            <div>{data.dateRangeLabel}</div>
            <div>cancels: none</div>
          </div>
          <LogoutButton />
        </div>
      </header>

      <section className="mb-6 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        <Kpi
          label="period purchases"
          value={formatUsd(data.ytdPurchases)}
          hint="sum · citi summaries 01–09"
        />
        <Kpi
          label="pedro burn (ex-apple)"
          value={formatUsd(data.pedroBurnTotal)}
          hint={data.burnNote ?? "pedroBurnCorrected.totalAcrossAudit"}
          gold
        />
        <Kpi
          label="apple family-ambiguous"
          value={formatUsd(data.appleParkedTotal)}
          hint="parked · not pedro burn"
        />
        <Kpi
          label="avg / month pedro"
          value={formatUsd(data.avgPedroBurn)}
          hint="ex-apple · audit window"
          gold
        />
      </section>

      <div className="mb-3 grid gap-3 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <CategoryChart
            months={data.months}
            categoryKeys={data.categoryKeys}
          />
        </div>
        <div className="lg:col-span-2">
          <PedroBurnChart monthly={data.pedroBurnMonthly} />
        </div>
      </div>

      <div className="mb-3 grid gap-3 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <MonthDetail
            months={data.months}
            pedroBurnMonthly={data.pedroBurnMonthly}
            categoryKeys={data.categoryKeys}
          />
        </div>
        <div className="lg:col-span-2">
          <PedroSubsPanel subs={data.pedroSubs} />
        </div>
      </div>

      <footer
        className="mt-9 flex flex-wrap justify-between gap-3 border-t pt-4 text-[11px] lowercase tracking-[0.04em]"
        style={{ borderColor: "var(--line)", color: "var(--dim)" }}
      >
        <span>private local · cancels: none</span>
        <span className="mono">
          {data.generatedAt
            ? `data ${data.generatedAt}`
            : "momcard · local only"}
        </span>
      </footer>
    </div>
  );
}

function Kpi({
  label,
  value,
  hint,
  gold,
}: {
  label: string;
  value: string;
  hint: string;
  gold?: boolean;
}) {
  return (
    <div className="card">
      <div className="stat-k">{label}</div>
      <div
        className="stat-v"
        style={gold ? { color: "var(--gold)" } : undefined}
      >
        {value}
      </div>
      <div className="stat-h">{hint}</div>
    </div>
  );
}

function titleCase(s: string) {
  return s
    .toLowerCase()
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
