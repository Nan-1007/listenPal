import fixture from '../../../demo-data/studio.json';
import type { Issue, Project, Stage, StageId, StudioState } from './types';

export const benchmarks = fixture.benchmarks;
export const experiments = fixture.experiments;
export const stages: Stage[] = [
  { id: 'strategy', name: 'Content Strategy', role: 'Find the emotional spark', description: 'Turn audience signals into a focused content brief.', input: ['Audience profile', 'Genre & platform goals', 'Sample competitor patterns'], metric: 'Audience fit · conflict strength · emotional escalation', prompt: 'Identify a strong relationship conflict, an information gap, and an emotional hook for the target audience. Return a content brief with pacing and an escalating emotional curve.', color: 'sage' },
  { id: 'planning', name: 'Story Planning', role: 'Give the story a spine', description: 'Build the Story Bible, character relationships, and episode arc.', input: ['Content strategy brief', 'Episode count', 'Established character facts'], metric: 'Character consistency · causal continuity · outline coverage', prompt: 'Create a Story Bible and episode outline. Preserve character motivations and a causal chain between scenes. Every episode needs a meaningful choice and a hook.', color: 'sand' },
  { id: 'generation', name: 'Story Generation', role: 'Make every chapter count', description: 'Write natural dialogue and audio-ready scenes, one episode at a time.', input: ['Story Bible', 'Episode outline', 'Approved prompt version'], metric: 'Dialogue naturalness · hook score · language consistency', prompt: 'Tell the story like a real person calling a close friend. Use natural English dialogue to move the plot forward. Show emotion through decisions and pauses. Output only the episode script; never mention AI or the writing process.', color: 'lilac' },
  { id: 'evaluation', name: 'Quality Evaluation', role: 'Keep the quality bar high', description: 'Evaluate the script and turn bad cases into actionable feedback.', input: ['Generated episode script', 'Story Bible', 'Quality rubric'], metric: 'Plot ≥ 8.5 · character ≥ 8.5 · hook ≥ 8.5 · low AI pattern', prompt: 'Score plot logic, character consistency, and chapter hooks from 0 to 10. Check model self-disclosure, mixed languages, repetition, and style anomalies. Cite evidence and identify the responsible stage.', color: 'peach' },
  { id: 'audio', name: 'Audio Production', role: 'Let the story be heard', description: 'Prepare speaker turns, voice direction, and narration pacing.', input: ['Quality-reviewed script', 'Speaker profiles', 'TTS pacing parameters'], metric: 'Speaker clarity · 145–155 WPM · production readiness', prompt: 'Prepare an audio production plan with distinct speaker labels, natural pauses, and pronunciation notes. Do not read production annotations aloud. Flag unresolved quality findings for a human review.', color: 'wine' },
  { id: 'analytics', name: 'Analytics', role: 'Learn from every listen', description: 'Connect content decisions to listening and conversion signals.', input: ['Simulated listening events', 'Experiment assignments', 'Paywall positions'], metric: 'Cover CTR · 15-min retention · paywall retention · paid conversion', prompt: 'Compare experiment variants using CTR, retention, and conversion. Separate observed sample results from causal claims. Feed useful findings back into the next content brief.', color: 'navy' },
];

export function initialState(now = new Date()): StudioState {
  return {
    projects: fixture.projects.map(({ ageDays, ...p }) => ({ ...p, status: p.status as Project['status'], updatedAt: new Date(now.getTime() - ageDays * 86400000).toISOString() })),
    issues: fixture.issues as Issue[], runs: [], selectedProjectId: fixture.projects[0].id,
  };
}

export function filterProjects(projects: Project[], search = '', status = 'All statuses') {
  return projects.filter(p => (status === 'All statuses' || p.status === status) && `${p.title} ${p.genre}`.toLowerCase().includes(search.trim().toLowerCase()));
}

export function summarize(projects: Project[], days: number, now = new Date()) {
  const scoped = projects.filter(p => new Date(p.updatedAt).getTime() >= now.getTime() - days * 86400000);
  const scored = scoped.filter(p => p.score !== null);
  return { episodes: scoped.reduce((sum, p) => sum + p.episodes, 0), quality: scored.length ? scored.reduce((sum, p) => sum + (p.score ?? 0), 0) / scored.length : 0, projects: scoped.length };
}

