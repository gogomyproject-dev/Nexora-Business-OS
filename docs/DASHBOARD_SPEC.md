# Nexora Business OS · Dashboard 客户展示 Demo — Codex 开发任务书

**版本：** v0.1.1<br>
**项目：** Nexora Business OS<br>
**本轮范围：** 仅制作给客户看的老板 Dashboard 可交互展示 Demo（Dashboard 展示 PoC）<br>
**目标：** 让客户确认老板首页的设计排版、指标呈现、筛选方式与查询体验；验证 UI、交互和模拟数据一致性；**不是生产系统，也不验证完整业务流程**。

## 0. 本轮定位与 proposal 的关系

- 背景文件：`Multi_Company_Multi_Branch_System_Proposal_V0.6_CN.pdf`，作为完整系统的初步业务方案背景。
- 本任务只制作 Nexora Business OS · Dashboard 客户展示 Demo，不代表完整系统交付，不代表 proposal 第 12 页建议的业务流程 PoC 已完成。
- proposal 建议验证的日报、周报、现金交接、Claim、Admin 审核及 Excel 导入，留待独立业务流程 PoC；本轮仅以模拟结果展示相关统计和只读明细。
- 本轮不改变 proposal 的正式会计规则、权限或集成承诺；新增的展示口径仅用于 Demo，不作为客户已确认的业务规则。
- 2 个 Company、每公司 3 个 Branch、五张 KPI 和日期快捷选项是演示配置，不代表客户实际组织规模或最终需求。
- 验收重点：客户能看懂页面、操作筛选、查看明细，且所有展示数字一致。不得以本 Demo 宣称真实审批、会计、AI 或业务流程已经完成。

## 1. Codex 执行要求

你是全栈工程师。请检查当前仓库，已有技术栈则优先复用；空目录则搭建新项目。**实际创建可运行的代码，不要只输出设计建议或代码片段。** 先说明简短实施计划，再编码、运行测试、修复错误，最后提供启动命令和测试结果。

采用客户提供的老板 Dashboard 截图作为主要视觉与排版参考，不必逐像素复制。所有金额、增长率、日期、分店数量、员工数量、通知数字和图表点位必须从同一份模拟数据计算，不能照抄截图示例值。参考图中的日期和“最近 12 周”仅为示意；实际图表标题必须与当前筛选一致。

## 2. 技术选型

空项目优先使用 React + TypeScript + Vite + Tailwind CSS + shadcn/ui + Lucide React + Recharts + date-fns。使用 Vitest 测试核心计算。全部免费开源、本地运行，无需数据库、Docker、付费 API 或云服务器。若项目已有框架，兼容现有结构并在 README 解释选择。

## 3. 视觉与响应式要求

### 3.1 客户确认的主要排版参考

参考图片：`Owner_Dashboard_Layout_Reference.png`（与本 MD 同目录保存；原图由客户在聊天中提供）。

桌面端按参考图组织页面：

1. 左侧深海军蓝导航栏，顶部为Nexora Business OS 标识，中英双语导航，当前 Dashboard 项蓝色高亮。
2. 顶栏左侧为“业务总览”和简短说明，右侧为日期、Company、Branch 筛选及 Owner 身份展示；通知若展示，数量必须来自待审核统计，点击只读查看。
3. 第一排五张 KPI：营业额、开销、中奖/派彩、佣金支出、演示净利润；依次采用浅绿、浅红、浅蓝、浅紫、浅黄色卡片，大金额和清晰变化率。
4. 第二排三栏：左侧营业额趋势面积图（较宽）、中间开销分类环形图及图例、右侧待审核事项列表。
5. 下方左侧为分店表现表及合计行；右侧上排横向三张运营卡（借粮未还、现金收取、Claim），下排为浅紫色 AI Demo 查询区域。
6. 采用白色主背景、浅色边框、圆角卡片和适度留白；优先保持信息层级和区块位置，随屏幕宽度自然换行，不能为照搬截图造成溢出。
7. 截图中的净利润、利润率和 AI 文案需按本任务的 Demo 标识要求调整；不复制截图中可能引起正式会计或真实 AI 误解的措辞。

