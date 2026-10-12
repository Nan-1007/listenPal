export type ProjectStatus = 'Draft' | 'Needs review' | 'Ready for audio';
export type IssueStatus = 'Open' | 'Optimized' | 'Resolved';
export type StageId = 'strategy' | 'planning' | 'generation' | 'evaluation' | 'audio' | 'analytics';
export interface Project {
  id: string; title: string; genre: string; episodes: number; plannedEpisodes: number;
  score: number | null; status: ProjectStatus; cover: string; audience: string; brief: string;
  updatedAt: string;
}
export interface Issue {
  id: string; projectId: string; episode: number; category: string;
  severity: 'High' | 'Medium' | 'Low'; metric: string; before: number; after: number;
  excerpt: string; cause: string; originalPrompt: string; optimizedPrompt: string;
  replacement: string; stage: string; status: IssueStatus;
}
export interface Run {
  id: string; projectId: string; startedAt: string; status: 'Completed' | 'Cancelled';
  completedStages: number; outputs: Partial<Record<StageId, Record<string, unknown>>>;
}
export interface StudioState { projects: Project[]; issues: Issue[]; runs: Run[]; selectedProjectId: string; }
export interface Stage {
  id: StageId; name: string; role: string; description: string; input: string[]; metric: string;
  prompt: string; color: string;
}
