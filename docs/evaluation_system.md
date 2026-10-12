# 质量评测与 Bad Case 闭环

## 四个维度

| 维度 | 检查内容 | 目标 |
| --- | --- | --- |
| Plot Quality | 剧情逻辑、冲突、情绪升级 | ≥ 8.5 / 10 |
| Character Consistency | 人物事实、关系、动机与行为 | ≥ 8.5 / 10 |
| Chapter Hook | 开篇、章节悬念、继续收听意愿 | ≥ 8.5 / 10 |
| AI Pattern | AI 自我暴露、中英混杂、重复、文风异常 | Low |

`The Last Promise` 初始分项为 8.8、9.0、8.7。该故事有一个包含模型自我暴露和中英混杂的示例 Bad Case，因此 AI Pattern 初始显示 Review；修复该案例后变为 Low。

## 问题定位

- 人物漂移 → Story Planning：补充 Story Bible 的既有事实与动机。
- 剧情断裂 → Story Planning：补全场景之间的因果关系与章节悬念。
- AI 味、自我暴露或语言混杂 → Story Generation：自然英文对白、具体动作、仅输出脚本。
- 音频体验问题 → Audio Production：角色标记、短对白、语速与停顿参数。

## 状态转换

```text
Open
  → 编辑并应用 Prompt
Optimized
  → 模拟重新生成、重新评测
Resolved
  → 展示评分对比与改写证据
```

不允许跳过优化直接评测；空 Prompt 不可保存；有未保存的改动时需先保存再重新评测。已解决的案例不重复计分。

每个已解决案例使示例整体评分增加 0.12，上限 10；基线固定，避免重复累加。分项评分与整体评分是演示规则，不是从真实模型或全文统计推导的结果。案例评分 `before / after` 与改写片段来自固定 fixture，方便稳定复现演示。

同一故事所有案例完成验证后，项目从 Needs review 转为 Ready for audio。音频制作仍以人工签核为上线边界。评分、修复状态、Prompt 与证据可以导出 JSON。
