# Nexora Business OS · Dashboard 客户展示 Demo v0.1.1 · 交付报告

本次仅完成客户展示 Dashboard Demo，未完成 proposal 建议的业务流程 PoC。

## 已完成

- 主标题按用户最新要求使用“业务总览”。参考图已保存在 docs/Owner_Dashboard_Layout_Reference.png，按其深蓝导航、五色 KPI、三栏图表、分店表、运营卡和 AI 查询区组织页面。
- 公司、分店和日期联动；公司切换重置不匹配分店；日期快捷选项及自定义逆序校验。
- KPI、日/周/月趋势、费用分类、分店表与运营摘要使用统一 analytics；金额可以点击查看只读明细。
- 分店排序、待审核分类、借粮余额、已审核现金和 Claim Approved / Paid / Pending 的独立展示。
- 固定问题模拟 AI；答案随筛选实时更新，未知问题明确不支持。模拟利润回答标明非正式会计口径。
- 桌面、平板与手机样式；手机抽屉导航、表格局部滚动；Radix 详情抽屉支持焦点约束和 Esc。
- loading / empty / error + 重试界面；持续 Demo 标识；未实现的导航模块显示 Coming Soon。
- 本地源码、锁文件、README、任务书副本、参考图、桌面和手机截图、Start-Demo.cmd。

## 数据口径

固定 seed 41017；模拟基准日 2026-11-05；覆盖 2026-04-24 至 2026-11-05（196 天）。2 个 Company、每公司 3 个 Branch、18 位匿名员工。最近 12 周及前 12 周完整覆盖。

财务指标只纳入 approved / locked 有效记录。Commission 是总开销中的分类小计；Payroll 不含单列佣金。演示净利润来自独立字段，未采用收入减费用的利润公式。借粮按截至结束日每人最新有效余额合计；现金收取不算额外收入。Claim Approved 包含 Paid，不能相加。待审核数量按提交日期、当前 submitted / under_review 统计，并排除重复关联 Claim。

AI 待审核数量问题只读取独立流程汇总，相对 proposal 的正式 AI 范围仍属待确认扩展。Demo 不构成最终财务规则确认。

## 实际验证结果

2026-11-05 完成：

| 检查               | 结果                                                                                                          |
| ------------------ | ------------------------------------------------------------------------------------------------------------- |
| pnpm run lint      | 通过，无 lint 错误                                                                                            |
| pnpm run typecheck | 通过                                                                                                          |
| pnpm run test      | 12 项单元测试全部通过                                                                                         |
| pnpm run build     | 通过，生成 dist/；图表独立分包                                                                                |
| 浏览器实际操作     | 公司/分店联动和自动重置、最近 12 周、日期逆序、空数据、排序、只读明细、Esc、Coming Soon、AI 正常/未知问题通过 |
| 响应式             | 1672px 桌面、768px 平板、390px 手机检查；手机根页面没有横向溢出，表格在自身区域滚动                           |
| 手机导航           | 打开、选菜单进入 Coming Soon、返回业务总览通过                                                                |
| 最终重新加载       | 未观察到新增浏览器 console error                                                                              |
| 截图               | docs/screenshots/desktop.png 与 mobile.png                                                                    |

单元测试覆盖：数据可复现、公司/分店隔离、总表和 KPI 一致、图表和分类一致、状态排除、佣金不重复、日期变化、余额存量、Claim 状态、待审核去重、零营业额、比较期覆盖、未知问题和非法日期/金额等。

自定义日期输入曾在浏览器操作检查时发现值更新不及时，已改用 onInput 并验证逆序提示。截图复核发现图表入场动画可能导致手机长截图尚未绘制，已关闭图表动画。最终页面、截图与构建均包含修复。

## 启动

本机双击 Start-Demo.cmd，或在具备 pnpm 的终端运行 pnpm dev。具备 npm 的机器也可 npm install 后 npm run dev。默认地址 http://127.0.0.1:5173/，只绑定本机；端口占用时以终端实际地址为准。

## 未实现与已知限制

- 不包含真实登录、角色权限、业务提交、审核、支付、会计引擎、真实 AI、WAHA、n8n、导入、数据库或生产部署。
- 非 Dashboard 模块全部为 Coming Soon。模拟数据仅在内存中提供，不写入交易。
- 余额使用快照模型，本 Demo 不模拟跨分店调动或完整借还交易账；缺失余额明确提示，不能当作已确认零欠款。
- 审批和 Claim 展示当前状态，不复原历史时点状态。自定义日期超出覆盖不补造数据，变化率显示不可比较。
- loading 和错误重试路径已实现；未人为破坏 Repository 来执行错误界面的浏览器故障注入测试。
- 页面为 React/Vite 前端，抽屉采用 shadcn 风格的本地 Radix primitive；未生成整套 shadcn 组件。Recharts 2 与 ESLint 9 依赖有 registry 的旧版本提示，本轮固定兼容版本；正式系统升级依赖需重新验证。
- 已根据用户授权公开仓库并配置 GitHub Pages，客户演示地址：https://gogomyproject-dev.github.io/Nexora-Business-OS/ 。所有数据仍为模拟数据。

## 下一轮建议与 API 接入

先收集客户对业务总览排版、筛选、指标和明细的反馈；另行确认 Commission 费用关系、Pay / Winning / Rebate 和正式利润规则及 AI 流程数量权限。再开展 proposal 所述业务流程 PoC。

保留 DashboardRepository 接口，正式后端应提供受控只读财务汇总/明细、流程数量、期末余额及数据覆盖信息。权限、Admin Approval、去重、审计和正式会计计算由后端负责；AI 财务查询与流程统计保持独立接口。无需为了替换 Mock 而重写图表和整体页面。
