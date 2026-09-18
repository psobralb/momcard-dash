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

const GITHUB_DATA_BASE =
  "https://raw.githubusercontent.com/psobralb/momcard-dash/main/src/data";

const CATEGORY_ORDER = [
  "fl-household",
  "other",
  "pedro-tech-saas",
  "bastrop-local",
  "travel",
  "pedro-work-onsite",
];

async function readJsonRemote<T>(rel: string): Promise<T> {
  const res = await fetch(`${GITHUB_DATA_BASE}/${rel}`, { next: { revalidate: 300 } });
  if (!res.ok) throw new Error(`Failed to fetch ${rel}: ${res.status}`);
  return (await res.json()) as T;
}

function applyH1PedroBurnOverlay(
  monthly: PedroBurnMonth[],
  appleParkedTotal: number,
  correction?: { pedroTechNewMerchants?: Array<{ month: string; amount: number }> }
): {
  monthly: PedroBurnMonth[];
  pedroBurnTotal: number;
  avgPedroBurn: number;
  appleParkedTotal: number;
  burnNote: string;
} {
  const addByMonth = new Map<string, number>();
  let burnNote = "pedroBurnCorrected.totalAcrossAudit";
  if (correction) {
    for (const row of correction.pedroTechNewMerchants ?? []) {
      addByMonth.set(row.month, (addByMonth.get(row.month) ?? 0) + (row.amount ?? 0));
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
      pedroTechExApple: Math.round((m.pedroTechExApple + add) * 100) / 100,
      oldPedroTechInclApple: Math.round((m.oldPedroTechInclApple + add) * 100) / 100,
    };
  });
  const pedroBurnTotal =
    Math.round(patched.reduce((s, m) => s + m.pedroTechExApple, 0) * 100) / 100;
  const avgPedroBurn =
    patched.length === 0 ? 0 : Math.round((pedroBurnTotal / patched.length) * 100) / 100;
  return { monthly: patched, pedroBurnTotal, avgPedroBurn, appleParkedTotal, burnNote };
}

export async function loadDashboardData(): Promise<DashboardData> {
  const billing = await readJsonRemote<{
    generatedAt?: string;
    accountLast4?: string;
    cardholder?: string;
    dateRangeLabel?: string;
    ytdPurchases?: number;
    categoryKeys?: string[];
    pedroBurnCorrected: {
      monthly: PedroBurnMonth[];
      totalAcrossAudit: number;
      avgPerMonth: number;
      appleParkedTotal: number;
    };
  }>("billing.json");

  const monthIds = ["01","02","03","04","05","06","07","08","09"];
  const months = await Promise.all(
    monthIds.map((m) => readJsonRemote<CitiMonth>(`citi-0183-2026-${m}.json`))
  );

  let correction: { pedroTechNewMerchants?: Array<{ month: string; amount: number }> } | undefined;
  try {
    correction = await readJsonRemote("sub-digest/extrato-h1-correction.json");
  } catch {
    correction = undefined;
  }

  const overlay = applyH1PedroBurnOverlay(
    billing.pedroBurnCorrected.monthly,
    billing.pedroBurnCorrected.appleParkedTotal,
    correction
  );

  // Prefer fields from billing if present; otherwise derive
  const categoryKeys = billing.categoryKeys ?? CATEGORY_ORDER;

  return {
    ...(billing as unknown as DashboardData),
    months,
    pedroBurnMonthly: overlay.monthly,
    pedroBurnTotal: overlay.pedroBurnTotal,
    avgPedroBurn: overlay.avgPedroBurn,
    appleParkedTotal: overlay.appleParkedTotal,
    burnNote: overlay.burnNote,
    categoryKeys,
    generatedAt: billing.generatedAt ?? new Date().toISOString(),
  } as DashboardData;
}
