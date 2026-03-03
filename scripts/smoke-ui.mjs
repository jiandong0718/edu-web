import net from 'node:net';
import { spawn } from 'node:child_process';
import { chromium } from '@playwright/test';

const baseURL = process.env.BASE_URL || 'http://127.0.0.1:4173';
const autoStartPreview = process.env.SMOKE_AUTO_START !== '0';

const routes = [
  '/dashboard',
  '/system/user',
  '/system/role',
  '/system/menu',
  '/system/campus',
  '/system/dict',
  '/system/classroom',
  '/system/config',
  '/system/holiday',
  '/system/login-log',
  '/system/operation-log',
  '/notification/message',
  '/student/list',
  '/student/tag',
  '/student/import',
  '/teaching/course',
  '/teaching/course-category',
  '/teaching/course-package',
  '/teaching/teacher',
  '/teaching/class',
  '/teaching/schedule',
  '/teaching/attendance',
  '/finance/contract',
  '/finance/payment',
  '/finance/consumption',
  '/finance/refund',
  '/finance/class-hour/adjust',
  '/marketing/lead',
  '/marketing/lead-import',
  '/marketing/lead-assign',
  '/marketing/follow',
  '/marketing/trial',
  '/marketing/funnel',
  '/marketing/consultant-ranking',
];

const report = {
  pageErrors: [],
  consoleErrors: [],
  crashedRoutes: [],
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const canConnect = (host, port, timeoutMs = 500) =>
  new Promise((resolve) => {
    const socket = new net.Socket();

    socket.setTimeout(timeoutMs);

    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });

    const onError = () => {
      socket.destroy();
      resolve(false);
    };

    socket.once('error', onError);
    socket.once('timeout', onError);

    socket.connect(port, host);
  });

const waitForPort = async (host, port, timeoutMs = 30000) => {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    // eslint-disable-next-line no-await-in-loop
    const ok = await canConnect(host, port);
    if (ok) return true;
    // eslint-disable-next-line no-await-in-loop
    await sleep(300);
  }
  return false;
};

const shutdownProcess = async (child) => {
  if (!child || child.exitCode !== null) {
    return;
  }

  child.kill('SIGTERM');

  for (let i = 0; i < 10; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    await sleep(150);
    if (child.exitCode !== null) return;
  }

  child.kill('SIGKILL');
};

const parsed = new URL(baseURL);
const host = parsed.hostname;
const port = Number(parsed.port || (parsed.protocol === 'https:' ? 443 : 80));

let previewProcess = null;

try {
  const serverReady = await canConnect(host, port);

  if (!serverReady && autoStartPreview) {
    previewProcess = spawn(
      'npm',
      ['run', 'preview', '--', '--host', host, '--port', String(port)],
      {
        env: process.env,
        stdio: 'ignore',
      }
    );

    const ready = await waitForPort(host, port, 30000);
    if (!ready) {
      throw new Error(`Failed to start preview server at ${baseURL} within 30s.`);
    }
  }

  if (!(await canConnect(host, port))) {
    throw new Error(
      `Cannot connect to ${baseURL}. Start preview first or keep SMOKE_AUTO_START enabled.`
    );
  }

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });

  page.on('pageerror', (error) => {
    report.pageErrors.push(error.message);
  });

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      report.consoleErrors.push(msg.text());
    }
  });

  await page.goto(`${baseURL}/`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(1200);

  for (const route of routes) {
    try {
      await page.goto(`${baseURL}${route}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(900);

      if (route === '/student/list') {
        const openBtn = page.getByRole('button', { name: '新增学生' });
        if (await openBtn.isVisible().catch(() => false)) {
          await openBtn.click();
          await page.waitForTimeout(400);
          const modal = page.getByRole('dialog');
          if (await modal.isVisible().catch(() => false)) {
            await page.getByRole('button', { name: '取 消' }).first().click().catch(() => {});
          }
        }
      }
    } catch (error) {
      report.crashedRoutes.push(`${route}: ${error.message}`);
    }
  }

  await browser.close();

  const uniquePageErrors = [...new Set(report.pageErrors)];
  const uniqueConsoleErrors = [...new Set(report.consoleErrors)];

  console.log(
    JSON.stringify(
      {
        scannedRoutes: routes.length,
        crashedRouteCount: report.crashedRoutes.length,
        pageErrorCount: uniquePageErrors.length,
        consoleErrorCount: uniqueConsoleErrors.length,
        crashedRoutes: report.crashedRoutes,
        pageErrors: uniquePageErrors,
        consoleErrors: uniqueConsoleErrors,
      },
      null,
      2
    )
  );

  if (report.crashedRoutes.length > 0 || uniquePageErrors.length > 0) {
    process.exit(1);
  }
} finally {
  await shutdownProcess(previewProcess);
}
