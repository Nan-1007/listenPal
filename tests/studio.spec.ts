import { expect, test } from '@playwright/test';

test('中文总览：周期、中文搜索、状态筛选与报告导出', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: '项目总览', exact: true })).toBeVisible();
  await expect(page.locator('.metric-value').first()).toContainText('248');
  await page.screenshot({ path: 'screenshots/dashboard.png', fullPage: true });
  await page.getByLabel('统计周期').selectOption('7');
  await expect(page.locator('.metric-value').first()).toContainText('140');
  await page.getByLabel('搜索项目').fill('丝绒');
  await expect(page.locator('tbody tr')).toHaveCount(1);
  await page.getByLabel('筛选项目状态').selectOption('Needs review');
  await expect(page.getByText('没有找到相关项目')).toBeVisible();
  const downloadPromise = page.waitForEvent('download'); await page.getByRole('button', { name: '导出报告', exact: true }).click();
  expect((await downloadPromise).suggestedFilename()).toBe('listenpal-project-report.csv');
  await page.goto('/workflow'); await expect(page.getByRole('heading', { name: 'Agent 工作流', exact: true })).toBeVisible();
  await expect(page.locator('.agent-node')).toHaveCount(6);
  await expect(page.getByRole('heading', { name: '如何判断完成？' })).toBeVisible();
  await expect(page.locator('.json-output')).not.toBeVisible();
  await page.screenshot({ path: 'screenshots/workflow.png', fullPage: true });
  await page.goto('/evaluation'); await expect(page.getByRole('heading', { name: '质量评测', exact: true })).toBeVisible();
  await page.screenshot({ path: 'screenshots/evaluation.png', fullPage: true });
  expect(errors).toEqual([]);
});

test('创建中文项目、运行 Agent、查看可读结果、持久化与导出', async ({ page }) => {
  await page.goto('/workflow'); await page.getByRole('button', { name: '新建项目', exact: true }).click();
  await page.getByLabel('项目名称').fill('未寄出的信');
  await page.getByLabel('内容题材', { exact: true }).selectOption('Second Chance Romance');
  await expect(page.getByLabel('剧集长度')).toHaveValue('10');
  await page.getByLabel('故事需求').fill('曾经相爱的两个人在拯救海边书店时发现了一封未寄出的信，必须共同面对当年错过的真相。');
  await page.getByRole('button', { name: '创建项目', exact: true }).click();
  await expect(page).toHaveURL(/workflow/);
  await page.getByRole('button', { name: '运行工作流', exact: true }).click();
  await expect(page.getByLabel('选择项目')).toBeDisabled();
  await expect(page.locator('.workflow-status')).toContainText('工作流已完成', { timeout: 15000 });
  await expect(page.getByRole('link', { name: '查看质量评测', exact: true })).toBeVisible();
  await page.locator('.agent-node').filter({ hasText: '故事规划' }).click();
  await expect(page.locator('.planning-characters')).toContainText('Nora');
  await expect(page.getByRole('heading', { name: '章节规划' })).toBeVisible();
  await page.getByText('查看全部 10 集大纲', { exact: true }).click();
  await expect(page.locator('.outline-preview>div')).toHaveCount(10);
  await page.getByText('查看结构化数据', { exact: false }).click();
  await expect(page.locator('.json-output')).toContainText('Nora');
  const downloadPromise = page.waitForEvent('download'); await page.getByRole('button', { name: '导出结果', exact: true }).click();
  expect((await downloadPromise).suggestedFilename()).toContain('workflow.json');
  await page.reload();
  await page.locator('.history-disclosure>summary').click();
  await expect(page.locator('.history-row').first()).toContainText('未寄出的信');
  await page.getByRole('link', { name: '项目总览', exact: true }).click();
  await expect(page.locator('.metric-value').first()).toContainText('258');
});

test('取消流程不改写项目产量，且可以重新运行', async ({ page }) => {
  await page.goto('/workflow');
  await page.getByRole('button', { name: '运行工作流', exact: true }).click();
  await page.getByRole('button', { name: '取消运行', exact: true }).click();
  await page.locator('.history-disclosure>summary').click();
  await expect(page.locator('.history-row').first()).toContainText('已取消');
  await expect(page.getByLabel('选择项目')).toBeEnabled();
  await page.getByRole('button', { name: '运行工作流', exact: true }).click();
  await expect(page.locator('.workflow-status')).toContainText('工作流已完成', { timeout: 15000 });
  await expect(page.locator('.history-row').first()).toContainText('已完成');
});

test('问题证据、提示词优化、验证结果与反馈闭环', async ({ page }) => {
  await page.goto('/evaluation');
  await page.locator('.finding-row').filter({ hasText: '人物设定不一致' }).click();
  await expect(page.getByText('建议的优化方式', { exact: true })).toBeVisible();
  await page.getByText('编辑生成指令（英文）', { exact: true }).click();
  await page.getByLabel('优化后的提示词').fill('Preserve every established fact in the Story Bible. Clara led the meeting in episode 3.');
  await page.getByRole('button', { name: '应用优化方案', exact: true }).click();
  await page.getByRole('button', { name: '重新评测', exact: true }).click();
  await expect(page.getByText('模拟重新评测：改进已验证')).toBeVisible();
  await expect(page.locator('.verification-card')).toContainText('7.2 → 9.0');
  await page.getByRole('button', { name: '关闭', exact: true }).click();
  await page.getByLabel('筛选评测问题').selectOption('Resolved');
  await expect(page.locator('.finding-row')).toHaveCount(1);
  await page.reload(); await expect(page.locator('.finding-row').filter({ hasText: '人物设定不一致' })).toContainText('已验证');
  await page.goto('/workflow'); await page.locator('.agent-node').filter({ hasText: '故事规划' }).click();
  await page.getByRole('tab', { name: /提示词/ }).click();
  await expect(page.locator('.prompt-text')).toContainText('Clara led the meeting');
  await expect(page.getByText('v2 · 已优化', { exact: true })).toBeVisible();
});

test('手机导航、折叠工具、页面布局和弹窗保持易用', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of ['/', '/workflow', '/evaluation', '/stories', '/analytics']) {
    await page.goto(path); await expect(page.locator('h1')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await page.goto('/workflow'); await page.getByRole('button', { name: '打开导航', exact: true }).click();
  await expect(page.getByRole('link', { name: '故事创作', exact: true })).not.toBeVisible();
  await page.locator('.secondary-navigation>summary').click();
  await expect(page.getByRole('link', { name: '故事创作', exact: true })).toBeVisible();
  await page.getByRole('link', { name: /质量评测/ }).click();
  await expect(page).toHaveURL(/evaluation/);
  await page.locator('.finding-row').first().click(); await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape'); await expect(page.getByRole('dialog')).not.toBeVisible();
  await page.goto('/'); await page.screenshot({ path: 'screenshots/dashboard-mobile.png', fullPage: true });
  expect(errors).toEqual([]);
});

test('异常存储可恢复，未知路由提供中文返回入口', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.setItem('listenpal-studio-v1', '{"projects":[{}]}'));
  await page.reload(); await expect(page.locator('.metric-value').first()).toContainText('248');
  await page.goto('/not-a-page'); await expect(page.getByRole('heading', { name: '暂时没有这个页面' })).toBeVisible();
  await page.getByRole('link', { name: '返回项目总览', exact: true }).click(); await expect(page).toHaveURL('/');
});
