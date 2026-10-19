import { expect, test } from '@playwright/test';
import { PROGRESS_KEY } from '../src/state/progress';

async function tapWorld(page: import('@playwright/test').Page, x: number, y: number) {
  const canvas = page.locator('canvas');
  const bounds = await canvas.boundingBox();
  if (!bounds) throw new Error('Canvas has no bounds');
  await canvas.click({position:{x:x*bounds.width/390,y:y*bounds.height/620}});
}

test('has distinct identity, character choice, and isolated storage', async ({page}) => {
  await page.goto('/');
  await expect(page.locator('.logo')).toContainText('MITZVAH');
  await page.getByRole('button', {name:/MY HERO/}).click();
  await page.getByRole('button', {name:/Girl adventurer/}).click();
  await expect(page.getByRole('button', {name:/Girl adventurer/})).toHaveClass(/selected/);
  await page.reload();
  await page.getByRole('button', {name:/MY HERO/}).click();
  await expect(page.getByRole('button', {name:/Girl adventurer/})).toHaveClass(/selected/);
  expect(await page.evaluate((key) => localStorage.getItem(key), PROGRESS_KEY)).toContain('girl');
  expect(await page.evaluate(() => localStorage.getItem('sticker-chaos-progress'))).toBeNull();
});

test('transfers MAGNETIC and completes the pushka mission', async ({page}) => {
  await page.goto('/');
  await page.getByRole('button', {name:/PLAY/}).first().click();
  await page.getByRole('button', {name:/Level 1: The Runaway Pushka/}).click();
  await expect(page.locator('canvas')).toBeVisible();
  await tapWorld(page, 86, 229);
  await tapWorld(page, 193, 495);
  await expect(page.getByText('1/1 switches')).toBeVisible();
  await page.getByRole('button', {name:'Pause'}).click();
  await page.getByRole('button', {name:'SETTINGS', exact:true}).click();
  await page.getByRole('button', {name:'Tap to move'}).click();
  await page.getByRole('button', {name:'BACK TO PAUSE'}).click();
  await page.getByRole('button', {name:'RESUME'}).click();
  for (const [index, [x,y]] of [[65,417],[313,389],[199,206]].entries()) {
    await tapWorld(page, x, y);
    await expect.poll(async () => Number((await page.locator('.mission-strip').innerText()).match(/Bag: (\d+)/)?.[1] ?? 0), {timeout:12000}).toBeGreaterThanOrEqual(index + 1);
  }
  await tapWorld(page, 260, 493);
  await expect(page.getByRole('button', {name:'DEPOSIT COINS'})).toBeEnabled({timeout:12000});
  await page.getByRole('button', {name:'DEPOSIT COINS'}).click();
  await expect(page.locator('.mission-strip')).toContainText('Pushka: 3/3');
  await tapWorld(page, 66, 536);
  await expect(page.getByText('🎁 ✓')).toBeVisible({timeout:12000});
  await tapWorld(page, 195, 70);
  await expect(page.getByRole('heading', {name:'Mitzvah accomplished!'})).toBeVisible({timeout:12000});
});
