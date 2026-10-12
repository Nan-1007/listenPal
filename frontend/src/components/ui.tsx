import { useEffect, useRef, useId } from 'react';
import type { ReactNode } from 'react';
import { ArrowUpRight, Check, ChevronDown, Headphones, X } from 'lucide-react';
import { useStudio } from '../lib/StudioContext';

export function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: string }) { return <span className={`badge badge-${tone}`}>{children}</span>; }
export function PageTitle({ eyebrow, title, description, actions }: { eyebrow: string; title: string; description: string; actions?: ReactNode }) {
  return <div className="page-title"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{description}</p></div><div className="page-actions">{actions}</div></div>;
}
export function ProjectSelect() {
  const { state, project, selectProject, running } = useStudio();
  return <label className="select-wrap project-select"><Headphones size={16} /><span className="sr-only">Select project</span><select aria-label="Select project" value={project.id} onChange={e => selectProject(e.target.value)} disabled={running}>{state.projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}</select><ChevronDown size={14} /></label>;
}
export function Cover({ title, tone, small = false }: { title: string; tone: string; small?: boolean }) {
  return <div className={`story-cover cover-${tone} ${small ? 'cover-small' : ''}`} aria-hidden="true"><div className="cover-orbit" /><div className="cover-orbit second" /><span className="cover-label">A LISTENPAL ORIGINAL</span><strong>{title}</strong><div className="cover-wave">Ⅱ Ⅲ Ⅱ Ⅰ Ⅲ Ⅱ Ⅰ Ⅱ</div></div>;
}
export function Metric({ label, value, unit, change, icon, points, tone = 'green', note }: { label: string; value: string; unit?: string; change?: string; icon: ReactNode; points?: number[]; tone?: string; note?: string }) {
  return <article className="metric-card"><div className="metric-top"><span>{label}</span><span className={`metric-icon ${tone}`}>{icon}</span></div><div className="metric-value">{value}<span>{unit}</span></div><div className="metric-bottom"><span className="metric-change">{change ? <><ArrowUpRight size={13} />{change}</> : note}</span>{points && <Sparkline points={points} tone={tone} />}</div></article>;
}
export function Sparkline({ points, tone = 'green' }: { points: number[]; tone?: string }) {
  const min = Math.min(...points) - 2, range = Math.max(...points) - min + 2;
  const coords = points.map((v, i) => `${i * 90 / (points.length - 1)},${32 - (v - min) / range * 28}`).join(' ');
  return <svg className={`sparkline ${tone}`} viewBox="0 0 92 36" aria-hidden="true"><polyline points={coords} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
export function PerformanceChart({ days = 30, variant = 'retention' }: { days?: number; variant?: 'retention' | 'episodes' }) {
  const id = useId().replaceAll(':', '');
  const values = variant === 'retention' ? (days === 30 ? [32, 37, 34, 40, 38, 43, 41, 46, 42, 47, 45, 49.8] : [42, 45, 43, 47, 46, 48, 51.2]) : (days === 30 ? [8, 14, 12, 20, 17, 23, 19, 27, 24, 32, 29, 35] : [16, 22, 18, 26, 23, 29, 34]);
  const y = (v: number) => 184 - v / 60 * 160;
  const points = values.map((v, i) => [56 + i * 620 / (values.length - 1), y(v)]);
  const path = points.map((p, i) => `${i ? 'L' : 'M'} ${p.join(' ')}`).join(' ');
  const labels = days === 30 ? ['Day 1', 'Day 7', 'Day 14', 'Day 21', 'Day 30'] : ['Day 1', 'Day 2', 'Day 4', 'Day 6', 'Day 7'];
  return <div className="chart-wrap"><svg viewBox="0 0 712 220" role="img" aria-label={`Simulated ${days}-day ${variant === 'retention' ? '15-minute retention trend, ending at ' + values.at(-1) + ' percent' : 'episode production trend, ending at ' + values.at(-1) + ' episodes'}`}>
    <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#b6cdb6" stopOpacity=".5" /><stop offset="100%" stopColor="#b6cdb6" stopOpacity=".02" /></linearGradient></defs>
    {[0, 15, 30, 45, 60].map(v => <g key={v}><line x1="56" y1={y(v)} x2="680" y2={y(v)} stroke="#e9ece7" strokeDasharray="4 5" /><text x="8" y={y(v) + 4} className="chart-label">{v}{variant === 'retention' ? '%' : ''}</text></g>)}
    {variant === 'retention' && <path d="M56 122 L 112 125 L 169 119 L 225 124 L 281 118 L 338 120 L 394 117 L 450 121 L 507 118 L 563 119 L 620 117 L 676 117" stroke="#c1c6bd" strokeWidth="2" strokeDasharray="5 5" fill="none" />}
    <path d={`${path} L676 184 L56 184 Z`} fill={`url(#${id})`} /><path d={path} fill="none" stroke="#4c775b" strokeWidth="2.5" strokeLinejoin="round" />
    <circle cx="676" cy={y(values[values.length - 1])} r="5" fill="#4c775b" stroke="white" strokeWidth="3" />
    {labels.map((label, i) => <text key={label} x={56 + i * 620 / 4} y="212" textAnchor={i === 0 ? 'start' : i === 4 ? 'end' : 'middle'} className="chart-label">{label}</text>)}
  </svg></div>;
}
export function Dialog({ title, onClose, children, className = '' }: { title: string; onClose: () => void; children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDialogElement>(null); const id = useId();
  useEffect(() => { const dialog = ref.current; dialog?.showModal(); return () => dialog?.close(); }, []);
  return <dialog ref={ref} className={`modal ${className}`} aria-labelledby={id} onCancel={e => { e.preventDefault(); onClose(); }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}><div className="modal-header"><div><div className="eyebrow">LISTENPAL STUDIO</div><h2 id={id}>{title}</h2></div><button className="icon-button" aria-label="Close dialog" onClick={onClose}><X size={20} /></button></div>{children}</dialog>;
}
export function Empty({ title, message }: { title: string; message: string }) { return <div className="empty-state"><div className="empty-icon"><Check size={25} /></div><h3>{title}</h3><p>{message}</p></div>; }
