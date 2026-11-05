# Nexora Business OS

业务总览 · 客户展示 Dashboard Demo v0.1.1

本轮仅完成客户展示 Dashboard Demo，未完成 proposal 建议的业务流程 PoC。所有数据为虚构数据，不用于正式账目、审批或支付。

## 本地使用

已安装依赖的本机可双击 `Start-Demo.cmd`，或在项目目录运行：

```powershell
pnpm dev
```

打开终端显示的地址，默认 http://127.0.0.1:5173/ 。如端口被占用，Vite 会显示其他端口。当前仅绑定本机，不对局域网开放。

在具备 Node.js 22+ 和 npm 的新电脑：

```sh
npm install
npm run dev
```

项目同时提供 `pnpm-lock.yaml`；如使用 pnpm，运行 `pnpm install --frozen-lockfile` 保持依赖版本一致。`pnpm-workspace.yaml` 仅允许 esbuild 必要的安装脚本。

## 验证与构建

```sh
npm run lint
npm run typecheck
npm run test
npm run build
```

也可以用 `pnpm` 运行同名命令。构建结果位于 `dist/`，可使用 `pnpm exec vite preview --host 127.0.0.1` 本地查看。

## 已实现

- “业务总览”标题、深蓝导航、五色 KPI、营业额趋势、费用环形图、待审核列表、分店表现表、三张运营卡及 AI Demo。
- 公司、分店、日期联动；公司切换自动清除不匹配的分店；自定义日期校验和重置。
- 可点击 KPI/运营卡/待审核类别/分店的只读明细；Radix Dialog 支持焦点约束、Esc 关闭及关闭后恢复焦点。
- 分店表支持名称、营业额、开销及演示利润双向排序。移动端表格在自身区域横向滚动。
- 5 个固定 AI 问题；回答随筛选更新；其他问题明确不支持。
- 非首页模块均为 Coming Soon。未连接数据库、真实 AI、登录、真实审批或外部系统。

## 技术与结构

React 19、TypeScript、Vite、Tailwind CSS 4、Lucide、Recharts、date-fns、Vitest、ESLint。为贴近参考图，页面使用独立 CSS；抽屉采用 shadcn/ui 常用的 Radix Dialog 底层模式并本地保留组件源码，没有生成整套无用组件。Recharts 2 与本轮 React 图表实现固定在锁文件中；升级主版本需另行验证。

- `src/app/App.tsx`：页面、筛选状态、只读交互。
- `src/domain/analytics.ts`：统一财务计算、分店汇总、流程统计、期末余额、固定问题回答。
- `src/data/fixtures.ts`：固定 seed 41017，可重建的虚构数据。
- `src/services/dashboardRepository.ts`：异步 Mock Repository，可替换为 Backend API。
- `src/components/ui/dialog.tsx`：可访问的只读详情抽屉。
- `src/lib/`：金额、业务日期与比较期间。
- `src/domain/analytics.test.ts`：核心业务口径测试。
- `docs/DASHBOARD_SPEC.md`：任务书项目副本，标题已按最新要求改为业务总览。
- `docs/Owner_Dashboard_Layout_Reference.png`：客户提供的原始排版参考。
- `docs/screenshots/`：浏览器验证截图。

## 模拟数据和指标口径

模拟基准日固定为 **2026-11-05**，覆盖 **2026-04-24 至 2026-11-05**（196 天），2 个 Company、6 间 Branch、18 位匿名员工。日期按业务日处理，不因操作系统当前日期漂移。不存在真实客户及员工资料。

- 本周从周一至基准日，本月至基准日，上月为完整自然月，最近 12 周为连续 84 天。比较期为紧邻的同长度上一期间，覆盖不足或基期为零显示 —。
- Revenue / Expenses / Winning / Commission / Net Profit Demo 仅使用 approved / locked 有效记录。
- Expenses 包含 Commission；Commission 卡是费用分类小计，禁止重复相加。Payroll 分类不含单列佣金。
- 净利润来自独立 `netProfitDemo` 模拟字段，**不通过收入减费用推算**；利润率为演示净利润除以营业额，零营业额显示 —。所有利润显示为非正式会计口径。
- 借粮取截至筛选结束日每位员工最新有效余额；允许余额日期早于期间开始，不累计每日余额；缺失显示无余额数据。
- Cash Collection 按收取日期统计已审核收取金额，不算额外收入。
- Claim 按 Claim 日期统计金额。Approved 包含 Paid；两者不可相加。Pending 金额仅作流程展示。
- 待审核按提交日期统计当前 submitted / under_review。ClaimRecord 是 Claim 唯一数量来源，排除 ApprovalItem 中重复关联的 Claim。
- AI 财务回答仅由已审核财务 selector 计算；待审核回答只取独立数量汇总。后者是相对 proposal 的**待确认展示扩展**，不代表正式 AI 允许读取待审核数据。
- 操作期间没有交易时显示分区 Empty State，已知借粮期末余额仍可保留。自定义日期超过数据覆盖时只展示实际覆盖记录，不补造数据。

## 后续接入

保留 Repository 接口，后端按已确认的口径返回只读汇总/明细。正式权限、审核、去重、金额校验和审计必须在后端落实。正式利润须来自会计账目；真实 AI 和流程 PoC 另行实施。客户对 Demo 的反馈仅用于确认排版、指标呈现及交互，不构成整体系统验收。

## GitHub

项目仓库：https://github.com/gogomyproject-dev/Nexora-Business-OS

`main` 推送后自动执行 lint、typecheck、test、build，并上传构建产物 `nexora-business-os-demo`。仓库保持原有可见性；私有仓库链接仅对已获授权的人开放。

项目使用相对资源路径，可部署在 GitHub Pages 子路径。管理员启用 Pages（Source: GitHub Actions）后，可手动运行 “Deploy Nexora Business OS to GitHub Pages”。是否可在私有仓库启用 Pages 取决于 GitHub 账户功能；此工作流不会改变仓库可见性。未启用时可继续本地运行。

`MD file/` 下的独立完整系统任务书不属于 Dashboard Demo，未纳入本仓库。
