import { readFileSync, readdirSync, existsSync } from "fs";
import path from "path";
import type { CitiMonth, DashboardData, PedroBurnMonth } from "./types";

export type {
  CitiMonth,
  DashboardData,
  PedroBurnMonth,
} from "./types";
export {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  formatUsd,
} from "./types";

const CATEGORY_ORDER = [
  "fl-household",
  "other",
  "pedro-tech-saas",
  "bastrop-local",
  "travel",
  "pedro-work-onsite",
];

function dataRoot(): string {
  const sibling = path.join(process.cwd(), "..", "data");
  if (existsSync(sibling)) return sibling;
  const local = path.join(process.cwd(), "src", "data");
  if (existsSync(local)) return local;
  throw new Error("momcard data directory not found (../data or src/data)");
}

function readJson<T>(filePath: string): T {
  return JSON.parse(readFileSync(filePath, "utf8")) as T;
}

/** H1 FX rewrite found ElevenLabs + General Intelligence — billing.json not yet recomputed. */
function applyH1PedroBurnOverlay(
  root: string,
  monthly: PedroBurnMonth[],
  appleParkedTotal: number
): {
  monthly: PedroBurnMonth[];
  pedroBurnTotal: number;
  avgPedroBurn: number;
  appleParkedTotal: number;
  burnNote: string;
} {
  const correctionPath = path.join(
    root,
    "sub-digest",
    "extrato-h1-correction.json"
  );
  const addByMonth = new Map<string, number>();
  let burnNote = "pedroBurnCorrected.totalAcrossAudit";

  if (existsSync(correctionPath)) {
    const correction = readJson<{
      pedroTechNewMerchants?: Array<{ month: string; amount: number }>;
      h1?: { pedroTechDelta?: number };
    }>(correctionPath);
    for (const row of correction.pedroTechNewMerchants ?? []) {
      addByMonth.set(
        row.month,
        (addByMonth.get(row.month) ?? 0) + (row.amount ?? 0)
      );
    }
    const delta = [...addByMonth.values()].reduce((s, n) => s + n, 0);
    if (delta > 0) {
      burnNote = `H1 FX overlay +$${delta.toFixed(0)} (ElevenLabs + General Intelligence)`;
    }
  }

  const patched = monthly.map((m) => {
    const add = addByMonth.get(m.month) ?? 0;
    if (!add) return m;
    return {
      ...m,
      pedroTechExApple:
        Math.round((m.pedroTechExApple + add) * 100) / 100,
      oldPedroTechInclApple:
        Math.round((m.oldPedroTechInclApple + add) * 100) / 100,
    };
  });

  const pedroBurnTotal =
    Math.round(
      patched.reduce((s, m) => s + m.pedroTechExApple, 0) * 100
    ) / 100;
  const avgPedroBurn =
    patched.length === 0
      ? 0
      : Math.round((pedroBurnTotal / patched.length) * 100) / 100;

  return {
    monthly: patched,
    pedroBurnTotal,
    avgPedroBurn,
    appleParkedTotal,
    burnNote,
  };
}

export function loadDashboardData(): DashboardData {
  const root = dataRoot();
  const billing = readJson<{
    generatedAt?: string;
    pedroBurnCorrected: {
      monthly: PedroBurnMonth[];
      totalAcrossAudit: number;
      avgPerMonth: number;
      appleParkedTotal: number;
    };
  }>(path.join(root, "billing.json"));

  const citiFiles = readdirSync(root)
    .filter((f) => /^citi-0183-2026-\d{2}\.json$/.test(f))
    .sort();

  const months: CitiMonth[] = citiFiles.map((f) => {
    const m = f.match(/citi-0183-(2026-\d{2})\.json$/);
    const month = m?.[1] ?? f;
    const raw = readJson<{
      summary: CitiMonth["summary"];
      byCategory: Record<string, number>;
      pedroTechTotal: number;
      transactions: CitiMonth["transactions"];
    }>(path.join(root, f));
    return {
      month,
      summary: raw.summary,
      byCategory: raw.byCategory ?? {},
      pedroTechTotal: raw.pedroTechTotal ?? 0,
      transactions: raw.transactions ?? [],
    };
  });

  const categorySet = new Set<string>();
  for (const m of months) {
    for (const k of Object.keys(m.byCategory)) categorySet.add(k);
  }
  const categoryKeys = [
    ...CATEGORY_ORDER.filter((k) => categorySet.has(k)),
    ...[...categorySet].filter((k) => !CATEGORY_ORDER.includes(k)).sort(),
  ];

  const ytdPurchases = months.reduce(
    (s, m) => s + (m.summary.purchases ?? 0),
    0
  );

  let pedroSubs: DashboardData["pedroSubs"] = [];
  const masterPath = path.join(root, "sub-digest", "MASTER-reduce.json");
  if (existsSync(masterPath)) {
    const master = readJson<{
      pedroBurnMerchants?: DashboardData["pedroSubs"];
    }>(masterPath);
    pedroSubs = (master.pedroBurnMerchants ?? []).map((x) => ({
      merchant: x.merchant,
      periodTotal: x.periodTotal,
      chargeCount: x.chargeCount,
      avgPerMonthAcrossAudit: x.avgPerMonthAcrossAudit,
      status: x.status,
    }));
  }

  const burn = applyH1PedroBurnOverlay(
    root,
    billing.pedroBurnCorrected.monthly,
    billing.pedroBurnCorrected.appleParkedTotal
  );

  const first = months[0]?.month ?? "2026-01";
  const last = months[months.length - 1]?.month ?? "2026-09";
  const cardholder =
    months[months.length - 1]?.summary.name ?? "PAULA BARIFOUSE";

  return {
    generatedAt: billing.generatedAt ?? "",
    accountLast4: "0183",
    cardholder,
    dateRangeLabel: `${first} → ${last}`,
    ytdPurchases: Math.round(ytdPurchases * 100) / 100,
    pedroBurnTotal: burn.pedroBurnTotal,
    appleParkedTotal: burn.appleParkedTotal,
    avgPedroBurn: burn.avgPedroBurn,
    pedroBurnMonthly: burn.monthly,
    months,
    categoryKeys,
    pedroSubs,
    burnNote: burn.burnNote,
  };
}
