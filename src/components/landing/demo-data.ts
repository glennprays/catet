import type { BudgetRow, Overview, Source, StsTrendData } from "@/lib/api/hooks";

/**
 * Fixtures for the landing page (DESIGN.md §5 "Landing"). The marketing hero
 * composes the real `BalanceHero`, `SourceCard` and `BudgetProgressRow`
 * against these numbers rather than a screenshot, so the product page can
 * never drift from the product. Nothing here touches the API.
 */
export const DEMO_OVERVIEW: Overview = {
  sts_minor: 8_003_500,
  runway_days: 34,
  daily_allowance_minor: 266_800,
  reserved_tomorrow_minor: 1_070_000,
  reserved_minor: 1_070_000,
  available_minor: 9_073_500,
  essential_minor: 2_150_000,
  lifestyle_minor: 1_320_000,
  recent: [],
  badges: { needs_review: 0, hold_queue: 0, bills_overdue: 0 },
};

const TREND_DAYS = 30;
const TREND_START_MINOR = 6_200_000;
const TREND_START_RUNWAY = 28;

/**
 * 30 rising days ending on the hero figure — a shape, not a claim. Exported as
 * plain data: a server component may pass it to a client one, while the
 * `BoundaryQuery` wrapper (which carries a `refetch` *function*) is built
 * inside `DemoHero`, because functions cannot cross the RSC boundary.
 */
export const DEMO_TREND_POINTS: StsTrendData["points"] = Array.from(
  { length: TREND_DAYS },
  (_, index) => {
    const ratio = index / (TREND_DAYS - 1);
    const date = new Date(Date.UTC(2026, 7, 16 + index));
    return {
      date: date.toISOString().slice(0, 10),
      sts_minor: Math.round(
        TREND_START_MINOR + (DEMO_OVERVIEW.sts_minor - TREND_START_MINOR) * ratio,
      ),
      runway_days: Math.round(
        TREND_START_RUNWAY + (DEMO_OVERVIEW.runway_days - TREND_START_RUNWAY) * ratio,
      ),
    };
  },
);

export const DEMO_SOURCES: Source[] = [
  {
    id: "demo-bca",
    name: "BCA",
    type: "bank",
    is_debt: false,
    currency: "IDR",
    balance_minor: 17_340_000,
  },
  {
    id: "demo-gopay",
    name: "GoPay",
    type: "ewallet",
    is_debt: false,
    currency: "IDR",
    balance_minor: 493_000,
  },
  {
    id: "demo-spaylater",
    name: "SPayLater",
    type: "custom",
    is_debt: true,
    currency: "IDR",
    balance_minor: -1_289_000,
  },
];

export const DEMO_ASSET_TOTAL = DEMO_SOURCES.filter((source) => !source.is_debt).reduce(
  (sum, source) => sum + source.balance_minor,
  0,
);

export const DEMO_DEBT_TOTAL = DEMO_SOURCES.filter((source) => source.is_debt).reduce(
  (sum, source) => sum + Math.abs(source.balance_minor),
  0,
);

export const DEMO_BUDGETS: Pick<
  BudgetRow,
  "category_id" | "category_name" | "spent_minor" | "amount_minor"
>[] = [
  {
    category_id: "demo-makan",
    category_name: "Makanan & Minuman",
    spent_minor: 1_284_000,
    amount_minor: 1_500_000,
  },
  {
    category_id: "demo-transport",
    category_name: "Transportasi",
    spent_minor: 224_000,
    amount_minor: 400_000,
  },
  {
    category_id: "demo-hiburan",
    category_name: "Hiburan",
    spent_minor: 540_000,
    amount_minor: 500_000,
  },
];
