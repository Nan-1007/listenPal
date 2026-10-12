import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Bell, BookOpen, ChartNoAxesCombined, Check, ChevronRight, CircleHelp, FlaskConical, Headphones, LayoutDashboard, Menu, Plus, Workflow } from 'lucide-react';
import { Badge, Dialog } from './components/ui';
import { useStudio } from './lib/StudioContext';
import { displayAudience, displayTitle, genres } from './lib/display';
import Dashboard from './pages/Dashboard';
import WorkflowPage from './pages/Workflow';
import EvaluationPage from './pages/Evaluation';
import StoryPage from './pages/Story';
import AnalyticsPage from './pages/Analytics';

const navigation = [
  { to: '/', name: '项目总览', icon: LayoutDashboard },
  { to: '/workflow', name: 'Agent 工作流', icon: Workflow },
  { to: '/evaluation', name: '质量评测', icon: FlaskConical },
  { to: '/stories', name: '故事创作', icon: BookOpen },
  { to: '/analytics', name: '数据与实验', icon: ChartNoAxesCombined },
];
export default function App() {
  const { state, addProject, toast, running } = useStudio();
  const [modal, setModal] = useState<'new' | 'guide' | 'activity' | null>(null);
  const [sidebar, setSidebar] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const page = navigation.find(n => n.to === location.pathname)?.name ?? '工作台';
  const findings = state.issues.filter(i => i.status !== 'Resolved').length;
  const newProject = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const title = String(form.get('title') ?? '').trim();
    const brief = String(form.get('brief') ?? '').trim();
    if (title.length < 3 || brief.length < 20) { setError('项目名称至少 3 个字符，故事需求至少 20 个字符。'); return; }
    addProject({ title, brief, genre: String(form.get('genre')), audience: String(form.get('audience')), plannedEpisodes: Number(form.get('episodes')) });
    setModal(null); setError(''); navigate('/workflow');
  };
  const openNew = () => { setError(''); setModal('new'); };
  const navItem = ({ to, name, icon: Icon }: typeof navigation[number]) => <NavLink key={to} end={to === '/'} to={to} onClick={() => setSidebar(false)} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}><Icon size={19} /><span>{name}</span>{to === '/evaluation' && findings > 0 && <span className="nav-count">{findings}</span>}{to === '/workflow' && running && <span className="live-dot" />}</NavLink>;
  return <div className="app-shell">
    <a href="#main-content" className="skip-link">跳到主要内容</a>
    {sidebar && <button className="sidebar-backdrop" aria-label="关闭导航" onClick={() => setSidebar(false)} />}
    <aside className={`sidebar ${sidebar ? 'open' : ''}`}>
      <Link className="brand" to="/" onClick={() => setSidebar(false)}><span className="brand-mark"><Headphones size={24} /></span><span><strong>ListenPal<span className="brand-dot">.</span></strong><small>AI 内容生产工作台</small></span></Link>
      <div className="workspace-switch"><span className="workspace-avatar">L</span><div><strong>有声剧创作空间</strong><span>创作、评测、持续优化</span></div></div>
      <div className="nav-label">核心工作台</div>
      <nav aria-label="主要导航">{navigation.slice(0, 3).map(navItem)}<details className="secondary-navigation" open={['/stories', '/analytics'].includes(location.pathname) || undefined}><summary>更多工具 <ChevronRight size={14} /></summary>{navigation.slice(3).map(navItem)}</details></nav>
      <div className="sidebar-bottom"><div className="sidebar-principle"><span className="live-dot" /><strong>让内容持续变好</strong><p>创作需求 → Agent 协作<br />质量评测 → 数据反馈</p></div><button className="help-button" onClick={() => setModal('guide')}><CircleHelp size={18} />如何演示这个产品 <ArrowRight size={14} /></button><div className="sidebar-profile"><span>LP</span><div><strong>ListenPal Studio</strong><small>本地演示工作区</small></div></div></div>
    </aside>
    <div className="workspace-main">
      <header className="topbar"><div className="breadcrumbs"><button className="icon-button mobile-menu" aria-label="打开导航" onClick={() => setSidebar(true)}><Menu size={20} /></button><span>工作台</span><ChevronRight size={13} /><strong>{page}</strong></div><div className="topbar-actions"><button className="demo-indicator" onClick={() => setModal('guide')}><span className="live-dot" />模拟演示</button><div className="topbar-divider" /><button className="icon-button notification-button" aria-label="查看工作台动态" onClick={() => setModal('activity')}><Bell size={18} />{findings > 0 && <span />}</button><span className="topbar-avatar" aria-label="ListenPal 工作区">LP</span></div></header>
      <main id="main-content" tabIndex={-1} key={location.pathname}>
        <Routes><Route path="/" element={<Dashboard onNewProject={openNew} />} /><Route path="/workflow" element={<WorkflowPage onNewProject={openNew} />} /><Route path="/evaluation" element={<EvaluationPage />} /><Route path="/stories" element={<StoryPage onNewProject={openNew} />} /><Route path="/analytics" element={<AnalyticsPage />} /><Route path="*" element={<div className="not-found"><Headphones size={40} /><h1>暂时没有这个页面</h1><p>回到项目总览，继续创作或查看评测结果。</p><Link to="/" className="button primary">返回项目总览 <ArrowRight size={16} /></Link></div>} /></Routes>
        <footer className="app-footer"><span>ListenPal · AI 内容生产工作台</span><span>产品原型 · 数据与评测为模拟示例</span></footer>
      </main>
    </div>
    {toast && <div className="toast" role="status"><span><Check size={16} /></span>{toast}</div>}
    {modal === 'new' && <Dialog title="创建一个故事项目" onClose={() => setModal(null)}><p className="dialog-intro">定义你想讲的故事，再让 Agent 完成规划、生成与评测。</p><form onSubmit={newProject}><label className="form-label" htmlFor="project-title">项目名称</label><input autoFocus id="project-title" name="title" className="form-input" placeholder="例如：最后的承诺" required minLength={3} maxLength={80} /><label className="form-label" htmlFor="project-brief">故事需求 <span className="optional-label">至少 20 个字符</span></label><textarea id="project-brief" name="brief" className="form-input" placeholder="主角想要什么？遇到了什么阻碍？哪个秘密会改变故事？" rows={4} required minLength={20} maxLength={2000} /><div className="form-row"><div><label className="form-label" htmlFor="project-genre">内容题材</label><select id="project-genre" name="genre" className="form-input">{Object.entries(genres).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div><div><label className="form-label" htmlFor="project-episodes">剧集长度</label><select id="project-episodes" name="episodes" className="form-input" defaultValue="10">{[5, 10, 20, 30].map(n => <option key={n} value={n}>{n} 集</option>)}</select></div></div><label className="form-label" htmlFor="project-audience">目标用户</label><select id="project-audience" name="audience" className="form-input">{['Women 25–44 · US & Europe', 'Women 18–34 · US & Europe', 'Women 35–54 · US & Europe'].map(a => <option key={a} value={a}>{displayAudience(a)}</option>)}</select><p className="form-hint">面向欧美听众，最终剧本使用英文。创作需求可以用中文填写。</p>{error && <p className="form-error" role="alert">{error}</p>}<div className="modal-actions"><button type="button" className="button secondary" onClick={() => setModal(null)}>取消</button><button type="submit" className="button primary" disabled={running}><Plus size={16} />创建项目</button></div></form></Dialog>}
    {modal === 'guide' && <Dialog title="用三步展示产品闭环" onClose={() => setModal(null)}><p className="dialog-intro">这是面向英文有声剧生产的 AI 产品原型。界面帮助你理解创作、质量和反馈如何协作。</p><div className="guide-list">{[{ icon: Workflow, title: '1. 定义需求，运行工作流', text: '选择示例或创建项目，观察六个 Agent 如何分工，查看每一步的输入、输出和验收标准。' }, { icon: FlaskConical, title: '2. 用评测结果改进内容', text: '进入质量评测，打开问题案例，定位根因、应用提示词优化，再重新评测验证。' }, { icon: ChartNoAxesCombined, title: '3. 用用户数据指导下一轮', text: '在更多工具中打开数据与实验，了解剧集长度、演播形式与付费卡点如何影响留存和转化。' }].map(({ icon: Icon, title, text }) => <div key={title}><span><Icon size={20} /></span><div><h3>{title}</h3><p>{text}</p></div></div>)}</div><div className="guide-note"><p>当前使用模拟数据，不调用真实模型或合成音频。项目、运行与优化记录保存在此浏览器中。</p></div><div className="modal-actions"><button className="button primary" onClick={() => { setModal(null); navigate('/workflow'); }}>开始体验 <ArrowRight size={16} /></button></div></Dialog>}
    {modal === 'activity' && <Dialog title="工作台动态" onClose={() => setModal(null)}><div className="activity-summary"><Badge tone="green">{state.projects.length} 个项目</Badge><Badge tone="orange">{findings} 个待处理问题</Badge><Badge>{state.runs.length} 次运行</Badge></div><div className="activity-entry"><FlaskConical size={19} /><div><h3>{findings ? `${findings} 个问题等待优化` : '示例问题均已完成验证'}</h3><p>将问题原因反馈到创作指令，改进下一轮生成。</p><Link to="/evaluation" onClick={() => setModal(null)} className="text-link">查看质量评测 <ArrowRight size={14} /></Link></div></div>{state.runs.slice(0, 3).map(r => <div className="activity-entry" key={r.id}><Workflow size={19} /><div><h3>{displayTitle(state.projects.find(p => p.id === r.projectId)?.title ?? '')}</h3><p>{r.status === 'Completed' ? '已完成' : '已取消'} · {r.completedStages} / 6 步 · {new Date(r.startedAt).toLocaleDateString('zh-CN')}</p></div></div>)}{state.runs.length === 0 && <p className="help-copy">运行工作流后，可在这里查看最新进展。</p>}</Dialog>}
  </div>;
}
