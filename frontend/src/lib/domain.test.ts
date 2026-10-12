import { describe, expect, it } from 'vitest';
import { exportCsv, filterProjects, initialState, makeOutputs, optimizeIssue, resolveIssue, scorecard, summarize } from './domain';

describe('studio data and quality loop', () => {
  const now = new Date('2026-10-12T00:00:00Z');
  it('scopes episode totals to the selected reporting period', () => {
    const state = initialState(now);
    expect(summarize(state.projects, 30, now).episodes).toBe(248);
    expect(summarize(state.projects, 7, now).episodes).toBe(140);
    expect(summarize([], 30, now).quality).toBe(0);
  });
  it('combines case-insensitive search with status filters', () => {
    const { projects } = initialState(now);
    expect(filterProjects(projects, ' ROMANCE ', 'Needs review')).toHaveLength(2);
    expect(filterProjects(projects, 'velvet', 'Needs review')).toHaveLength(0);
  });
  it('requires optimization before re-evaluation', () => {
    const state = initialState(now);
    expect(resolveIssue(state, state.issues[0].id)).toBe(state);
    expect(() => optimizeIssue(state, state.issues[0].id, '  ')).toThrow();
  });
  it('saves an edited prompt, resolves evidence, and prevents double-counting', () => {
    const state = initialState(now); const issue = state.issues[0];
    const optimized = optimizeIssue(state, issue.id, ' Preserve established facts. ');
    expect(optimized.issues[0].optimizedPrompt).toBe('Preserve established facts.');
    expect(optimized.issues[0].status).toBe('Optimized');
    const resolved = resolveIssue(optimized, issue.id);
    expect(resolved.issues[0].status).toBe('Resolved');
    expect(scorecard(resolved.projects[0], resolved.issues).overall).toBeCloseTo(8.92);
    expect(resolveIssue(resolved, issue.id)).toBe(resolved);
    expect(resolved.projects[0].status).toBe('Needs review');
  });
  it('passes the quality gate only after all findings for the story are resolved', () => {
    let state = initialState(now);
    for (const issue of state.issues.filter(i => i.projectId === 'last-promise')) state = resolveIssue(optimizeIssue(state, issue.id, issue.optimizedPrompt), issue.id);
    expect(state.projects[0].status).toBe('Ready for audio');
    expect(scorecard(state.projects[0], state.issues).ai).toBe('Low');
    expect(state.issues.find(i => i.projectId === 'second-chance')?.status).toBe('Open');
  });
  it('does not compound score gains across repeated resolutions', () => {
    let state = initialState(now); const issue = state.issues.find(i => i.projectId === 'second-chance')!;
    state = resolveIssue(optimizeIssue(state, issue.id, issue.optimizedPrompt), issue.id);
    expect(scorecard(state.projects.find(p => p.id === 'second-chance')!, state.issues).overall).toBeCloseTo(8.72);
  });
  it('creates the requested outline length and labels simulated audio and analytics', () => {
    const state = initialState(now); const project = { ...state.projects[0], plannedEpisodes: 10 };
    const outputs = makeOutputs(project);
    expect(outputs.planning.episodes).toHaveLength(10);
    expect(outputs.strategy.brief).toBe(project.brief);
    expect(outputs.audio.mode).toContain('no audio file');
    expect(outputs.analytics.source).toContain('Simulated');
  });
  it('exports CSV with escaped quotes and neutralized spreadsheet formulas', () => {
    const project = { ...initialState(now).projects[0], title: '=HYPERLINK("x")' };
    expect(exportCsv([project])).toContain('"\'=HYPERLINK(""x"")"');
  });
});