### 3.2 通用要求

- 风格：Modern Enterprise，深海军蓝侧栏、白/浅灰背景、圆角卡片、适度阴影，蓝色主色，绿/橙/紫为辅助色。
- 桌面端：左侧导航、顶部筛选、五张 KPI 卡、趋势图/开销图/待审核、分店表现表、运营摘要和 AI 助手。
- 平板端：侧栏可收起，内容自适应换行。
- 手机端：抽屉导航、单列或双列卡片，图表纵向排列，表格可滚动或改为卡片，页面不应横向溢出。
- 默认简体中文，英文作为辅助标签；MYR/RM 金额千位分隔；马来西亚业务日期统一 YYYY-MM-DD。
- 键盘可操作、焦点明显、图表附文字摘要；提供 loading/empty/error 状态。
- 页面持续醒目显示 **客户展示 DEMO / 模拟数据 / 非正式账目**，AI 区域显示 **AI Demo · 固定问题模拟回答**，避免客户误认是真实账目或已连接真实 AI。

## 4. 页面与交互

### 4.1 侧边栏

首页 Dashboard、营业报表、财务概览、分店表现、员工管理、借粮管理、报销申请、账单与支出、会计报表、AI 查询助手。**仅实现 Dashboard**，其余点击显示明确的 Coming Soon 页面，不要假装已经完成。

### 4.2 顶部筛选

- Company：All Companies / Company A / Company B。
- Branch：All Branches / 所选公司旗下 Branch；切换公司时自动清除不匹配的 Branch。
- 日期：本周、本月、上月、最近 12 周、自定义起止日期；检查开始日期不能晚于结束日期。
- 使用固定 `demoToday`（如 2026-11-05）作为模拟业务日期，并在界面显示“模拟基准日”；不随电脑日期自动漂移。本周从周一至基准日，本月至基准日，上月为完整自然月，最近 12 周为截至基准日含当天的连续 84 天。
- 日期范围包含首尾日；上一期间为当前开始日前紧邻的同天数区间。上一期间缺少完整覆盖、金额为 0 或没有可比记录时，变化率显示 —，并说明原因。
- 所有 KPI、图表、分店表和摘要必须联动；筛选无结果显示 Empty State。

### 4.3 KPI 五张卡

1. 总营业额 Total Revenue
2. 总开销 Total Expenses
3. 中奖 / 派彩 Winning / Payout
4. 佣金支出 Commission
5. 演示净利润 Net Profit Demo（**非正式会计利润**）

每张显示图标、标题、RM 金额、与同长度上一期间的变化百分比（无可比数据显示 —）。**禁止擅自采用 `Net Profit = Revenue - Expenses - Winning - Commission`**。目前客户尚未确认 Pay、Winning、Rebate、Expenses 和 Commission 的会计关系。PoC 中 `netProfitDemo` 使用独立的已批准模拟字段，标注“非正式会计利润”。

**Commission 与 Expenses 的本轮展示约定：** Total Expenses **包含 Commission**。`ExpenseRecord` 增加 `commission` 类别，佣金只在费用明细中计入一次；Commission KPI 是其中佣金分类的小计，不是总开销以外的额外扣项。`DailyFinancialSnapshot.commission` 不再保存，避免两套佣金来源。费用环形图包含佣金类别，所有分类之和等于 Expenses KPI。佣金卡及费用明细显示“已包含在总开销中”，禁止把两张卡再次相加。此约定仅为 Demo 展示，正式归类待客户及会计负责人确认。

净利润卡、分店表列名、利润率、明细及 AI 利润回答均须显示“演示／非正式会计口径”。演示利润率 = `netProfitDemo / revenue × 100%`，不是正式会计利润率。不要暗示独立模拟利润必须与其他卡片相减相等。

### 4.4 图表与表格