export function scorecard(project: Project, issues: Issue[]) {
  if (project.score === null) return { plot: 0, character: 0, hook: 0, ai: 'Not evaluated', overall: 0 };
  const own = issues.filter(i => i.projectId === project.id);
  const gain = own.filter(i => i.status === 'Resolved').length * 0.12;
  const base = fixture.projects.find(p => p.id === project.id)?.score ?? project.score;
  return { plot: Math.min(10, base + gain), character: Math.min(10, base + 0.2 + gain), hook: Math.min(10, base - 0.1 + gain), ai: own.some(i => i.category === 'AI pattern' && i.status !== 'Resolved') ? 'Review needed' : 'Low', overall: Math.min(10, base + gain) };
}

export function optimizeIssue(state: StudioState, id: string, prompt: string): StudioState {
  if (!prompt.trim()) throw new Error('The optimized prompt cannot be empty.');
  return { ...state, issues: state.issues.map(i => i.id === id && i.status !== 'Resolved' ? { ...i, optimizedPrompt: prompt.trim(), status: 'Optimized' } : i) };
}

export function resolveIssue(state: StudioState, id: string): StudioState {
  const issue = state.issues.find(i => i.id === id);
  if (!issue || issue.status !== 'Optimized') return state;
  const issues = state.issues.map(i => i.id === id ? { ...i, status: 'Resolved' as const } : i);
  const project = state.projects.find(p => p.id === issue.projectId);
  const overall = project ? scorecard(project, issues).overall : 0;
  return { ...state, issues, projects: state.projects.map(p => p.id === issue.projectId ? { ...p, score: overall, status: issues.some(i => i.projectId === p.id && i.status !== 'Resolved') ? 'Needs review' : 'Ready for audio', updatedAt: new Date().toISOString() } : p) };
}

export function makeOutputs(project: Project, issues: Issue[] = []): Record<StageId, Record<string, unknown>> {
  const leads = project.genre === 'Second Chance Romance' ? ['Nora — restorer, guarding an old hurt', 'Elliot — owner, hiding an unsent letter'] : project.genre === 'Mystery Romance' ? ['Mara — radio host, determined to uncover the truth', 'Jonah — investigator, withholding a crucial clue'] : ['Clara — founder, reclaiming her independence', 'Adrian — rival, torn between loyalty and love'];
  const cards = scorecard({ ...project, score: project.score ?? 8.8 }, issues);
  return {
    strategy: { title: project.title, audience: project.audience, genre: project.genre, brief: project.brief, relationship: leads, coreConflict: project.brief, pacing: 'Early conflict → reluctant trust → secret revealed → earned agency', emotionalCurve: [3, 5, 4, 7, 6, 9, 8, 10], audienceSignals: 'Illustrative competitor patterns, not live market research' },
    planning: { storyBible: { leads, facts: ['The protagonist chooses her own path.', 'Every reveal has an earlier clue.', 'Trust changes through actions, not exposition.'] }, episodes: Array.from({ length: project.plannedEpisodes }, (_, i) => ({ episode: i + 1, title: ['The unexpected call', 'Terms and conditions', 'A dangerous favor', 'The missing piece', 'Trust has a price'][i % 5], beat: `${project.title}: ${i < project.plannedEpisodes / 2 ? 'Escalate the central conflict through a character decision.' : 'Pay off an earlier clue and deepen the relationship.'}`, hook: i === project.plannedEpisodes - 1 ? 'An earned resolution, with a door left open.' : 'A new piece of evidence changes the next choice.' })) },
    generation: { title: project.title, episodesGenerated: project.plannedEpisodes, scriptPreview: `${project.title} · Episode 1\n\n${leads[0].split(' — ')[0].toUpperCase()}: You said this was over.\n\n${leads[1].split(' — ')[0].toUpperCase()}: I thought it was.\n\nThe phone vibrated between them. One message. Three words.\n\nI have proof.`, language: 'English', format: 'Dialogue-led audio drama', promptVersion: issues.some(i => i.projectId === project.id && i.status !== 'Open') ? 'v2 · evaluation feedback applied' : 'v1 · natural dialogue' },
    evaluation: { plotQuality: cards.plot.toFixed(1), characterConsistency: cards.character.toFixed(1), hookScore: cards.hook.toFixed(1), aiPattern: cards.ai, gate: issues.some(i => i.projectId === project.id && i.status !== 'Resolved') ? 'Human review required before audio release' : 'Ready for audio production review', checks: ['Plot logic', 'Character drift', 'Model self-disclosure', 'Mixed languages', 'Repetition', 'Style anomalies'] },
    audio: { mode: 'Production plan only — no audio file is generated', narration: 'Dual voice · English', pace: '150 words/minute', speakerPause: '300ms', revealPause: '700ms', estimatedEpisodeMinutes: 8, releaseGate: 'Human sign-off required' },
    analytics: { source: 'Simulated experiment data', coverCTR: '18.0%', retention15min: '49.8%', paywallRetention: '32.6%', paidConversion: '6.4%', nextBrief: 'Test shorter episodes, dual narration, and a later paywall.', causalConfidence: 'Illustrative comparison; not a validated causal result' },
  };
}

