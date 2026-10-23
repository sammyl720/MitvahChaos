import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { chromium } from '@playwright/test';

const port = await new Promise((resolve, reject) => {
  const server = createServer();
  server.once('error', reject);
  server.listen(0, '127.0.0.1', () => {
    const address = server.address();
    server.close(() => resolve(address.port));
  });
});
const url = `http://127.0.0.1:${port}/`;
const preview = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--host', '127.0.0.1', '--port', String(port), '--strictPort'], { stdio: 'ignore' });
let browser;
try {
  let available = false;
  for (let attempt = 0; attempt < 80; attempt++) {
    if (preview.exitCode !== null) throw new Error('Preview server exited before it was ready');
    try { const response = await fetch(url); if (response.ok) { available = true; break; } } catch { /* wait for the server */ }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  if (!available) throw new Error('Preview server did not become ready');
  browser = await chromium.launch();
  const context = await browser.newContext({ serviceWorkers: 'allow' });
  const page = await context.newPage();
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload({ waitUntil: 'networkidle' });
  if (!await page.evaluate(() => Boolean(navigator.serviceWorker.controller))) throw new Error('The service worker did not take control');
  await context.setOffline(true);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: /PLAY/ }).first().click();
  await page.getByRole('button', { name: /Level 1: The Runaway Pushka/ }).click();
  await page.locator('canvas').waitFor({ state: 'visible' });
  console.log('Offline reload and Level 1 launch passed');
} finally {
  await browser?.close();
  preview.kill('SIGTERM');
}
