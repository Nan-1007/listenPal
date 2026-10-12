import { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { Project, StudioState, StageId } from './types';
import { makeOutputs, optimizeIssue, readState, resolveIssue, stages } from './domain';

interface StudioContextValue {
  state: StudioState; project: Project; selectProject: (id: string) => void;
  addProject: (data: Pick<Project, 'title' | 'genre' | 'audience' | 'brief' | 'plannedEpisodes'>) => Project;
  optimize: (id: string, prompt: string) => void; reevaluate: (id: string) => void;
  running: boolean; activeStage: number; run: () => Promise<void>; cancel: () => void;
  liveOutputs: Partial<Record<StageId, Record<string, unknown>>>;
  toast: string; notify: (message: string) => void;
}
const StudioContext = createContext<StudioContextValue | null>(null);
export function StudioProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(readState);
  const [running, setRunning] = useState(false);
  const [activeStage, setActiveStage] = useState(-1);
  const [liveOutputs, setLiveOutputs] = useState<StudioContextValue['liveOutputs']>({});
  const [toast, setToast] = useState('');
  const controller = useRef<AbortController | null>(null);
  const project = state.projects.find(p => p.id === state.selectedProjectId) ?? state.projects[0];
  useEffect(() => { try { localStorage.setItem('listenpal-studio-v1', JSON.stringify(state)); } catch { setToast('浏览器存储不可用，本次修改仅在当前页面会话中保留。'); } }, [state]);
  useEffect(() => { if (toast) { const timer = setTimeout(() => setToast(''), 4500); return () => clearTimeout(timer); } }, [toast]);
  useEffect(() => () => controller.current?.abort(), []);
  const selectProject = (id: string) => { if (controller.current || !state.projects.some(p => p.id === id)) return; setState(s => ({ ...s, selectedProjectId: id })); setLiveOutputs({}); setActiveStage(-1); };
  const addProject: StudioContextValue['addProject'] = data => {
    const p: Project = { ...data, id: crypto.randomUUID(), title: data.title.trim(), brief: data.brief.trim(), cover: ['sage', 'wine', 'peach', 'navy'][state.projects.length % 4], episodes: 0, score: null, status: 'Draft', updatedAt: new Date().toISOString() };
    setState(s => ({ ...s, projects: [p, ...s.projects], selectedProjectId: p.id })); setLiveOutputs({}); setActiveStage(-1); setToast('项目已创建，可以开始运行工作流。'); return p;
  };
  const run = async () => {
    if (controller.current) return;
    const abort = new AbortController(); controller.current = abort;
    setRunning(true); setLiveOutputs({}); setActiveStage(0);
    const outputs = makeOutputs(project, state.issues);
    const startedAt = new Date().toISOString(); let completedStages = 0;
    try {
      for (let i = 0; i < stages.length; i++) {
        setActiveStage(i);
        await new Promise<void>((resolve, reject) => {
          const onAbort = () => { clearTimeout(timer); reject(new Error('cancelled')); };
          const timer = setTimeout(() => { abort.signal.removeEventListener('abort', onAbort); resolve(); }, 800);
          abort.signal.addEventListener('abort', onAbort, { once: true });
        });
        if (abort.signal.aborted) throw new Error('cancelled');
        const stage = stages[i]; completedStages++;
        setLiveOutputs(prev => ({ ...prev, [stage.id]: outputs[stage.id] }));
      }
      setState(s => ({ ...s, projects: s.projects.map(p => p.id === project.id ? { ...p, episodes: p.plannedEpisodes, score: p.score ?? 8.8, status: s.issues.some(issue => issue.projectId === p.id && issue.status !== 'Resolved') ? 'Needs review' : 'Ready for audio', updatedAt: new Date().toISOString() } : p), runs: [{ id: crypto.randomUUID(), projectId: project.id, startedAt, status: 'Completed' as const, completedStages, outputs }, ...s.runs].slice(0, 20) }));
      setActiveStage(stages.length); setToast('六个 Agent 已完成，可以查看结果并进行质量评测。');
    } catch {
      setState(s => ({ ...s, runs: [{ id: crypto.randomUUID(), projectId: project.id, startedAt, status: 'Cancelled' as const, completedStages, outputs: Object.fromEntries(stages.slice(0, completedStages).map(stage => [stage.id, outputs[stage.id]])) }, ...s.runs].slice(0, 20) }));
      setActiveStage(-1); setToast('已取消运行，完成的步骤保存在运行记录中。');
    } finally { controller.current = null; setRunning(false); }
  };
  return <StudioContext.Provider value={{ state, project, selectProject, addProject, optimize: (id, prompt) => { setState(s => optimizeIssue(s, id, prompt)); setToast('优化方案已保存，请重新评测以验证改进。'); }, reevaluate: id => { setState(s => resolveIssue(s, id)); setToast('模拟评测完成，评分与文本证据已更新。'); }, running, activeStage, run, cancel: () => controller.current?.abort(), liveOutputs, toast, notify: setToast }}>{children}</StudioContext.Provider>;
}
export function useStudio() { const context = useContext(StudioContext); if (!context) throw new Error('StudioProvider is required'); return context; }
