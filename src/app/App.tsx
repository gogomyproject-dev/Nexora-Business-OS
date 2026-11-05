import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  LayoutDashboard,
  ChartNoAxesCombined,
  Wallet,
  Store,
  Users,
  HandCoins,
  ReceiptText,
  Files,
  Calculator,
  Sparkles,
  Bell,
  ChevronRight,
  ArrowUpRight,
  Menu,
  CalendarDays,
  Trophy,
  Coins,
  Send,
  Clock3,
  ArrowRight,
  ShieldCheck,
  PanelLeftClose,
  Search,
  RotateCcw,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import type { Dataset, Filters } from "../domain/types";
import { analyze, answer, questions, changeCompany } from "../domain/analytics";
import { range, demoToday, validRange } from "../lib/dates";
import { money, margin } from "../lib/format";
import { dashboardRepository } from "../services/dashboardRepository";
import { DetailDrawer } from "../components/ui/dialog";
const nav: [string, string, LucideIcon][] = [
  ["业务总览", "Overview", LayoutDashboard],
  ["营业报表", "Sales reports", ChartNoAxesCombined],
  ["财务概览", "Finance", Wallet],
  ["分店表现", "Branch performance", Store],
  ["员工管理", "Employees", Users],
  ["借粮管理", "Borrowing", HandCoins],
  ["报销申请", "Claims", ReceiptText],
  ["账单与支出", "Bills & expenses", Files],
  ["会计报表", "Accounting", Calculator],
  ["AI 查询助手", "AI assistant", Sparkles],
];
const labels: Record<string, string> = {
  rental: "租金",
  utilities: "水电费",
  internet: "网络 / 通讯",
  payroll: "薪水",
  commission: "佣金",
  maintenance: "维修保养",
  other: "其他开销",
};
const colors = [
  "#3185fc",
  "#36bd83",
  "#ffc14a",
  "#ff924c",
  "#9561eb",
  "#49b8d2",
  "#ef80ac",
];
const statusLabels: Record<string, string> = {
  draft: "草稿",
  submitted: "已提交",
  under_review: "审核中",
  rejected: "已拒绝",
  approved: "已批准",
  locked: "已锁定",
};
const metrics: [
  string,
  string,
  "revenue" | "expenses" | "winning" | "commission" | "profit",
  LucideIcon,
  string,
][] = [
  ["总营业额", "Total revenue", "revenue", ChartNoAxesCombined, "green"],
  ["总开销", "Total expenses", "expenses", Wallet, "red"],
  ["中奖 / 派彩", "Winning / payout", "winning", Trophy, "blue"],
  ["佣金支出", "Commission", "commission", Users, "purple"],
  ["演示净利润", "Net profit demo", "profit", Coins, "yellow"],
];
const Empty = ({ text = "所选期间暂无已审核数据" }: { text?: string }) => (
  <div className="empty">
    <Search size={24} />
    <p>{text}</p>
    <small>试试其他公司、分店或日期范围</small>
  </div>
);
export default function App() {
  const [data, setData] = useState<Dataset | null>(null),
    [error, setError] = useState(false),
    [retry, setRetry] = useState(0),
    [page, setPage] = useState(0),
    [mobile, setMobile] = useState(false),
    [collapsed, setCollapsed] = useState(false),
    [preset, setPreset] = useState("month");
  useEffect(() => {
    if (!mobile) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobile(false);
    };
    document.addEventListener("keydown", onKey);
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = oldOverflow;
    };
  }, [mobile]);
  const [f, setF] = useState<Filters>({
    company: "all",
    branch: "all",
    ...range("month"),
  });
  const [sort, setSort] = useState<{
    key: "name" | "revenue" | "expenses" | "profit";
    asc: boolean;
  }>({ key: "revenue", asc: false });
  const [drawer, setDrawer] = useState<{
      title: string;
      kind: string;
      id?: string;
    } | null>(null),
    [query, setQuery] = useState(""),
    [asked, setAsked] = useState("");
  useEffect(() => {
    let active = true;
    setError(false);
    dashboardRepository
      .getDashboardData()
      .then((d) => {
        if (active) setData(d);
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
  }, [retry]);
  const valid = validRange(f.start, f.end);
  const a = useMemo(
    () => (data && valid ? analyze(data, f) : null),
    [data, f, valid],
  );
  const reply = useMemo(
    () => (data && asked ? answer(asked, data, f) : ""),
    [data, asked, f],
  );
  const open = (title: string, kind: string, id?: string) =>
    setDrawer({ title, kind, id });
  const bn = (id: string) =>
    data?.branches.find((b) => b.id === id)?.name ?? id;
  const rows = a
    ? [...a.branches].sort((x, y) => {
        const v =
          sort.key === "name"
            ? x.name.localeCompare(y.name)
            : x[sort.key] - y[sort.key];
        return sort.asc ? v : -v;
      })
    : [];
  const sortBy = (key: typeof sort.key) =>
    setSort((s) => ({ key, asc: s.key === key ? !s.asc : false }));
  function details() {
    if (!a || !drawer || !data) return null;
    const k = drawer.kind;
    let entries: { id: string; title: string; sub: string; value: string }[] =
      [];
    let note = "仅已审核模拟数据 · 当前筛选范围";
    if (k === "branch") {
      const b = a.branches.find((b) => b.id === drawer.id);
      if (b) {
        note =
          b.location +
          " · 演示利润率 " +
          margin(b.profit, b.revenue) +
          "（非正式会计口径）";
        entries = [
          ["营业额", b.revenue],
          ["总开销（含佣金）", b.expenses],
          ["演示净利润（非正式会计利润）", b.profit],
        ].map(([t, v]) => ({
          id: String(t),
          title: String(t),
          sub: "按业务日期",
          value: money(Number(v)),
        }));
      }
    } else if (k === "borrowing") {
      note = "截至 " + f.end + " · 每位员工最近一笔有效余额";
      entries = a.borrowing.rows.map((r) => ({
        id: r.id,
        title: r.name,
        sub: bn(r.branchId) + " · " + (r.record?.asOfDate ?? "无历史记录"),
        value: r.record ? money(r.record.outstandingAmount) : "无余额数据",
      }));
    } else if (k === "cash") {
      note = "按收取日期 · approved / locked · 不计为额外收入";
      entries = a.cash.rows.map((r) => ({
        id: r.id,
        title: bn(r.branchId),
        sub: r.collectedAt + " · " + statusLabels[r.approvalStatus],
        value: money(r.amount),
      }));
    } else if (k === "claims") {
      note = `按 Claim 日期 · Approved ${money(a.claims.approved)}（包含 Paid ${money(a.claims.paid)}，不可相加）· Pending ${money(a.claims.pending)}`;
      entries = a.claims.rows.map((r) => ({
        id: r.id,
        title:
          data.employees.find((e) => e.id === r.employeeId)?.name ??
          r.employeeId,
        sub:
          bn(r.branchId) +
          " · " +
          r.claimDate +
          " · " +
          statusLabels[r.approvalStatus] +
          " · " +
          (r.paymentStatus === "paid" ? "已付款" : "未付款"),
        value: money(r.amount),
      }));
    } else if (k === "pending") {
      note = "按提交日期 · 当前 submitted / under_review · 只读";
      entries = a.workflow.items
        .filter(
          (r) =>
            !drawer.id ||
            (drawer.id === "daily"
              ? r.type === "daily_sales" || r.type === "cash_handover"
              : r.type === drawer.id),
        )
        .map((r) => ({
          id: r.id,
          title: r.label,
          sub: bn(r.branchId) + " · " + r.date + " · " + r.id,
          value: "待审核",
        }));
    } else if (k === "revenue" || k === "winning" || k === "profit") {
      if (k === "profit") note += " · 非正式会计利润，独立模拟字段";
      entries = a.snapshots.map((r) => ({
        id: r.id,
        title: bn(r.branchId),
        sub: r.businessDate + " · " + statusLabels[r.approvalStatus],
        value: money(
          k === "revenue"
            ? r.revenue
            : k === "winning"
              ? r.winningPayout
              : r.netProfitDemo,
        ),
      }));
    } else {
      note = "按业务日期 · 佣金已包含在总开销内";
      entries = a.expenseRecords
        .filter((r) => k !== "commission" || r.category === "commission")
        .map((r) => ({
          id: r.id,
          title: labels[r.category],
          sub: bn(r.branchId) + " · " + r.businessDate,
          value: money(r.amount),
        }));
    }
    return (
      <>
        <p className="detail-summary">{note}</p>
        {entries.length ? (
          entries.map((r) => (
            <div className="detail-row" key={r.id}>
              <div>
                <strong>{r.title}</strong>
                <small>{r.sub}</small>
              </div>
              <b>{r.value}</b>
            </div>
          ))
        ) : (
          <Empty />
        )}
      </>
    );
  }
  return (
    <div className={`app-shell ${collapsed ? "is-collapsed" : ""}`}>
      {mobile && (
        <button
          className="mobile-overlay"
          aria-label="关闭导航"
          onClick={() => setMobile(false)}
        />
      )}
      <aside className={`sidebar ${mobile ? "mobile-open" : ""}`}>
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setPage(0);
          }}
        >
          <span className="brand-mark">
            <Building2 size={27} />
          </span>
          <span className="nav-label">
            <strong>Nexora</strong>
            <small>BUSINESS OS</small>
          </span>
        </a>
        <div className="nav-section nav-label">
          工作空间 <span>WORKSPACE</span>
        </div>
        <nav aria-label="主导航">
          {nav.map(([cn, en, Icon], i) => (
            <button
              key={cn}
              className={`nav-item ${page === i ? "active" : ""}`}
              title={cn}
              onClick={() => {
                setPage(i);
                setMobile(false);
              }}
            >
              <Icon size={21} />
              <span className="nav-label">
                <strong>{cn}</strong>
                <small>{en}</small>
              </span>
              {page === i && <span className="nav-dot" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="system-status">
            <span />
            <span className="nav-label">本地演示环境</span>
          </div>
          <button
            className="collapse-button"
            aria-label="收起或展开侧栏"
            onClick={() => setCollapsed(!collapsed)}
          >
            <PanelLeftClose size={18} />
            <span className="nav-label">收起侧栏</span>
          </button>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <div className="page-heading">
            <button
              className="icon-button mobile-menu"
              aria-label="打开导航"
              onClick={() => setMobile(true)}
            >
              <Menu />
            </button>
            <div>
              <div className="breadcrumb">
                工作空间 <ChevronRight size={12} />{" "}
                {page === 0 ? "集团概览" : nav[page][0]}
              </div>
              <h1>
                {nav[page][0]}
                <span className="title-tag">
                  {page === 0 ? "OVERVIEW" : "COMING SOON"}
                </span>
              </h1>
            </div>
          </div>
          <div className="header-right">
            <span className="header-date">
              <CalendarDays size={15} /> {demoToday}
            </span>
            <button
              className="notification icon-button"
              disabled={!a}
              aria-label="查看待审核事项"
              onClick={() => open("待审核事项", "pending")}
            >
              <Bell size={21} />
              {a && a.workflow.total > 0 && <b>{a.workflow.total}</b>}
            </button>
            <span className="header-divider" />
            <div className="avatar">O</div>
            <div className="owner-label">
              <strong>老板</strong>
              <small>Owner · 只读</small>
            </div>
          </div>
        </header>
        <main>
          <div className="demo-banner">
            <div>
              <ShieldCheck size={16} />
              <strong>客户展示 DEMO</strong>
              <span>模拟数据 · 非正式账目 · 不执行真实交易</span>
            </div>
            <span>模拟基准日 {demoToday}</span>
          </div>
          {page !== 0 ? (
            <section className="coming-soon panel">
              <Building2 size={40} />
              <span className="eyebrow">COMING SOON</span>
              <h2>{nav[page][0]}</h2>
              <p>此模块属于未来正式系统，本轮仅展示「业务总览」。</p>
              <button className="primary" onClick={() => setPage(0)}>
                返回业务总览
                <ArrowRight size={16} />
              </button>
            </section>
          ) : (
            <>
              <section className="intro-row">
                <div>
                  <h2>掌握经营动态，洞察每一间分店</h2>
                  <p>各公司与分店的已审核业务表现，一目了然。</p>
                </div>
                <div className="filters">
                  <label className="select-wrap">
                    <CalendarDays size={16} />
                    <select
                      aria-label="日期范围"
                      value={preset}
                      onChange={(e) => {
                        setPreset(e.target.value);
                        if (e.target.value !== "custom")
                          setF((v) => ({ ...v, ...range(e.target.value) }));
                      }}
                    >
                      <option value="week">本周</option>
                      <option value="month">本月</option>
                      <option value="last">上月</option>
                      <option value="12weeks">最近 12 周</option>
                      <option value="custom">自定义日期</option>
                    </select>
                  </label>
                  <label className="select-wrap">
                    <select
                      aria-label="公司"
                      value={f.company}
                      onChange={(e) =>
                        data &&
                        setF((v) => changeCompany(v, e.target.value, data))
                      }
                    >
                      <option value="all">全部公司</option>
                      {data?.companies.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="select-wrap">
                    <select
                      aria-label="分店"
                      value={f.branch}
                      onChange={(e) =>
                        setF((v) => ({ ...v, branch: e.target.value }))
                      }
                    >
                      <option value="all">全部分店</option>
                      {data?.branches
                        .filter(
                          (b) =>
                            f.company === "all" || b.companyId === f.company,
                        )
                        .map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name}
                          </option>
                        ))}
                    </select>
                  </label>
                </div>
              </section>
              <div className="range-line">
                <span className="live-dot" />
                {f.start || "开始日期"} — {f.end || "结束日期"}
                <span>· 马来西亚业务日期</span>
                <button
                  onClick={() => {
                    setF({ company: "all", branch: "all", ...range("month") });
                    setPreset("month");
                  }}
                >
                  <RotateCcw size={12} />
                  重置筛选
                </button>
              </div>
              {preset === "custom" && (
                <div className="custom-dates">
                  <label>
                    开始日期
                    <input
                      aria-label="开始日期"
                      type="date"
                      value={f.start}
                      onInput={(e) => {
                        const value = e.currentTarget.value;
                        setF((v) => ({ ...v, start: value }));
                      }}
                    />
                  </label>
                  <span>至</span>
                  <label>
                    结束日期
                    <input
                      aria-label="结束日期"
                      type="date"
                      value={f.end}
                      onInput={(e) => {
                        const value = e.currentTarget.value;
                        setF((v) => ({ ...v, end: value }));
                      }}
                    />
                  </label>
                </div>
              )}
              {!valid ? (
                <div role="alert" className="error-state">
                  请选择有效日期，开始日期不能晚于结束日期。
                </div>
              ) : error ? (
                <div role="alert" className="error-state">
                  模拟数据加载失败。
                  <button onClick={() => setRetry((v) => v + 1)}>重试</button>
                </div>
              ) : !a ? (
                <div className="loading" role="status">
                  正在准备业务总览…
                </div>
              ) : (
                <>
                  <section className="kpi-grid" aria-label="关键业务指标">
                    {metrics.map(([title, en, key, Icon, tone]) => {
                      const delta = a.delta(key);
                      return (
                        <button
                          key={key}
                          className={`kpi-card ${tone}`}
                          onClick={() => open(title, key)}
                        >
                          <div className="kpi-top">
                            <span className="kpi-icon">
                              <Icon size={23} />
                            </span>
                            <ArrowUpRight className="card-link" size={16} />
                          </div>
                          <div className="kpi-label">
                            {title}
                            <span>{en}</span>
                          </div>
                          <strong className="kpi-value">{money(a[key])}</strong>
                          <div className="kpi-bottom">
                            <span
                              className={`change ${delta !== null && delta < 0 ? "down" : ""}`}
                            >
                              {delta !== null && <ArrowUpRight size={13} />}
                              {delta === null
                                ? "—"
                                : `${delta > 0 ? "+" : ""}${delta.toFixed(1)}%`}
                            </span>
                            <span>
                              {delta === null
                                ? "无完整可比数据"
                                : "较同长度上一期间"}
                            </span>
                          </div>
                          <small className="kpi-footnote">
                            {key === "commission"
                              ? "已包含在总开销中"
                              : key === "profit"
                                ? "独立模拟字段 · 非正式会计利润"
                                : "仅 approved / locked 记录"}
                          </small>
                        </button>
                      );
                    })}
                  </section>
                  <section className="chart-grid">
                    <article className="panel revenue-panel">
                      <div className="panel-heading">
                        <div>
                          <h3>
                            <ChartNoAxesCombined />
                            营业额趋势
                          </h3>
                          <p>Revenue trend · {a.aggregation}汇总</p>
                        </div>
                        <span className="subtle-tag">
                          {preset === "12weeks" ? "最近 12 周" : "所选期间"}
                        </span>
                      </div>
                      {a.trend.length ? (
                        <>
                          <div className="trend-total">
                            <strong>{money(a.revenue)}</strong>
                            <span>已审核营业额</span>
                          </div>
                          <div className="revenue-chart">
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart
                                data={a.trend}
                                margin={{
                                  top: 15,
                                  right: 10,
                                  left: -15,
                                  bottom: 0,
                                }}
                              >
                                <defs>
                                  <linearGradient
                                    id="revenueGradient"
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                  >
                                    <stop
                                      offset="0%"
                                      stopColor="#3185fc"
                                      stopOpacity={0.25}
                                    />
                                    <stop
                                      offset="100%"
                                      stopColor="#3185fc"
                                      stopOpacity={0.01}
                                    />
                                  </linearGradient>
                                </defs>
                                <CartesianGrid
                                  strokeDasharray="3 4"
                                  vertical={false}
                                  stroke="#e8edf5"
                                />
                                <XAxis
                                  dataKey="date"
                                  tickFormatter={(v) => v.slice(5)}
                                  axisLine={false}
                                  tickLine={false}
                                  fontSize={11}
                                  tickMargin={12}
                                  minTickGap={25}
                                />
                                <YAxis
                                  axisLine={false}
                                  tickLine={false}
                                  fontSize={10}
                                  tickFormatter={(v) => `${v / 1000}k`}
                                />
                                <Tooltip
                                  formatter={(v) => [
                                    money(Number(v)),
                                    "营业额",
                                  ]}
                                  contentStyle={{
                                    borderRadius: 12,
                                    border: "1px solid #e3eaf4",
                                    fontSize: 12,
                                  }}
                                />
                                <Area
                                  isAnimationActive={false}
                                  type="monotone"
                                  dataKey="revenue"
                                  stroke="#2582fa"
                                  strokeWidth={2.7}
                                  fill="url(#revenueGradient)"
                                  dot={
                                    a.trend.length < 14
                                      ? { r: 3, fill: "white", strokeWidth: 2 }
                                      : false
                                  }
                                />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                          <p className="chart-caption">
                            {a.trend.length} 个汇总点 · 合计 {money(a.revenue)}
                          </p>
                        </>
                      ) : (
                        <Empty />
                      )}
                    </article>
                    <article className="panel expense-panel">
                      <div className="panel-heading">
                        <div>
                          <h3>
                            <ChartNoAxesCombined />
                            开销分类
                          </h3>
                          <p>Expense breakdown</p>
                        </div>
                        <span className="subtle-tag">含佣金</span>
                      </div>
                      {a.expenses > 0 ? (
                        <>
                          <div className="donut-wrap">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  isAnimationActive={false}
                                  data={a.categories}
                                  dataKey="value"
                                  innerRadius="69%"
                                  outerRadius="94%"
                                  paddingAngle={3}
                                  stroke="none"
                                >
                                  {a.categories.map((r, i) => (
                                    <Cell key={r.category} fill={colors[i]} />
                                  ))}
                                </Pie>
                                <Tooltip
                                  formatter={(v, _name, entry) => [
                                    money(Number(v)),
                                    labels[entry.payload.category],
                                  ]}
                                />
                              </PieChart>
                            </ResponsiveContainer>
                            <div className="donut-label">
                              <small>总开销</small>
                              <strong>{money(a.expenses)}</strong>
                            </div>
                          </div>
                          <ul className="expense-legend">
                            {a.categories.map((r, i) => (
                              <li key={r.category}>
                                <span>
                                  <i style={{ background: colors[i] }} />
                                  {labels[r.category]}
                                </span>
                                <b>
                                  <small>{money(r.value)}</small>
                                  {((r.value / a.expenses) * 100).toFixed(1)}%
                                </b>
                              </li>
                            ))}
                          </ul>
                          <p className="chart-caption">
                            分类合计 {money(a.expenses)}
                          </p>
                        </>
                      ) : (
                        <Empty />
                      )}
                    </article>
                    <article className="panel pending-panel">
                      <div className="panel-heading">
                        <div>
                          <h3>
                            <Clock3 />
                            待审核事项
                          </h3>
                          <p>Pending approvals · 只读</p>
                        </div>
                        <span className="count-badge">{a.workflow.total}</span>
                      </div>
                      <div className="pending-list">
                        {(
                          [
                            [
                              "日报 / 现金交接",
                              "Daily sales & cash",
                              "daily",
                              a.workflow.daily,
                              Files,
                            ],
                            [
                              "主管周报",
                              "Weekly report",
                              "weekly_report",
                              a.workflow.weekly,
                              CalendarDays,
                            ],
                            [
                              "报销申请",
                              "Claims",
                              "claim",
                              a.workflow.claim,
                              ReceiptText,
                            ],
                            [
                              "其他记录",
                              "Other records",
                              "other",
                              a.workflow.other,
                              Calculator,
                            ],
                          ] as [string, string, string, number, LucideIcon][]
                        ).map(([title, en, id, count, Icon], i) => (
                          <button
                            key={id}
                            onClick={() => open(title, "pending", id)}
                          >
                            <span className={`pending-icon p-${i}`}>
                              <Icon size={18} />
                            </span>
                            <span>
                              <strong>{title}</strong>
                              <small>{en}</small>
                            </span>
                            <b>{count}</b>
                            <ChevronRight size={16} />
                          </button>
                        ))}
                      </div>
                      <div className="pending-note">
                        <ShieldCheck size={15} />
                        <span>
                          按提交日期统计当前待审核记录
                          <br />由 Admin 在正式系统中处理
                        </span>
                      </div>
                    </article>
                  </section>
                  <section className="bottom-grid">
                    <article className="panel branch-panel">
                      <div className="panel-heading">
                        <div>
                          <h3>
                            <Building2 />
                            分店表现对比
                          </h3>
                          <p>Branch performance · 点击分店查看摘要</p>
                        </div>
                        <span className="subtle-tag">
                          {a.branches.length} 间分店
                        </span>
                      </div>
                      {a.snapshots.length || a.expenseRecords.length ? (
                        <>
                          <div className="table-scroll">
                            <table>
                              <thead>
                                <tr>
                                  <th>
                                    <button onClick={() => sortBy("name")}>
                                      分店 / 公司 ↕
                                    </button>
                                  </th>
                                  <th>
                                    <button onClick={() => sortBy("revenue")}>
                                      营业额 ↕
                                    </button>
                                  </th>
                                  <th>
                                    <button onClick={() => sortBy("expenses")}>
                                      开销 ↕
                                    </button>
                                  </th>
                                  <th>
                                    <button onClick={() => sortBy("profit")}>
                                      演示净利润 ↕
                                    </button>
                                  </th>
                                  <th>演示利润率</th>
                                </tr>
                              </thead>
                              <tbody>
                                {rows.map((r, i) => (
                                  <tr key={r.id}>
                                    <td>
                                      <button
                                        className="branch-button"
                                        onClick={() =>
                                          open(r.name, "branch", r.id)
                                        }
                                      >
                                        <span
                                          className={`branch-avatar b-${i % 3}`}
                                        >
                                          <Store size={16} />
                                        </span>
                                        <span>
                                          <strong>{r.name}</strong>
                                          <small>
                                            {
                                              data?.companies.find(
                                                (c) => c.id === r.companyId,
                                              )?.name
                                            }
                                          </small>
                                        </span>
                                      </button>
                                    </td>
                                    <td>{money(r.revenue)}</td>
                                    <td>{money(r.expenses)}</td>
                                    <td>{money(r.profit)}</td>
                                    <td>
                                      <span className="margin-pill">
                                        {margin(r.profit, r.revenue)}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                              <tfoot>
                                <tr>
                                  <td>总计</td>
                                  <td>{money(a.revenue)}</td>
                                  <td>{money(a.expenses)}</td>
                                  <td>{money(a.profit)}</td>
                                  <td>{margin(a.profit, a.revenue)}</td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>
                          <p className="table-note">
                            <ShieldCheck size={13} />{" "}
                            利润及利润率为演示口径，非正式会计利润。开销已包含佣金。
                          </p>
                        </>
                      ) : (
                        <Empty />
                      )}
                    </article>
                    <div className="operations-column">
                      <div className="operations-grid">
                        {(
                          [
                            [
                              "员工借粮",
                              "borrowing",
                              HandCoins,
                              a.borrowing.total,
                              `截至 ${f.end}`,
                              a.borrowing.missing
                                ? `${a.borrowing.missing} 位无余额数据 · 汇总不完整`
                                : `${a.borrowing.count} 位员工未还余额`,
                            ],
                            [
                              "分店现金收取",
                              "cash",
                              Wallet,
                              a.cash.total,
                              "按收取日期 · 已审核",
                              `${a.cash.branches} / ${a.branches.length} 间分店已收取`,
                            ],
                            [
                              "报销申请",
                              "claims",
                              ReceiptText,
                              a.claims.total,
                              "按 Claim 日期",
                              `Approved ${money(a.claims.approved)}`,
                            ],
                          ] as [
                            string,
                            string,
                            LucideIcon,
                            number,
                            string,
                            string,
                          ][]
                        ).map(([title, kind, Icon, value, label, note]) => (
                          <button
                            key={kind}
                            className={`panel operation-card ${kind}`}
                            onClick={() => open(title, kind)}
                          >
                            <div>
                              <span className="operation-icon">
                                <Icon size={21} />
                              </span>
                              <h3>{title}</h3>
                              <ChevronRight size={16} />
                            </div>
                            <strong>
                              {kind === "borrowing" &&
                              a.borrowing.missing === a.borrowing.rows.length
                                ? "无余额数据"
                                : money(value)}
                            </strong>
                            <small>{label}</small>
                            <p>{note}</p>
                            {kind === "claims" && (
                              <p className="paid-note">
                                Paid {money(a.claims.paid)} · Pending{" "}
                                {money(a.claims.pending)}
                              </p>
                            )}
                          </button>
                        ))}
                      </div>
                      <article className="ai-panel">
                        <div className="ai-title">
                          <span className="ai-symbol">
                            <Sparkles size={24} />
                          </span>
                          <div>
                            <h3>
                              AI 查询助手 <span>AI DEMO</span>
                            </h3>
                            <p>固定问题模拟回答 · 仅展示，不连接真实 AI</p>
                          </div>
                        </div>
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            setAsked(query);
                          }}
                        >
                          <Search size={18} />
                          <input
                            aria-label="AI 查询问题"
                            placeholder="试试：所选期间哪间分店营业额最高？"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                          />
                          <button
                            className="primary"
                            type="submit"
                            disabled={!query.trim()}
                          >
                            <Send size={16} />
                            <span>查询</span>
                          </button>
                        </form>
                        <div className="question-chips">
                          {questions.map((q, i) => (
                            <button
                              key={q}
                              title={q}
                              onClick={() => {
                                setQuery(q);
                                setAsked(q);
                              }}
                            >
                              {
                                [
                                  "营业额最高",
                                  "总开销",
                                  "演示利润最高",
                                  "待审核 Claim",
                                  "借粮余额",
                                ][i]
                              }
                              <ArrowUpRight size={11} />
                            </button>
                          ))}
                        </div>
                        {reply && (
                          <div className="ai-answer" role="status">
                            <span>DEMO</span>
                            {reply}
                          </div>
                        )}
                        <p className="ai-note">
                          <ShieldCheck size={12} />{" "}
                          财务只读已审核数据；待审核仅返回独立数量统计（正式范围待确认）。
                        </p>
                      </article>
                    </div>
                  </section>
                </>
              )}
            </>
          )}
          <footer>
            <span>
              Nexora Business OS <b>·</b> 业务总览
            </span>
            <span>
              客户展示 Demo v0.1.1 <b>·</b> 数据仅供演示
            </span>
          </footer>
        </main>
      </div>
      {drawer && (
        <DetailDrawer title={drawer.title} onClose={() => setDrawer(null)}>
          {details()}
        </DetailDrawer>
      )}
    </div>
  );
}
