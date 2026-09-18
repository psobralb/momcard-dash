export type PedroBurnMonth = {
  month: string;
  pedroTechExApple: number;
  appleFamilyAmbiguous: number;
  oldPedroTechInclApple: number;
};

export type CitiMonth = {
  month: string;
  summary: {
    last4: string;
    name: string;
    product: string;
    period: string;
    purchases: number;
    newBalance: number;
    interest: number;
  };
  byCategory: Record<string, number>;
  pedroTechTotal: number;
  transactions: Array<{
    transDate?: string;
    postDate?: string;
    description: string;
    amount: number;
    category: string;
    flags?: string[];
    merchant?: string;
  }>;
};

export type DashboardData = {
  generatedAt: string;
  accountLast4: string;
  cardholder: string;
  dateRangeLabel: string;
  ytdPurchases: number;
  pedroBurnTotal: number;
  appleParkedTotal: number;
  avgPedroBurn: number;
  pedroBurnMonthly: PedroBurnMonth[];
  months: CitiMonth[];
  categoryKeys: string[];
  burnNote?: string;
  pedroSubs: Array<{
    merchant: string;
    periodTotal: number;
    chargeCount: number;
    avgPerMonthAcrossAudit: number;
    status: string;
  }>;
};

export function formatUsd(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(n);
}

export const CATEGORY_COLORS: Record<string, string> = {
  "fl-household": "#8b9dc3",
  other: "#5c616c",
  "pedro-tech-saas": "#c9a66b",
  "bastrop-local": "#7a9e8e",
  travel: "#9a958c",
  "pedro-work-onsite": "#a8844a",
};

export const CATEGORY_LABELS: Record<string, string> = {
  "fl-household": "FL household",
  other: "other",
  "pedro-tech-saas": "pedro tech / saas",
  "bastrop-local": "bastrop local",
  travel: "travel",
  "pedro-work-onsite": "pedro work onsite",
};
