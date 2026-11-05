import { describe, it, expect } from "vitest";
import { createDataset, fixtures as d } from "../data/fixtures";
import {
  analyze,
  financial,
  borrowing,
  workflow,
  answer,
  questions,
  changeCompany,
} from "./analytics";
import {
  demoToday,
  range,
  previous,
  validRange,
  shift,
  days,
} from "../lib/dates";
import { margin, money } from "../lib/format";
import type { Dataset, Filters } from "./types";
const f: Filters = { company: "all", branch: "all", ...range("month") };
describe("Dashboard data integrity", () => {
  it("excludes invalid monetary records and invalid calendar dates", () => {
    const t = structuredClone(d);
    const before = financial(d, f);
    t.snapshots.push({
      ...d.snapshots[0],
      businessDate: f.start,
      approvalStatus: "approved",
      revenue: NaN,
    });
    t.expenses.push({
      ...d.expenses[0],
      businessDate: f.start,
      approvalStatus: "approved",
      amount: Infinity,
    });
    expect(financial(t, f).revenue).toBe(before.revenue);
    expect(financial(t, f).expenses).toBe(before.expenses);
    expect(validRange("2026-02-30", "2026-03-02")).toBe(false);
  });
  it("fixtures are reproducible, anonymous and cover current + previous 12 weeks", () => {
    expect(createDataset()).toEqual(d);
    expect(d.employees).toHaveLength(18);
    expect(days(d.coverage.start, d.coverage.end)).toBeGreaterThanOrEqual(168);
    const r = range("12weeks");
    expect(days(r.start, r.end)).toBe(84);
    expect(previous(r.start, r.end).start >= d.coverage.start).toBe(true);
  });
  it("all company KPIs match branch sums and donut categories", () => {
    const a = analyze(d, f);
    for (const k of [
      "revenue",
      "expenses",
      "winning",
      "commission",
      "profit",
    ] as const)
      expect(a.branches.reduce((s, b) => s + b[k], 0)).toBe(a[k]);
    expect(a.categories.reduce((s, c) => s + c.value, 0)).toBe(a.expenses);
    expect(a.categories.find((c) => c.category === "commission")?.value).toBe(
      a.commission,
    );
    expect(a.trend.reduce((s, r) => s + r.revenue, 0)).toBe(a.revenue);
  });
  it("company and branch isolation and company change reset", () => {
    const a = analyze(d, { ...f, company: "a" });
    expect(a.branches).toHaveLength(3);
    expect(a.snapshots.every((s) => s.companyId === "a")).toBe(true);
    expect(a.claims.rows.every((s) => s.companyId === "a")).toBe(true);
    expect(
      changeCompany({ ...f, company: "a", branch: "br0" }, "b", d).branch,
    ).toBe("all");
    expect(changeCompany({ ...f, branch: "br0" }, "a", d).branch).toBe("br0");
  });
  it("dates update all period selectors and end-date borrowing", () => {
    const a = analyze(d, f),
      b = analyze(d, { ...f, ...range("last") });
    expect(a.revenue).not.toBe(b.revenue);
    expect(a.expenses).not.toBe(b.expenses);
    expect(a.trend).not.toEqual(b.trend);
    expect(a.categories).not.toEqual(b.categories);
    expect(a.cash.total).not.toBe(b.cash.total);
    expect(a.claims.total).not.toBe(b.claims.total);
    expect(a.borrowing.total).not.toBe(b.borrowing.total);
    expect(a.workflow.total).not.toBe(b.workflow.total);
  });
  it("pending/rejected money cannot enter any financial KPI", () => {
    const before = financial(d, f);
    const mutated = structuredClone(d);
    for (const s of [
      "draft",
      "submitted",
      "under_review",
      "rejected",
    ] as const) {
      mutated.snapshots.push({
        ...d.snapshots[0],
        id: s,
        businessDate: f.start,
        approvalStatus: s,
        revenue: 99999999,
        winningPayout: 99999999,
        netProfitDemo: 99999999,
      });
      mutated.expenses.push({
        ...d.expenses[0],
        id: s,
        businessDate: f.start,
        approvalStatus: s,
        amount: 99999999,
      });
    }
    const after = financial(mutated, f);
    for (const k of [
      "revenue",
      "expenses",
      "winning",
      "commission",
      "profit",
    ] as const)
      expect(after[k]).toBe(before[k]);
  });
  it("borrowing uses latest approved balance, including before start, not future or pending", () => {
    const t = structuredClone(d);
    t.employees = [d.employees[0]];
    const scope = {
      employeeId: t.employees[0].id,
      companyId: "a",
      branchId: "br0",
      approvalStatus: "approved" as const,
    };
    t.balances = [
      { ...scope, asOfDate: shift(f.start, -10), outstandingAmount: 100 },
      { ...scope, asOfDate: shift(f.start, -2), outstandingAmount: 70 },
      { ...scope, asOfDate: shift(f.end, 1), outstandingAmount: 900 },
      {
        ...scope,
        asOfDate: f.end,
        outstandingAmount: 800,
        approvalStatus: "submitted",
      },
    ];
    expect(borrowing(t, f).total).toBe(70);
    t.balances = [];
    expect(borrowing(t, f).missing).toBe(1);
  });
  it("claim approved includes paid subset and pending workflow is not double-counted", () => {
    const t = structuredClone(d);
    const base = { ...d.claims[0], claimDate: f.start, submittedAt: f.start };
    t.claims = [
      {
        ...base,
        id: "approved",
        amount: 100,
        approvalStatus: "approved",
        paymentStatus: "unpaid",
      },
      {
        ...base,
        id: "paid",
        amount: 60,
        approvalStatus: "locked",
        paymentStatus: "paid",
      },
      {
        ...base,
        id: "pending",
        amount: 40,
        approvalStatus: "submitted",
        paymentStatus: "unpaid",
      },
    ];
    t.approvals = [
      {
        ...d.approvals[0],
        type: "claim",
        sourceRecordId: "pending",
        status: "submitted",
        submittedAt: f.start,
      },
    ];
    const a = analyze(t, f);
    expect(a.claims.total).toBe(200);
    expect(a.claims.approved).toBe(160);
    expect(a.claims.paid).toBe(60);
    expect(a.claims.pending).toBe(40);
    expect(workflow(t, f).claim).toBe(1);
    expect(workflow(t, f).total).toBe(1);
  });
  it("zero revenue has safe margin, empty period is distinct from known balance", () => {
    expect(margin(50, 0)).toBe("—");
    const a = analyze(d, { ...f, start: "2026-11-06", end: "2026-11-07" });
    expect(a.revenue).toBe(0);
    expect(a.snapshots).toHaveLength(0);
    expect(a.borrowing.total).toBeGreaterThan(0);
    expect(a.delta("revenue")).toBeNull();
  });
  it("date validation, contiguous comparison and incomplete coverage", () => {
    expect(validRange("2026-11-06", "2026-11-01")).toBe(false);
    expect(validRange("", "")).toBe(false);
    expect(previous("2026-11-01", "2026-11-05")).toEqual({
      start: "2026-10-27",
      end: "2026-10-31",
    });
    expect(
      analyze(d, {
        ...f,
        start: d.coverage.start,
        end: shift(d.coverage.start, 4),
      }).delta("revenue"),
    ).toBeNull();
    const t: Dataset = {
      ...d,
      snapshots: d.snapshots.map((r) => ({ ...r, revenue: 0 })),
    };
    expect(analyze(t, f).delta("revenue")).toBeNull();
    expect(range("week").end).toBe(demoToday);
  });
  it("AI presets use filtered data, label demo profit and reject unsupported input", () => {
    const a = analyze(d, f);
    expect(answer(questions[1], d, f)).toContain(money(a.expenses));
    expect(answer(questions[2], d, f)).toContain("非正式会计利润");
    expect(answer(questions[3], d, f)).toContain(String(a.workflow.claim));
    expect(answer(questions[4], d, f)).toContain(money(a.borrowing.total));
    expect(answer("执行付款", d, f)).toContain("暂不支持");
    expect(answer(questions[0], d, { ...f, company: "b" })).toContain(f.start);
  });
  it("workflow only returns pending counts, ignores draft/rejected and uses submission date", () => {
    const t = structuredClone(d);
    t.approvals = [];
    t.claims = [
      {
        ...d.claims[0],
        claimDate: "2026-01-01",
        submittedAt: f.start,
        approvalStatus: "under_review",
      },
    ];
    expect(workflow(t, f).claim).toBe(1);
    expect(analyze(t, f).claims.total).toBe(0);
    t.claims[0].approvalStatus = "rejected";
    expect(workflow(t, f).claim).toBe(0);
  });
});