- 营业趋势：Recharts 折线/面积图，支持 tooltip，按日期范围合理聚合（日/周/月）。
- 开销分类：Donut Chart，显示类别、金额、占比，合计等于 Expenses KPI。类别建议 Rental、Utilities、Internet、Payroll、Commission、Maintenance、Other；其中 Payroll 在本 Demo 中不含已单列的 Commission。
- 待审核事项：Daily Sales / Cash Handover、Weekly Report、Claim、Other；按类别展示数量，点击打开详情抽屉。Owner 只能查看，不提供真正审批按钮。
- 分店表现：Branch、Company、Revenue、Expenses、Net Profit Demo、Demo Profit Margin（演示利润率）；支持排序、点击查看分店摘要。Revenue=0 时利润率显示 —，不出现 NaN/Infinity。
- 运营摘要：员工借粮未还余额、Branch 已审核现金收取、Claim 总额/Approved/Paid/Pending；点击打开明细抽屉。

### 4.5 Owner AI 助手（Mock，不连接真实模型）

实现输入框及预设问题：

- 本月哪间 Branch 营业额最高？
- 本月总开销多少？
- 哪间 Branch 利润最高？
- 有多少 Claim 等待审核？
- 员工借粮未还总额是多少？

仅支持固定意图/预设问题，答案从当前模拟数据与筛选计算。未知问题回复“目前为 Demo，暂不支持此问题”。所有答案显示 Demo 标记。不得调用真实 LLM、自由 SQL、执行审批、修改数据或生成预测。Owner AI 的财务数字仅来自 approved/locked 的模拟展示数据。

- 财务查询和待审核流程统计必须使用独立的只读方法/selector。待审核问题只返回汇总数量及分类，不向 AI 财务查询提供 Pending / Rejected 的金额、业务明细或原始记录。
- 待审核定义为 submitted/under_review；排除 draft/rejected/approved/locked。按 Company、Branch 和提交日期筛选；Claim 的流程数量以 ClaimRecord 为唯一来源，ApprovalItem 的关联 Claim 不得重复计数。
- 这项“通过 AI Demo 展示待审核数量”是相对 proposal“AI 不读取 Pending / Rejected”的待确认扩展，仅演示独立流程统计的交互；不代表正式 Owner AI 已获准访问待审核记录。正式实施前需确认，否则该问题仅保留在待审核面板。
- 预设问题文案随日期筛选更新，例如“所选期间哪间分店营业额最高？”，避免选择其他日期后仍用“本月”描述。回答显示实际日期范围；借粮回答显示截至日期，利润回答显示“演示净利润／非正式会计利润”。

## 5. 模拟数据与数据规则

生成**固定 seed、可重复**的虚构数据：2 个 Company，各 3 个 Branch，10–20 个匿名员工，覆盖模拟基准日及之前至少 24 个完整周（168 天）的每日业务快照、费用、Claims、Borrowing、Cash Collections、Approval Items，并为余额提供期初记录。默认最近 12 周及其前 12 周必须有完整日期覆盖；数据集保存覆盖起止日期以判断比较是否完整。不得使用真实客户/员工资料。建议使用下列类型并根据需要扩展：

```ts
type ApprovalStatus =
  "draft" | "submitted" | "under_review" | "rejected" | "approved" | "locked";
interface Company {
  id: string;
  name: string;
}
interface Branch {
  id: string;
  companyId: string;
  name: string;
}
interface DailyFinancialSnapshot {
  id: string;
  companyId: string;
  branchId: string;
  businessDate: string;
  revenue: number;
  winningPayout: number;
  netProfitDemo: number;
  approvalStatus: ApprovalStatus;
}
interface ExpenseRecord {
  id: string;
  companyId: string;
  branchId: string;
  businessDate: string;
  category:
    | "rental"
    | "utilities"
    | "internet"
    | "payroll"
    | "commission"
    | "maintenance"
    | "other";
  amount: number;
  approvalStatus: ApprovalStatus;
}
interface ApprovalItem {
  id: string;
  companyId: string;
  branchId: string;
  type: "daily_sales" | "cash_handover" | "weekly_report" | "claim" | "other";
  status: ApprovalStatus;
  submittedAt: string;
  summary: string;
  sourceRecordId?: string; // 关联原始模拟记录，用于去重
}
interface ClaimRecord {
  id: string;
  companyId: string;
  branchId: string;
  employeeId: string;
  claimDate: string;
  submittedAt?: string;
  amount: number;
  approvalStatus: ApprovalStatus;
  paymentStatus: "unpaid" | "paid";
}
interface BorrowingBalance {
  employeeId: string;
  companyId: string;
  branchId: string;
  asOfDate: string;
  outstandingAmount: number;
  approvalStatus: ApprovalStatus;
}
interface CashCollection {
  id: string;
  companyId: string;
  branchId: string;
  collectedAt: string;
  amount: number;
  approvalStatus: ApprovalStatus;
}
```

