import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Download, FlaskConical, MousePointer2, TrendingUp, Users, Wallet } from 'lucide-react';
import { Badge, Metric, PageTitle, PerformanceChart } from '../components/ui';
import { benchmarks, download, experiments } from '../lib/domain';
import { useStudio } from '../lib/StudioContext';

const experimentCopy: Record<string, { title: string; variable: string; metric: string; control: string; variant: string; hypothesis: string; next: string }> = {
  length: { title: '更短的剧集，会让用户听得更久吗？', variable: '剧集长度', metric: '15 分钟留存率', control: '每集 12 分钟', variant: '每集 8 分钟', hypothesis: '缩短单集时长，可能降低开始收听的负担，并提高连续收听意愿。', next: '保持题材和演播形式一致，只调整时长，观察留存与完播率。' },
  voice: { title: '双人演播，会让故事更有吸引力吗？', variable: '演播形式', metric: '封面点击率', control: '单人演播', variant: '双人演播', hypothesis: '清晰的角色声音与演播预告，可能提高故事的吸引力。', next: '固定封面和内容，比较不同演播预告的点击与开始收听率。' },
  paywall: { title: '用户投入感情后，是否更愿意付费？', variable: '付费卡点', metric: '付费转化率', control: '第 3 集后付费', variant: '第 5 集后付费', hypothesis: '让用户先建立情感投入，可能提升到达付费卡点后的转化。', next: '比较付费点留存、付费转化与每位用户收入，避免只看单一指标。' },
};
export default function AnalyticsPage() {
  const [selected, setSelected] = useState(experiments[0].id);
  const experiment = experiments.find(e => e.id === selected)!;
  const copy = experimentCopy[selected];
  const { notify } = useStudio();
  return <>
    <PageTitle eyebrow="用用户行为检验内容决策" title="数据与实验" description="从点击、留存和付费，找到下一轮内容策略需要验证的问题。" actions={<button className="button secondary" onClick={() => { download('listenpal-experiments.json', JSON.stringify({ source: '模拟实验数据', benchmarks, experiments }, null, 2)); notify('实验数据已导出。'); }}><Download size={16} />导出数据</button>} />
    <div className="analytics-notice"><FlaskConical size={18} /><span>以下为模拟实验，用来展示“假设 → 对比 → 反馈”的产品思路。</span><Badge>示例数据</Badge></div>
    <div className="metrics-grid"><Metric label="封面点击率" value="18.0" unit="%" change="较基线 +6.0 个百分点" icon={<MousePointer2 size={19} />} /><Metric label="15 分钟留存率" value="49.8" unit="%" change="较基线 +14.8 个百分点" icon={<Users size={19} />} tone="purple" /><Metric label="付费点留存率" value="32.6" unit="%" note="到达付费卡点的听众占比" icon={<Wallet size={19} />} tone="orange" /><Metric label="付费转化率" value="6.4" unit="%" change="较基线 +2.2 个百分点" icon={<TrendingUp size={19} />} tone="blue" /></div>
    <section className="panel experiment-panel"><div className="panel-heading"><div><h2>一次实验，回答一个问题</h2><p>明确假设，控制变量，再观察用户行为。</p></div><Badge>3 个示例实验</Badge></div><div className="experiment-tabs" role="tablist" aria-label="内容实验">{experiments.map(e => <button role="tab" aria-selected={selected === e.id} className={selected === e.id ? 'active' : ''} key={e.id} onClick={() => setSelected(e.id)}><FlaskConical size={16} />{experimentCopy[e.id].variable}</button>)}</div><div className="experiment-content" role="tabpanel"><div><span className="eyebrow">{copy.metric}</span><h2>{copy.title}</h2><p className="experiment-hypothesis">{copy.hypothesis}</p><p>{experiment.sample.toLocaleString()} 位模拟用户 · 两组均分</p><div className="experiment-result"><strong>+{(experiment.after - experiment.before).toFixed(1)}<span>个百分点</span></strong><Badge tone="green">示例方向改善</Badge></div></div><div className="comparison"><div><span>对照组 · {copy.control}</span><strong>{experiment.before}%</strong><div className="comparison-track"><span style={{ width: `${experiment.before / 60 * 100}%` }} /></div></div><div><span>实验组 · {copy.variant}</span><strong>{experiment.after}%</strong><div className="comparison-track"><span className="optimized" style={{ width: `${experiment.after / 60 * 100}%` }} /></div></div></div></div><div className="experiment-next"><TrendingUp size={19} /><div><strong>下一步如何验证？</strong><p>{copy.next}</p></div><Link to="/workflow" className="text-link">反馈到内容策略 <ArrowRight size={15} /></Link></div><div className="table-footer">模拟对比不代表真实增长、统计显著性或因果关系。</div></section>
    <details className="panel analytics-trend"><summary>查看留存趋势 <span>近 30 天示例</span></summary><PerformanceChart /></details>
  </>;
}
