export const money = (v: number) =>
  "RM " +
  new Intl.NumberFormat("en-MY", { maximumFractionDigits: 0 }).format(v);
export const margin = (profit: number, revenue: number) =>
  revenue === 0 ? "—" : ((profit / revenue) * 100).toFixed(1) + "%";
