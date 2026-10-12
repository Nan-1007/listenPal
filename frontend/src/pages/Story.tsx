import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Plus, Users } from 'lucide-react';
import { Badge, Cover, PageTitle, ProjectSelect } from '../components/ui';
import AgentOutput from '../components/AgentOutput';
import { useStudio } from '../lib/StudioContext';
import { makeOutputs } from '../lib/domain';
import { displayAudience, displayGenre, displayTitle } from '../lib/display';

export default function StoryPage({ onNewProject }: { onNewProject: () => void }) {
  const { project, state, running } = useStudio();
  const [tab, setTab] = useState<'brief' | 'plan'>('brief');
  const saved = state.runs.find(r => r.projectId === project.id && r.status === 'Completed');
  const outputs = saved?.outputs ?? makeOutputs(project, state.issues);
  return <>
    <PageTitle eyebrow="先定义故事，再展开创作" title="故事创作" description="把用户、题材、冲突和人物设定组织成明确的创作需求。" actions={<><ProjectSelect /><button className="button primary" onClick={onNewProject} disabled={running}><Plus size={16} />新建项目</button></>} />
    <div className="story-layout"><section className="panel story-overview"><Cover title={project.title} tone={project.cover} /><div className="story-overview-copy"><Badge tone="green">{displayGenre(project.genre)}</Badge><h2>{displayTitle(project.title)}</h2><p>{displayAudience(project.audience)}</p><div className="story-stats"><span><BookOpen size={16} />{project.plannedEpisodes} 集</span><span><Users size={16} />双人演播</span></div><Link to="/workflow" className="button primary full-width">进入工作流 <ArrowRight size={16} /></Link></div></section>
    <section className="panel story-output"><div className="panel-heading"><div><h2>创作工作区</h2><p>统一的故事设定，让后续章节生成有据可依。</p></div><Badge>{saved ? '运行结果' : '示例内容'}</Badge></div><div className="inspector-tabs" role="tablist" aria-label="创作内容"><button role="tab" aria-selected={tab === 'brief'} className={tab === 'brief' ? 'active' : ''} onClick={() => setTab('brief')}>故事需求</button><button role="tab" aria-selected={tab === 'plan'} className={tab === 'plan' ? 'active' : ''} onClick={() => setTab('plan')}>人物与章节规划</button></div><div className="story-content" role="tabpanel"><AgentOutput key={`${project.id}-${tab}`} stage={tab === 'brief' ? 'strategy' : 'planning'} output={outputs[tab === 'brief' ? 'strategy' : 'planning'] ?? makeOutputs(project, state.issues)[tab === 'brief' ? 'strategy' : 'planning']} /></div></section></div>
  </>;
}