**关键约束：**

- Revenue、Expenses、Winning、Commission、Net Profit Demo 的 Demo 财务 KPI 只统计 approved/locked 且有效的模拟记录。
- Draft/Submitted/Under Review/Rejected 不计入 Demo 财务 KPI。
- Agent Daily Sales 和 Supervisor Weekly Sales 是**独立对账来源**，不自动相加；本 PoC 的 FinancialSnapshot 代表去重后的已审核展示层，避免重复营业额。
- Cash Collection 是现金交接/收取，不是额外收入。
- Borrowing 是某日期的**余额存量**。对当前公司/分店范围内每位员工，取 `asOfDate <= 筛选结束日` 的最新一笔 approved/locked 余额，再按员工合计；不能把每日余额相加，也不能只从筛选开始日以后找余额。同一员工同一天只保留一个有效快照；本 Demo 员工不跨公司/分店调动。缺少有效历史余额显示“无余额数据”，不能当作零欠款。借粮卡显示“截至 YYYY-MM-DD”，即使期间无交易也允许显示有效期末余额。
- Claim 总额按 claimDate 和当前公司/分店筛选；Approved 金额为 approved/locked 的合计（包含已付款），Paid 金额为其中 paymentStatus=paid 的合计，Pending 金额为 submitted/under_review 的合计；Approved 和 Paid 是重叠统计，不可相加，Paid 必须有已批准状态。待审核数量按 submittedAt 筛选，卡片/抽屉注明日期口径和当前状态，不伪装成历史时点状态。
- Cash Collection 按 collectedAt 和当前范围，只汇总 approved/locked；不能仅凭 Supervisor 确认就纳入已审核现金卡。
- Revenue 等期间交易按业务日期过滤；借粮按期末余额过滤；所有卡片注明适用日期口径。“期间无交易”不等于期末余额为零，Empty State 分区显示。
- 公司/分店合计必须与当前过滤条件一致。
- 不要在渲染过程中随机生成数据；不要在各组件硬编码独立 KPI。
- 日期按业务日期处理，不因浏览器时区而跨日。

## 6. 推荐代码结构

```text
src/
  app/App.tsx
  components/layout/{Sidebar,Topbar}.tsx
  components/dashboard/{KPICard,RevenueTrendChart,ExpenseDonutChart,PendingApprovalPanel,BranchPerformanceTable,OperationsSummary,OwnerAIDemo}.tsx
  components/common/{EmptyState,DetailDrawer,DemoDataNotice}.tsx
  data/fixtures.ts
  domain/{types,analytics,analytics.test}.ts
  services/dashboardRepository.ts
  hooks/useDashboardFilters.ts
  lib/{format,dates}.ts
  styles/index.css
README.md
POC_REPORT.md
```

如现有项目结构不同，可调整。数据访问层预留：

```ts
interface DashboardRepository {
  getCompanies(): Promise<Company[]>;
  getBranches(): Promise<Branch[]>;
  getDashboardData(): Promise<DashboardDataset>;
}
```

第一版用 Mock Repository，未来替换成真实 Backend API，不应重写整套 UI。

## 7. 必须验证的测试