export function readState(): StudioState {
  try {
    const raw = localStorage.getItem('listenpal-studio-v1');
    if (!raw) return initialState();
    const parsed: unknown = JSON.parse(raw);
    if (isStudioState(parsed)) return parsed;
  } catch { /* A restricted or full browser storage should not prevent the demo from opening. */ }
  return initialState();
}
function isStudioState(value: unknown): value is StudioState {
  if (!value || typeof value !== 'object') return false;
  const s = value as Partial<StudioState>;
  return Array.isArray(s.projects) && s.projects.length > 0 && s.projects.every(p => typeof p.id === 'string' && typeof p.title === 'string' && typeof p.brief === 'string' && typeof p.audience === 'string' && typeof p.genre === 'string' && typeof p.cover === 'string' && Number.isInteger(p.episodes) && p.episodes >= 0 && Number.isInteger(p.plannedEpisodes) && p.plannedEpisodes > 0 && p.plannedEpisodes <= 100 && ['Draft', 'Needs review', 'Ready for audio'].includes(p.status) && (p.score === null || Number.isFinite(p.score)) && typeof p.updatedAt === 'string' && Number.isFinite(Date.parse(p.updatedAt))) && Array.isArray(s.issues) && s.issues.every(i => ['id', 'projectId', 'category', 'metric', 'excerpt', 'cause', 'originalPrompt', 'optimizedPrompt', 'replacement', 'stage'].every(key => typeof i[key as keyof Issue] === 'string') && Number.isFinite(i.before) && Number.isFinite(i.after) && Number.isInteger(i.episode) && ['High', 'Medium', 'Low'].includes(i.severity) && ['Open', 'Optimized', 'Resolved'].includes(i.status)) && Array.isArray(s.runs) && s.runs.every(r => typeof r.id === 'string' && typeof r.projectId === 'string' && typeof r.startedAt === 'string' && Number.isInteger(r.completedStages) && r.completedStages >= 0 && r.completedStages <= 6 && ['Completed', 'Cancelled'].includes(r.status) && typeof r.outputs === 'object' && r.outputs !== null) && typeof s.selectedProjectId === 'string' && s.projects.some(p => p.id === s.selectedProjectId);
}

export function download(filename: string, content: string, mime = 'application/json') {
  const url = URL.createObjectURL(new Blob([content], { type: mime }));
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function exportCsv(projects: Project[]) {
  const cell = (value: unknown) => { let text = String(value ?? ''); if (/^[=+@\-\t\r]/.test(text)) text = `'${text}`; return `"${text.replaceAll('"', '""')}"`; };
  return ['Title,Genre,Episodes,Quality,Status', ...projects.map(p => [p.title, p.genre, p.episodes, p.score, p.status].map(cell).join(','))].join('\r\n');
}
