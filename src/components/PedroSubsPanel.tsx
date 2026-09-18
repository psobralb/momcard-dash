import { formatUsd } from "@/lib/types";

type Sub = {
  merchant: string;
  periodTotal: number;
  chargeCount: number;
  avgPerMonthAcrossAudit: number;
  status: string;
};

export function PedroSubsPanel({ subs }: { subs: Sub[] }) {
  const top = subs.slice(0, 8);
  if (top.length === 0) return null;

  return (
    <div className="card">
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <h2 className="m-0 text-[14px] font-medium">pedro subs (digest)</h2>
        <span className="pill pedro">waiting pedro ok · no cancels</span>
      </div>
      <div className="space-y-0">
        {top.map((s) => (
          <div className="tx-row" key={s.merchant}>
            <span className="mono text-[11px]" style={{ color: "var(--dim)" }}>
              {s.chargeCount}×
            </span>
            <span>
              {s.merchant}
              <span
                className="mt-0.5 block text-[11px]"
                style={{ color: "var(--dim)" }}
              >
                ~{formatUsd(s.avgPerMonthAcrossAudit)}/mo avg · {s.status}
              </span>
            </span>
            <span className="mono" style={{ color: "var(--gold)" }}>
              {formatUsd(s.periodTotal)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
