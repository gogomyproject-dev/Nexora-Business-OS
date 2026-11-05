export type Status =
  "draft" | "submitted" | "under_review" | "rejected" | "approved" | "locked";
export interface Company {
  id: string;
  name: string;
}
export interface Branch {
  id: string;
  companyId: string;
  name: string;
  location: string;
}
export interface Scoped {
  companyId: string;
  branchId: string;
}
export interface Snapshot extends Scoped {
  id: string;
  businessDate: string;
  revenue: number;
  winningPayout: number;
  netProfitDemo: number;
  approvalStatus: Status;
}
export const categories = [
  "rental",
  "utilities",
  "internet",
  "payroll",
  "commission",
  "maintenance",
  "other",
] as const;
export type Category = (typeof categories)[number];
export interface Expense extends Scoped {
  id: string;
  businessDate: string;
  category: Category;
  amount: number;
  approvalStatus: Status;
}
export interface Claim extends Scoped {
  id: string;
  employeeId: string;
  claimDate: string;
  submittedAt: string;
  amount: number;
  approvalStatus: Status;
  paymentStatus: "unpaid" | "paid";
}
export interface Balance extends Scoped {
  employeeId: string;
  asOfDate: string;
  outstandingAmount: number;
  approvalStatus: Status;
}
export interface Cash extends Scoped {
  id: string;
  collectedAt: string;
  amount: number;
  approvalStatus: Status;
}
export type ApprovalType =
  "daily_sales" | "cash_handover" | "weekly_report" | "claim" | "other";
export interface Approval extends Scoped {
  id: string;
  type: ApprovalType;
  status: Status;
  submittedAt: string;
  summary: string;
  sourceRecordId?: string;
}
export interface Dataset {
  companies: Company[];
  branches: Branch[];
  employees: (Scoped & { id: string; name: string })[];
  snapshots: Snapshot[];
  expenses: Expense[];
  claims: Claim[];
  balances: Balance[];
  cash: Cash[];
  approvals: Approval[];
  coverage: { start: string; end: string };
}
export interface Filters {
  company: string;
  branch: string;
  start: string;
  end: string;
}
