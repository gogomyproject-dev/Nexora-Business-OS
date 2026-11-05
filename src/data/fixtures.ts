import type { Dataset, Status } from "../domain/types";
import { categories } from "../domain/types";
import { demoToday, shift } from "../lib/dates";
export function createDataset(): Dataset {
  let seed = 41017;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const companies = [
    { id: "a", name: "Company A" },
    { id: "b", name: "Company B" },
  ];
  const names = [
    "中央旗舰店",
    "北城分店",
    "湖畔分店",
    "南城旗舰店",
    "花园分店",
    "海湾分店",
  ];
  const locations = [
    "Kuala Lumpur",
    "Kepong",
    "Setapak",
    "Petaling Jaya",
    "Subang Jaya",
    "Klang",
  ];
  const branches = names.map((name, i) => ({
    id: "br" + i,
    companyId: i < 3 ? "a" : "b",
    name,
    location: locations[i],
  }));
  const employees = branches.flatMap((b) =>
    Array.from({ length: 3 }, (_, i) => ({
      id: b.id + "e" + i,
      name: "员工 " + String(branches.indexOf(b) * 3 + i + 1).padStart(2, "0"),
      companyId: b.companyId,
      branchId: b.id,
    })),
  );
  const data: Dataset = {
    companies,
    branches,
    employees,
    snapshots: [],
    expenses: [],
    claims: [],
    balances: [],
    cash: [],
    approvals: [],
    coverage: { start: shift(demoToday, -195), end: demoToday },
  };
  for (let day = 0; day < 196; day++) {
    const date = shift(data.coverage.start, day);
    for (const [i, b] of branches.entries()) {
      const scope = { companyId: b.companyId, branchId: b.id };
      const status: Status =
        (day + i) % 23 === 4
          ? "submitted"
          : (day + i) % 31 === 7
            ? "rejected"
            : day % 3 === 0
              ? "locked"
              : "approved";
      const revenue = Math.round(
        (1800 + i * 290 + random() * 1900) * (1 + day / 1200),
      );
      data.snapshots.push({
        ...scope,
        id: `s-${day}-${i}`,
        businessDate: date,
        revenue,
        winningPayout: Math.round(revenue * (0.14 + random() * 0.1)),
        netProfitDemo: Math.round(650 + i * 85 + random() * 550),
        approvalStatus: status,
      });
      categories.forEach((category, c) =>
        data.expenses.push({
          ...scope,
          id: `e-${day}-${i}-${c}`,
          businessDate: date,
          category,
          amount: Math.round(
            [180, 48, 25, 210, 140, 32, 40][c] * (0.8 + random() * 0.6),
          ),
          approvalStatus: status,
        }),
      );
      if (day % 3 === i % 3) {
        const cs: Status = [
          "approved",
          "submitted",
          "under_review",
          "locked",
          "rejected",
        ][Math.floor(random() * 5)] as Status;
        const id = `cl-${day}-${i}`;
        data.claims.push({
          ...scope,
          id,
          employeeId: b.id + "e" + (day % 3),
          claimDate: date,
          submittedAt: date,
          amount: Math.round(40 + random() * 390),
          approvalStatus: cs,
          paymentStatus:
            (cs === "approved" || cs === "locked") && day % 2 === 0
              ? "paid"
              : "unpaid",
        });
        data.approvals.push({
          ...scope,
          id: "ap-" + id,
          type: "claim",
          sourceRecordId: id,
          status: cs,
          submittedAt: date,
          summary: "交通与日常用品报销",
        });
      }
      if (day % 7 === 0 || day === 195) {
        for (let e = 0; e < 3; e++)
          data.balances.push({
            ...scope,
            employeeId: b.id + "e" + e,
            asOfDate: date,
            outstandingAmount: Math.round(100 + random() * 1800),
            approvalStatus: "approved",
          });
        data.cash.push({
          ...scope,
          id: `cash-${day}-${i}`,
          collectedAt: date,
          amount: Math.round(5000 + random() * 6000),
          approvalStatus: status,
        });
      }
      if (day % 4 === i % 4) {
        const type = (
          ["daily_sales", "cash_handover", "weekly_report", "other"] as const
        )[(day + i) % 4];
        data.approvals.push({
          ...scope,
          id: `ap-${day}-${i}`,
          type,
          status:
            day % 3 === 0
              ? "approved"
              : day % 2 === 0
                ? "submitted"
                : "under_review",
          submittedAt: date,
          summary: {
            daily_sales: "营业日报待核对",
            cash_handover: "现金交接凭证待核对",
            weekly_report: "分店周报待审核",
            other: "运营记录待确认",
          }[type],
        });
      }
    }
  }
  return data;
}
export const fixtures = createDataset();
