import type { Dataset, Filters, Scoped, Status } from "./types";
import { categories } from "./types";
import { days, previous, shift, validRange } from "../lib/dates";
import { money } from "../lib/format";
export const approved = (s: Status) => s === "approved" || s === "locked";
export const pending = (s: Status) => s === "submitted" || s === "under_review";
export const inScope = (r: Scoped, f: Filters) =>
  (f.company === "all" || r.companyId === f.company) &&
  (f.branch === "all" || r.branchId === f.branch);
export const inDate = (date: string, f: Filters) =>
  validRange(f.start, f.end) && date >= f.start && date <= f.end;
export const changeCompany = (
  f: Filters,
  company: string,
  d: Dataset,
): Filters => ({
  ...f,
  company,
  branch:
    f.branch === "all" ||
    d.branches.some(
      (b) =>
        b.id === f.branch && (company === "all" || b.companyId === company),
    )
      ? f.branch
      : "all",
});
export function financial(d: Dataset, f: Filters) {
  const snapshots = d.snapshots.filter(
    (r) =>
      inScope(r, f) &&
      inDate(r.businessDate, f) &&
      approved(r.approvalStatus) &&
      [r.revenue, r.winningPayout, r.netProfitDemo].every(Number.isFinite) &&
      r.revenue >= 0 &&
      r.winningPayout >= 0,
  );
  const expenses = d.expenses.filter(
    (r) =>
      inScope(r, f) &&
      inDate(r.businessDate, f) &&
      approved(r.approvalStatus) &&
      Number.isFinite(r.amount) &&
      r.amount >= 0,
  );
  return {
    revenue: snapshots.reduce((s, r) => s + r.revenue, 0),
    expenses: expenses.reduce((s, r) => s + r.amount, 0),
    winning: snapshots.reduce((s, r) => s + r.winningPayout, 0),
    commission: expenses
      .filter((r) => r.category === "commission")
      .reduce((s, r) => s + r.amount, 0),
    profit: snapshots.reduce((s, r) => s + r.netProfitDemo, 0),
    snapshots,
    expenseRecords: expenses,
  };
}
export function workflow(d: Dataset, f: Filters) {
  const claims = d.claims.filter(
    (r) =>
      inScope(r, f) && inDate(r.submittedAt, f) && pending(r.approvalStatus),
  );
  const other = d.approvals.filter(
    (r) =>
      r.type !== "claim" &&
      inScope(r, f) &&
      inDate(r.submittedAt, f) &&
      pending(r.status),
  );
  return {
    claim: claims.length,
    daily: other.filter(
      (r) => r.type === "daily_sales" || r.type === "cash_handover",
    ).length,
    weekly: other.filter((r) => r.type === "weekly_report").length,
    other: other.filter((r) => r.type === "other").length,
    total: claims.length + other.length,
    items: [
      ...other.map((r) => ({
        id: r.id,
        date: r.submittedAt,
        branchId: r.branchId,
        type: r.type,
        label: r.summary,
      })),
      ...claims.map((r) => ({
        id: r.id,
        date: r.submittedAt,
        branchId: r.branchId,
        type: "claim",
        label: "员工报销待审核",
      })),
    ],
  };
}
export function borrowing(d: Dataset, f: Filters) {
  const employees = d.employees.filter((e) => inScope(e, f));
  const rows = employees.map((e) => {
    const record = d.balances
      .filter(
        (r) =>
          r.employeeId === e.id &&
          inScope(r, f) &&
          r.asOfDate <= f.end &&
          approved(r.approvalStatus),
      )
      .sort((a, b) => b.asOfDate.localeCompare(a.asOfDate))[0];
    return { ...e, record };
  });
  return {
    rows,
    total: rows.reduce((s, r) => s + (r.record?.outstandingAmount ?? 0), 0),
    missing: rows.filter((r) => !r.record).length,
    count: rows.filter((r) => r.record && r.record.outstandingAmount > 0)
      .length,
  };
}
export function analyze(d: Dataset, f: Filters) {
  const current = financial(d, f);
  const p = previous(f.start, f.end);
  const prior = financial(d, { ...f, ...p });
  const comparable =
    validRange(f.start, f.end) &&
    p.start >= d.coverage.start &&
    f.end <= d.coverage.end;
  const delta = (
    key: "revenue" | "expenses" | "winning" | "commission" | "profit",
  ) =>
    comparable &&
    prior[key] !== 0 &&
    (key === "expenses" || key === "commission"
      ? prior.expenseRecords.length > 0 && current.expenseRecords.length > 0
      : prior.snapshots.length > 0 && current.snapshots.length > 0)
      ? ((current[key] - prior[key]) / Math.abs(prior[key])) * 100
      : null;
  const branches = d.branches
    .filter((b) => inScope({ companyId: b.companyId, branchId: b.id }, f))
    .map((b) => ({ ...b, ...financial(d, { ...f, branch: b.id }) }));
  const span = days(f.start, f.end);
  const buckets = new Map<string, number>();
  if (current.snapshots.length && span <= 31) {
    for (let offset = 0; offset < span; offset++)
      buckets.set(shift(f.start, offset), 0);
  }
  current.snapshots.forEach((r) => {
    const key =
      span <= 31
        ? r.businessDate
        : span <= 120
          ? shift(
              f.start,
              Math.floor((days(f.start, r.businessDate) - 1) / 7) * 7,
            )
          : r.businessDate.slice(0, 7);
    buckets.set(key, (buckets.get(key) ?? 0) + r.revenue);
  });
  const claims = d.claims.filter(
    (r) => inScope(r, f) && inDate(r.claimDate, f),
  );
  const sum = (rows: typeof claims) => rows.reduce((s, r) => s + r.amount, 0);
  const cash = d.cash.filter(
    (r) =>
      inScope(r, f) && inDate(r.collectedAt, f) && approved(r.approvalStatus),
  );
  return {
    ...current,
    delta,
    branches,
    trend: [...buckets]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, revenue]) => ({ date, revenue })),
    aggregation: span <= 31 ? "按日" : span <= 120 ? "按周" : "按月",
    categories: categories.map((category) => ({
      category,
      value: current.expenseRecords
        .filter((r) => r.category === category)
        .reduce((s, r) => s + r.amount, 0),
    })),
    workflow: workflow(d, f),
    borrowing: borrowing(d, f),
    claims: {
      rows: claims,
      total: sum(claims),
      approved: sum(claims.filter((r) => approved(r.approvalStatus))),
      paid: sum(
        claims.filter(
          (r) => approved(r.approvalStatus) && r.paymentStatus === "paid",
        ),
      ),
      pending: sum(claims.filter((r) => pending(r.approvalStatus))),
    },
    cash: {
      rows: cash,
      total: cash.reduce((s, r) => s + r.amount, 0),
      branches: new Set(cash.map((r) => r.branchId)).size,
    },
  };
}
export const questions = [
  "所选期间哪间分店营业额最高？",
  "所选期间总开销多少？",
  "所选期间哪间分店演示利润最高？",
  "有多少 Claim 等待审核？",
  "员工借粮未还总额是多少？",
];
export function answer(question: string, d: Dataset, f: Filters) {
  const i = questions.indexOf(question.trim());
  if (i < 0) return "目前为 Demo，暂不支持此问题。请使用下方预设问题。";
  if (!validRange(f.start, f.end)) return "请先选择有效日期范围。";
  const period = f.start + " 至 " + f.end;
  if (i === 3)
    return `${period} 提交的 Claim 中，当前有 ${workflow(d, f).claim} 项等待审核。仅为独立流程数量统计，未读取待审核财务金额。`;
  if (i === 4) {
    const b = borrowing(d, f);
    return `截至 ${f.end}，员工借粮未还余额为 ${money(b.total)}${b.missing ? `；${b.missing} 位员工无余额数据，汇总不完整` : ""}。`;
  }
  const a = financial(d, f);
  if (!a.snapshots.length && !a.expenseRecords.length)
    return `${period} 没有已审核财务数据。`;
  if (i === 1)
    return `${period} 已审核总开销为 ${money(a.expenses)}，其中佣金 ${money(a.commission)} 已包含在总开销内。`;
  const rows = d.branches
    .filter((b) => inScope({ companyId: b.companyId, branchId: b.id }, f))
    .map((b) => ({ name: b.name, ...financial(d, { ...f, branch: b.id }) }));
  const key = i === 0 ? "revenue" : "profit";
  rows.sort((a, b) => b[key] - a[key]);
  return `${period}，${rows[0]?.name ?? "—"}的${i === 0 ? "营业额" : "演示净利润"}最高，为 ${money(rows[0]?.[key] ?? 0)}。${i === 2 ? "非正式会计利润，仅使用独立模拟字段。" : "仅统计已审核模拟数据。"}`;
}
