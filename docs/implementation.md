# 需求实现映射

本项目根据用户提供的 `ListenPal_AI_Agent_Studio_Product_Design.md` 实现。原文的副本保存为 `product_design.md`，用户提供的原文件和工作区 `sources/` 未修改。

| 原文模块 | 实现 |
| --- | --- |
| Dashboard 四个核心指标 | `frontend/src/pages/Dashboard.tsx`，时间范围、项目列表、筛选和 CSV 导出 |
| 六个 Agent，可查看 Input/Output/Evaluation Metric | `frontend/src/pages/Workflow.tsx` 与 `lib/domain.ts`，运行/取消/重试/Prompt/历史/JSON 导出 |
| 故事生成输入与 Brief、角色、大纲 | 新建项目弹窗及 `frontend/src/pages/Story.tsx` |
| Plot/Character/Hook/AI Pattern | `frontend/src/pages/Evaluation.tsx`，质量卡片、闸门与评测规则 |
| Bad Case → 原因 → Prompt → 重新生成 → 验证 | Evaluation 弹窗；`optimizeIssue` / `resolveIssue` 管理状态 |
| CTR 12% → 18%、留存 35% → 49.8% | `frontend/src/pages/Analytics.tsx` 和 `demo-data/studio.json` |
| 剧集长度、演播形式、付费卡点 | 三个可切换的示例实验 |
| GitHub + Vercel | 根目录 `vercel.json`、npm 工作区锁文件、GitHub Actions 与中文 README |

## 架构

页面通过 `StudioProvider` 共享项目、案例和运行记录。Mock 数据由 `demo-data/studio.json` 提供，`lib/domain.ts` 负责输出生成、评分、筛选及导出。浏览器数据保存失败不会阻止应用运行；无法解析的存储数据回退到初始数据。

本次 Demo 作为静态 SPA 部署。真实模型调用、音频文件生产、多用户身份和数据库是后续服务层范围；如采用 FastAPI，应把模型密钥留在服务端，并用任务队列、运行 ID、状态查询和取消 API 替换本地计时器。

## 演示数据

- 6 个故事，248 集，初始平均评分 8.8。
- 5 个 Bad Case，其中 4 个属于 The Last Promise，1 个属于 A Second Chance。
- 3 个 A/B 示例实验。
- 30 日指标：CTR 18%、15 分钟留存 49.8%、付费点留存 32.6%、付费转化 6.4%。
- 7 日示例留存 51.2%、转化 6.7%；项目产量按更新时间筛选。初始 fixture 在第一次打开时，以当前时间生成相对日期。
- 趋势图是示意序列，项目生产汇总来自当前浏览器的项目状态。两类来源在页面中标注为 sample / simulated。

可见 Demo 标记、导出报告和文档均保留数据来源说明，避免将示例结果解释为真实业务结果。
