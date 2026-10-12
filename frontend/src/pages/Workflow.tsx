import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, AudioLines, BookOpen, Check, CheckCircle2, Download, FileText, FlaskConical, Lightbulb, LoaderCircle, Play, Plus, RotateCcw, Square, TrendingUp } from 'lucide-react';
import { Badge, PageTitle, ProjectSelect } from '../components/ui';
import AgentOutput from '../components/AgentOutput';
import { useStudio } from '../lib/StudioContext';
import { download, makeOutputs, stages } from '../lib/domain';
import { displayAudience, displayBrief, displayGenre, displayTitle, stageCopy } from '../lib/display';
import type { StageId } from '../lib/types';

const icons = [Lightbulb, BookOpen, FileText, FlaskConical, AudioLines, TrendingUp];
export default function WorkflowPage({ onNewProject }: { onNewProject: () => void }) {
  const { state, project, running, activeStage, run, cancel, liveOutputs, notify } = useStudio();
  const [selected, setSelected] = useState<StageId>('strategy');
  const [tab, setTab] = useState<'output' | 'prompt'>('output');
  const stage = stages.find(s => s.id === selected)!;
  const copy = stageCopy[selected];
  const recent = state.runs.filter(r => r.projectId === project.id);
  const saved = recent[0]?.outputs;
  const output = liveOutputs[selected] ?? saved?.[selected] ?? makeOutputs(project, state.issues)[selected];
  const outputIsSample = !liveOutputs[selected] && !saved?.[selected];
  const Icon = icons[stages.indexOf(stage)];
  const optimized = state.issues.filter(i => i.projectId === project.id && i.status !== 'Open' && i.stage === stage.name);
  const pending = state.issues.filter(i => i.projectId === project.id && i.status !== 'Resolved').length;
  const completed = running ? Object.keys(liveOutputs).length : activeStage === 6 ? 6 : recent[0]?.completedStages ?? 0;
  const exportRun = () => {
    download(`${project.id}-workflow.json`, JSON.stringify({ source: 'ListenPal 模拟工作流', project, outputs: Object.keys(liveOutputs).length ? liveOutputs : saved ?? makeOutputs(project, state.issues) }, null, 2));
    notify('工作流结果已导出。');
  };
  const complete = !running && (activeStage === 6 || recent[0]?.status === 'Completed');
  return <div className="workflow-page">
    <PageTitle eyebrow="创作 · 评测 · 持续优化" title="Agent 工作流" description="把创作需求转成可评测、可迭代的英文有声剧内容。" actions={<><button className="button secondary" onClick={onNewProject} disabled={running}><Plus size={16} />新建项目</button><button className="button primary run-button" onClick={running ? cancel : run}>{running ? <><Square size={14} />取消运行</> : <><Play size={15} fill="currentColor" />{complete ? '重新运行' : '运行工作流'}</>}</button></>} />
    <div className="workflow-guide" aria-label="操作步骤"><span><b>1</b>选择创作需求</span><ArrowRight size={14} /><span><b>2</b>运行六个 Agent</span><ArrowRight size={14} /><span><b>3</b>查看结果并优化</span></div>
    <section className="panel workflow-briefing"><div className="briefing-top"><div className="briefing-title"><span className="briefing-icon"><FileText size={19} /></span><div><span>当前创作需求</span><h2>{displayTitle(project.title)}</h2></div></div><ProjectSelect /></div><p className="briefing-description">{displayBrief(project.title, project.brief)}</p><div className="briefing-tags"><Badge>{displayGenre(project.genre)}</Badge><span>{displayAudience(project.audience)}</span><span>{project.plannedEpisodes} 集 · 英文有声剧</span></div></section>
    <section className="panel process-panel"><div className="panel-heading"><div><h2>内容生产流程</h2><p>点击任一步骤，查看它负责的任务与产出。</p></div><div className="workflow-status" role="status"><span className="live-dot" />{running ? `${stageCopy[stages[activeStage]?.id ?? 'strategy'].name}进行中` : complete ? '工作流已完成' : '可以开始运行'}<span>{completed} / 6</span></div></div><div className="process-steps">{stages.map((s, i) => {
      const NodeIcon = icons[i];
      const done = running ? Boolean(liveOutputs[s.id]) : Boolean(liveOutputs[s.id] ?? saved?.[s.id]);
      const active = running && activeStage === i;
      return <button key={s.id} className={`agent-node process-node ${selected === s.id ? 'selected' : ''} ${active ? 'executing' : ''} ${done ? 'is-complete' : ''}`} aria-pressed={selected === s.id} onClick={() => { setSelected(s.id); setTab('output'); }}><div className="node-top"><span className={`node-icon ${s.color}`}><NodeIcon size={20} /></span><span className="node-number">{active ? <LoaderCircle className="spin" size={15} /> : done ? <Check size={15} /> : `0${i + 1}`}</span></div><h3>{stageCopy[s.id].name}</h3><p>{stageCopy[s.id].short}</p><span className={`node-status ${done ? 'complete' : ''}`}><span className="status-dot" />{active ? '进行中' : done ? '已完成' : '待运行'}</span>{i < 5 && <ArrowRight className="process-connector" size={16} />}</button>;
    })}</div><div className="workflow-feedback"><RotateCcw size={15} /><span>评测发现问题 → 优化故事设定或生成指令 → 重新生成与验证</span></div><div className="run-progress"><span style={{ width: `${completed / 6 * 100}%` }} /></div></section>
    <div className="workflow-detail-layout"><section className="panel stage-purpose"><div className="stage-purpose-heading"><span className={`node-icon ${stage.color}`}><Icon size={22} /></span><div><span>第 {stages.indexOf(stage) + 1} 步</span><h2>{copy.name}</h2></div></div><div className="purpose-section"><h3>这一步解决什么问题？</h3><p>{copy.description}</p></div><div className="purpose-section"><h3>依赖哪些输入？</h3><ul>{copy.inputs.map(input => <li key={input}><Check size={13} />{input}</li>)}</ul></div><div className="purpose-section"><h3>如何判断完成？</h3><div className="completion-rule"><CheckCircle2 size={16} /><p>{copy.criteria}</p></div></div><div className="product-decision"><Lightbulb size={17} /><p>{copy.decision}</p></div></section>
    <section className="panel workflow-result"><div className="panel-heading"><div><h2>{copy.result}</h2><p>{outputIsSample ? '运行前可先查看示例，了解这一步会产出什么。' : '当前项目的模拟运行结果。'}</p></div><Badge tone={outputIsSample ? 'neutral' : 'green'}>{outputIsSample ? '示例结果' : '运行结果'}</Badge></div><div className="inspector-tabs" role="tablist" aria-label="步骤详情"><button id="result-tab" role="tab" aria-selected={tab === 'output'} aria-controls="stage-content" className={tab === 'output' ? 'active' : ''} onClick={() => setTab('output')}>生成结果</button><button id="prompt-tab" role="tab" aria-selected={tab === 'prompt'} aria-controls="stage-content" className={tab === 'prompt' ? 'active' : ''} onClick={() => setTab('prompt')}>提示词 <span>Prompt</span></button></div><div id="stage-content" className="workflow-result-body" role="tabpanel" aria-labelledby={tab === 'output' ? 'result-tab' : 'prompt-tab'}>
      {tab === 'output' ? <><AgentOutput key={`${project.id}-${selected}`} stage={selected} output={output} /><details className="technical-details"><summary>查看结构化数据 <span>JSON</span></summary><pre className="json-output">{JSON.stringify(output, null, 2)}</pre></details></> : <><div className="prompt-heading"><strong>当前生成指令</strong><Badge tone={optimized.length ? 'green' : 'neutral'}>{optimized.length ? 'v2 · 已优化' : 'v1 · 初始版本'}</Badge></div><p className="help-copy">指令用于创作英文剧本，因此保留英文。评测中心保存的优化会反馈到对应步骤。</p><div className="prompt-text" lang="en">{optimized.length ? optimized.map(i => i.optimizedPrompt).join('\n\n') : stage.prompt}</div><Link to="/evaluation" className="button secondary prompt-cta">去评测中心优化 <ArrowRight size={15} /></Link></>}
    </div><div className="result-footer"><span>模拟演示 · 音频步骤输出制作计划</span><button className="text-link" onClick={exportRun}><Download size={14} />导出结果</button></div></section></div>
    {complete && <div className="workflow-next-step"><span className="next-step-icon"><CheckCircle2 size={24} /></span><div><strong>生成完成，下一步确认内容质量</strong><p>{pending ? `发现 ${pending} 个待优化问题，可查看原因、修改提示词并重新评测。` : '查看评分和审核标准，确认是否适合进入音频制作。'}</p></div><Link to="/evaluation" className="button primary">查看质量评测 <ArrowRight size={16} /></Link></div>}
    <details className="panel history-disclosure"><summary><span>运行记录 <Badge>{recent.length} 次</Badge></span><span>查看历史</span></summary><div className="run-history">{recent.length === 0 ? <div className="history-empty"><p>还没有运行记录。点击“运行工作流”开始演示。</p></div> : recent.slice(0, 4).map(r => <div className="history-row" key={r.id}><span className="history-icon">{r.status === 'Completed' ? <Check size={16} /> : <Square size={13} />}</span><div><strong>{displayTitle(project.title)}</strong><span>{new Date(r.startedAt).toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span></div><span>{r.completedStages} / 6 步</span><Badge tone={r.status === 'Completed' ? 'green' : 'orange'}>{r.status === 'Completed' ? '已完成' : '已取消'}</Badge></div>)}</div></details>
  </div>;
}
