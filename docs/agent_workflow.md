# Agent Workflow

User Brief → Content Strategy → Story Planning → Story Generation → Quality Evaluation → Audio Production → Analytics。

| Agent | 输入 | 输出 | 评测标准 |
| --- | --- | --- | --- |
| Content Strategy | 用户画像、题材、平台目标、示例竞品模式 | 内容 Brief、人物关系、核心冲突、节奏与情绪曲线 | 用户匹配、冲突强度、情绪升级 |
| Story Planning | 内容 Brief、章节数、既有角色事实 | Story Bible、人物关系、章节大纲 | 人物一致性、因果连续性、大纲覆盖 |
| Story Generation | Story Bible、章节大纲、已批准 Prompt | 英文对白脚本示例、章节数量、Prompt 版本 | 对白自然度、章节 Hook、语言一致性 |
| Quality Evaluation | 正文、Story Bible、评测规则 | 分项评分、AI Pattern 风险、质量闸门、检查项目 | 剧情/人物/Hook ≥ 8.5；AI Pattern Low |
| Audio Production | 审核后的正文、角色声音、TTS 参数 | 双人演播、语速、停顿与制作计划 | Speaker 区分、145–155 WPM、人工确认 |
| Analytics | 示例收听事件、实验分组、付费卡点 | CTR、留存、转化与下一轮 Brief 建议 | 指标清晰、反馈可行动、区分观察与因果 |

## 运行行为

六个阶段顺序执行，每步模拟 800ms 的处理。当前阶段显示“进行中”，已完成节点显示“已完成”。输出逐步更新，完成后生成一条运行记录。运行中项目切换和新建被禁用，保证同一运行绑定同一 Brief。

取消会停止后续节点，保存已经完成的阶段；取消不会把项目标记为完成。可以重新运行。最近 20 条记录持久化在本浏览器中。关闭页面时正在执行的进程结束，刷新后可以重新运行。

没有运行记录时，节点明确展示“示例结果”；已运行结果显示“运行结果”。默认展示中文可读成果，JSON 和运行记录可展开查看。手机上按编号 1–6 顺序排列六个阶段。

## 反馈

Evaluation Center 中已应用的 Prompt 按问题所属阶段回写到对应节点的 Prompt 页签，版本显示 v2。重新评测后显示更新的示例证据及评分，项目质量状态同步到 Dashboard。

所有 Agent 都是本地 Mock；竞品信号、英文片段、音频参数和分析结果都是示例，不会发起真实模型、TTS 或外部平台调用。
