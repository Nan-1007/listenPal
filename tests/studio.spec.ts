import { expect, test } from '@playwright/test';

test('dashboard filters, time range, CSV export and page previews', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Your studio, at a glance.' })).toBeVisible();
  await expect(page.locator('.metric-value').first()).toContainText('248');
  await page.screenshot({ path: 'screenshots/dashboard.png', fullPage: true });
  await page.getByLabel('Reporting period').selectOption('7');
  await expect(page.locator('.metric-value').first()).toContainText('140');
  await page.getByLabel('Search projects').fill('Velvet');
  await expect(page.locator('tbody tr')).toHaveCount(1);
  await page.getByLabel('Filter project status').selectOption('Needs review');
  await expect(page.getByText('No stories found')).toBeVisible();
  const downloadPromise = page.waitForEvent('download'); await page.getByRole('button', { name: 'Export report' }).click();
  expect((await downloadPromise).suggestedFilename()).toBe('listenpal-project-report.csv');
  await page.goto('/workflow'); await expect(page.getByRole('heading', { name: 'One brief. Six brilliant agents.' })).toBeVisible();
  await page.screenshot({ path: 'screenshots/workflow.png', fullPage: true });
  await page.goto('/evaluation'); await expect(page.getByRole('heading', { name: 'Quality is part of the story.' })).toBeVisible();
  await page.screenshot({ path: 'screenshots/evaluation.png', fullPage: true });
  expect(errors).toEqual([]);
});

test('create a project, run all agents, inspect results, persist and export', async ({ page }) => {
  await page.goto('/'); await page.getByRole('button', { name: 'New project' }).click();
  await page.getByLabel('Story title').fill('The Unsent Letter');
  await page.getByLabel('Genre', { exact: true }).selectOption('Second Chance Romance');
  await page.getByLabel('Length', { exact: true }).selectOption('10');
  await page.getByLabel('The story spark').fill('Two former lovers discover an unsent letter while saving the bookstore where they first met.');
  await page.getByRole('button', { name: 'Create project' }).click();
  await expect(page).toHaveURL(/workflow/);
  await page.getByRole('button', { name: 'Run workflow', exact: true }).click();
  await expect(page.getByLabel('Select project')).toBeDisabled();
  await expect(page.getByText('Workflow complete', { exact: true })).toBeVisible({ timeout: 15000 });
  await page.locator('.agent-node').filter({ hasText: 'Story Planning' }).click();
  await page.getByRole('tab', { name: 'Output', exact: true }).click();
  await expect(page.locator('.json-output')).toContainText('Nora');
  const downloadPromise = page.waitForEvent('download'); await page.getByRole('button', { name: 'Export JSON' }).click();
  expect((await downloadPromise).suggestedFilename()).toContain('workflow.json');
  await page.reload();
  await expect(page.getByLabel('Select project')).toHaveValue(/.+/);
  await expect(page.locator('.history-row').first()).toContainText('The Unsent Letter');
  await page.getByRole('link', { name: 'Dashboard', exact: true }).click();
  await expect(page.locator('.metric-value').first()).toContainText('258');
});

test('cancel a run without generating episodes and retry successfully', async ({ page }) => {
  await page.goto('/workflow');
  await page.getByRole('button', { name: 'Run workflow', exact: true }).click();
  await page.getByRole('button', { name: 'Cancel run', exact: true }).click();
  await expect(page.locator('.history-row').first()).toContainText('Cancelled');
  await expect(page.getByLabel('Select project')).toBeEnabled();
  await page.getByRole('button', { name: 'Run workflow', exact: true }).click();
  await expect(page.getByText('Workflow complete', { exact: true })).toBeVisible({ timeout: 15000 });
  await expect(page.locator('.history-row').first()).toContainText('Completed');
});

test('bad case optimization, regeneration evidence and prompt feedback persist', async ({ page }) => {
  await page.goto('/evaluation');
  await page.locator('.finding-row').filter({ hasText: 'Character drift' }).click();
  await page.getByLabel('AFTER · V2').fill('Preserve every established fact in the Story Bible. Clara led the meeting in episode 3.');
  await page.getByRole('button', { name: 'Apply prompt optimization' }).click();
  await page.getByRole('button', { name: 'Re-evaluate', exact: true }).click();
  await expect(page.getByText('Improvement verified in mock re-evaluation')).toBeVisible();
  await expect(page.locator('.verification-card')).toContainText('7.2 → 9.0');
  await page.getByRole('button', { name: 'Close', exact: true }).click();
  await page.getByLabel('Filter findings').selectOption('Resolved');
  await expect(page.locator('.finding-row')).toHaveCount(1);
  await page.reload(); await expect(page.locator('.finding-row').filter({ hasText: 'Character drift' })).toContainText('Resolved');
  await page.goto('/workflow'); await page.locator('.agent-node').filter({ hasText: 'Story Planning' }).click();
  await page.getByRole('tab', { name: 'Prompt', exact: true }).click();
  await expect(page.locator('.prompt-text')).toContainText('Clara led the meeting');
});

test('mobile navigation, responsive canvas, dialogs and every route render', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of ['/', '/workflow', '/evaluation', '/stories', '/analytics']) {
    await page.goto(path); await expect(page.locator('h1')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await page.getByRole('link', { name: /Evaluation Center/ }).click();
  await expect(page).toHaveURL(/evaluation/);
  await page.locator('.finding-row').first().click(); await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape'); await expect(page.getByRole('dialog')).not.toBeVisible();
  await page.goto('/'); await page.screenshot({ path: 'screenshots/dashboard-mobile.png', fullPage: true });
});

test('unknown routes and malformed browser storage recover without a crash', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.setItem('listenpal-studio-v1', '{"projects":[{}]}'));
  await page.reload(); await expect(page.locator('.metric-value').first()).toContainText('248');
  await page.goto('/not-a-page'); await expect(page.getByRole('heading', { name: 'This chapter hasn’t been written.' })).toBeVisible();
  await page.getByRole('link', { name: 'Back to Dashboard' }).click(); await expect(page).toHaveURL('/');
});