1. 默认全部公司/分店时，汇总 KPI 与分店合计一致。
2. 选择 Company A 后只出现 Company A 的 Branch 和数据。
3. Company A 的 Branch 选定后切换 Company B，Branch 自动重置。
4. 日期变化后 KPI、趋势、分类、表格、运营摘要同步变化。
5. Pending/Rejected 数据不进入已审核财务 KPI。
6. 费用 Donut 分类总额等于 Expenses KPI；Commission KPI 等于其中佣金分类小计，不重复计入总开销。
7. Borrowing 每人只取截至结束日最新有效余额，覆盖开始日前余额、未来余额排除、缺失余额提示及不按日重复累计。
8. Claim Approved 和 Paid 分开统计。
9. Revenue 为 0 时不出现 NaN/Infinity。
10. 自定义日期逆序有校验，空数据有 Empty State。
11. AI Demo 回答与当前筛选及日期文案一致；财务查询不读取待审核数据，流程统计仅提供去重后的数量；利润回答包含演示标识；未知问题说明不支持。
12. 移动端不横向溢出，表格和导航可用。
13. lint/typecheck/build/test 全部通过（若环境不支持某项，报告真实限制）。
14. 最近 12 周具备前 12 周完整比较数据；自定义日期超出覆盖、上一期间不完整或基期为零时显示 —；固定基准日不受运行日期及浏览器时区影响。
15. 净利润及利润率的全部展示位置带演示标识；页面明确提示客户展示 Demo，非 Dashboard 导航仅进入 Coming Soon，不出现可执行审批、付款或写入按钮。

## 8. 本轮明确不做

- 不开发真实登录、RBAC、用户账号和员工个人资料管理。
- 不开发 Agent/Supervisor/Admin 的实际提交或审核页面。
- 不开发正式会计引擎、ERPNext、薪资、税务、Commission 规则或 Pay 公式。
- 不开发真实 Claim、Cash Handover、Borrowing 交易写入。
- 不连接 WAHA、n8n、WhatsApp、Google Sheets、真实 AI 或数据库。
- 不进行实际支付、审批、生产部署。
- 不要求收费服务。

## 9. 交付内容与验收

- 可本地运行的完整源码。
- README：安装、启动、测试、构建命令。
- 真实可点击的 Dashboard（不是静态图片）。
- 可复现 Mock 数据、统一 selectors/analytics、核心单元测试。
- `POC_REPORT.md`：已完成、未完成、测试结果、已知限制、未来 API 接入建议。首段注明“本次仅完成客户展示 Dashboard Demo，未完成 proposal 建议的业务流程 PoC”。记录佣金包含关系、固定基准日、数据覆盖期、各指标口径及 AI 流程数量扩展待确认事项。
- README 明确本轮交付边界、参考图位置和模拟数据标识；客户可通过 Demo 反馈排版、指标和交互，但该反馈不等于正式会计规则或整体系统验收。
- 如有浏览器截图工具，提供桌面/移动端截图；没有则如实说明。

新 Vite 项目通常运行：

```bash
npm install
npm run dev
npm run build
npm run test
```

请在完成代码后执行可行的验证，并报告实际运行结果。

## 10. 未来正式系统背景（本轮不实施）

- Group → Company → Branch；Owner / Admin / Supervisor / Agent 四角色。
- Agent 不接替 Supervisor；Supervisor 缺席时由 Admin 代操作。
- Agent Daily Sales 与 Supervisor Weekly Sales 独立核对，不能重复入账。
- 正式记录必须经过 Admin Approval。
- Cash Handover 分别保留 Agent 声明、Supervisor 确认和 Admin 批准金额。
- Claim 保留 Revision History，Approved 与 Paid 分开。
- Admin Assisted Entry 保留实际操作人及业务归属人。
- Owner AI 仅通过受控只读 API 查询已审核数据。
- 正式后端可评估 ERPNext + Frappe Custom App；不在 PoC 阶段引入。

## 11. Codex 完成后回复格式

```text
Nexora Business OS · Dashboard 客户展示 Demo v0.1.1
1. 技术栈：
2. 已完成的 UI/交互：
3. 数据与筛选实现：
4. 测试命令与结果：
5. 启动命令：
6. 已知限制：
7. 下一轮建议：
```

**优先级：能运行 > 数据一致 > 操作流畅 > 视觉精致 > 扩展功能。**
