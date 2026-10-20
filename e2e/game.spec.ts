import { expect, test } from '@playwright/test';
import { DEFAULT_PROGRESS, PROGRESS_KEY } from '../src/state/progress';

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
  test.setTimeout(90000);
  await page.addInitScript(({key, progress}) => {
    localStorage.setItem(key, JSON.stringify(progress));
  }, {key:PROGRESS_KEY, progress:{...DEFAULT_PROGRESS, settings:{...DEFAULT_PROGRESS.settings, controlMode:'tap'}}});
  await page.goto('/');
  await page.getByRole('button', {name:/PLAY/}).first().click();
  await page.getByRole('button', {name:/Level 1: The Runaway Pushka/}).click();
  await expect(page.locator('canvas')).toBeVisible();
  await tapWorld(page, 86, 229);
  await tapWorld(page, 193, 495);
  await expect(page.getByText('1/1 switches')).toBeVisible();
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

test('unlocks Challahzilla and completes the tablecloth delivery', async ({page}) => {
  test.setTimeout(90000);
  await page.addInitScript(({key, progress}) => {
    localStorage.setItem(key, JSON.stringify(progress));
  }, {key:PROGRESS_KEY, progress:{...DEFAULT_PROGRESS, completedLevels:[1], settings:{...DEFAULT_PROGRESS.settings, controlMode:'tap'}}});
  await page.goto('/');
  await page.getByRole('button', {name:/PLAY/}).first().click();
  await page.getByRole('button', {name:/Level 2: Challahzilla!/}).click();
  await expect(page.locator('canvas')).toBeVisible();
  await tapWorld(page, 86, 246);
  await page.getByRole('button', {name:/BIG/}).click();
  await tapWorld(page, 294, 246);
  await expect(page.getByText('1/1 switches')).toBeVisible();
  await tapWorld(page, 66, 415);
  await expect(page.locator('.mission-strip')).toContainText('Bag: 1', {timeout:12000});
  await tapWorld(page, 260, 494);
  await expect(page.getByRole('button', {name:'DELIVER ITEM'})).toBeEnabled({timeout:12000});
  await page.getByRole('button', {name:'DELIVER ITEM'}).click();
  await expect(page.locator('.mission-strip')).toContainText('Delivered: 1/1');
  await tapWorld(page, 67, 542);
  await expect(page.getByText('🎁 ✓')).toBeVisible({timeout:12000});
  await tapWorld(page, 195, 70);
  await expect(page.getByRole('heading', {name:'Mitzvah accomplished!'})).toBeVisible({timeout:12000});
  await expect(page.getByRole('button', {name:/NEXT LEVEL/})).toBeVisible();
});

test('uses FAST to deliver a package through the street maze', async ({page}) => {
  test.setTimeout(90000);
  await page.addInitScript(({key, progress}) => {
    localStorage.setItem(key, JSON.stringify(progress));
  }, {key:PROGRESS_KEY, progress:{...DEFAULT_PROGRESS, completedLevels:[1,2], settings:{...DEFAULT_PROGRESS.settings, controlMode:'tap'}}});
  await page.goto('/');
  await page.getByRole('button', {name:/PLAY/}).first().click();
  await page.getByRole('button', {name:/Level 3: The Speedy Shliach/}).click();
  await expect(page.locator('canvas')).toBeVisible();
  await tapWorld(page, 82, 500);
  await page.getByRole('button', {name:/FAST/}).click();
  await tapWorld(page, 195, 500);
  await expect(page.getByText('1/1 switches')).toBeVisible();
  await tapWorld(page, 319, 437);
  await expect(page.locator('.mission-strip')).toContainText('Bag: 1', {timeout:12000});
  await tapWorld(page, 260, 178);
  await expect(page.getByRole('button', {name:'DELIVER ITEM'})).toBeEnabled({timeout:20000});
  await page.getByRole('button', {name:'DELIVER ITEM'}).click();
  await expect(page.locator('.mission-strip')).toContainText('Delivered: 1/1');
  await tapWorld(page, 322, 541);
  await expect(page.getByText('🎁 ✓')).toBeVisible({timeout:20000});
  await tapWorld(page, 195, 70);
  await expect(page.getByRole('heading', {name:'Mitzvah accomplished!'})).toBeVisible({timeout:20000});
});

test('clears Kingston Avenue and helps both neighbors', async ({page}) => {
  test.setTimeout(90000);
  await page.addInitScript(({key, progress}) => {
    localStorage.setItem(key, JSON.stringify(progress));
  }, {key:PROGRESS_KEY, progress:{...DEFAULT_PROGRESS, completedLevels:[1,2,3], settings:{...DEFAULT_PROGRESS.settings, controlMode:'tap'}}});
  await page.goto('/');
  await page.getByRole('button', {name:/PLAY/}).first().click();
  await page.getByRole('button', {name:/Level 4: Kingston Avenue Mix-Up/}).click();
  await expect(page.locator('canvas')).toBeVisible();
  await tapWorld(page, 75, 487);
  await page.getByRole('button', {name:/TINY/}).click();
  await tapWorld(page, 126, 288);
  await expect(page.getByText('1/2 switches')).toBeVisible();
  await tapWorld(page, 317, 486);
  await page.getByRole('button', {name:/HEAVY/}).click();
  await tapWorld(page, 263, 288);
  await expect(page.getByText('2/2 switches')).toBeVisible();
  await tapWorld(page, 116, 333);
  await expect(page.getByRole('button', {name:'HELP NEIGHBOR'})).toBeEnabled({timeout:20000});
  await page.getByRole('button', {name:'HELP NEIGHBOR'}).click();
  await expect(page.locator('.mission-strip')).toContainText('Neighbors helped: 1/2');
  await tapWorld(page, 276, 139);
  await expect(page.getByRole('button', {name:'HELP NEIGHBOR'})).toBeEnabled({timeout:20000});
  await page.getByRole('button', {name:'HELP NEIGHBOR'}).click();
  await expect(page.locator('.mission-strip')).toContainText('Neighbors helped: 2/2');
  await tapWorld(page, 66, 548);
  await expect(page.getByText('🎁 ✓')).toBeVisible({timeout:20000});
  await tapWorld(page, 195, 70);
  await expect(page.getByRole('heading', {name:'Mitzvah accomplished!'})).toBeVisible({timeout:20000});
});
