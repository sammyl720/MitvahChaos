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

test('keeps the mission hint outside the playfield', async ({page}) => {
  await page.goto('/');
  await page.getByRole('button', {name:/PLAY/}).first().click();
  await page.getByRole('button', {name:/Level 1: The Runaway Pushka/}).click();
  const hint = page.locator('.stage-hint');
  const stage = page.locator('.stage-shell');
  await expect(page.locator('canvas')).toBeVisible();
  await expect(hint).toContainText('MAGNETIC');
  const hintBox = await hint.boundingBox();
  const stageBox = await stage.boundingBox();
  expect(hintBox).not.toBeNull();
  expect(stageBox).not.toBeNull();
  expect(hintBox!.y + hintBox!.height).toBeLessThanOrEqual(stageBox!.y + 1);
  await tapWorld(page, 86, 280);
  await expect(hint).toContainText('selected');
  const updatedStageBox = await stage.boundingBox();
  expect(updatedStageBox).not.toBeNull();
  expect(Math.abs(updatedStageBox!.y - stageBox!.y)).toBeLessThanOrEqual(1);
  expect(Math.abs(updatedStageBox!.height - stageBox!.height)).toBeLessThanOrEqual(1);
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

test('tames the challah avalanche and prepares the bakery table', async ({page}) => {
  test.setTimeout(90000);
  await page.addInitScript(({key, progress}) => {
    localStorage.setItem(key, JSON.stringify(progress));
  }, {key:PROGRESS_KEY, progress:{...DEFAULT_PROGRESS, completedLevels:[1,2,3,4], settings:{...DEFAULT_PROGRESS.settings, controlMode:'tap'}}});
  await page.goto('/');
  await page.getByRole('button', {name:/PLAY/}).first().click();
  await page.getByRole('button', {name:/Level 5: The Great Challah Avalanche/}).click();
  await expect(page.locator('canvas')).toBeVisible();
  await tapWorld(page, 78, 312);
  await page.getByRole('button', {name:/BIG/}).click();
  await tapWorld(page, 300, 312);
  await expect(page.getByText('1/3 switches')).toBeVisible();
  await tapWorld(page, 74, 478);
  await page.getByRole('button', {name:/BOUNCY/}).click();
  await tapWorld(page, 78, 312);
  await expect(page.getByText('2/3 switches')).toBeVisible();
  await tapWorld(page, 315, 478);
  await page.getByRole('button', {name:/HEAVY/}).click();
  await tapWorld(page, 195, 240);
  await expect(page.getByText('3/3 switches')).toBeVisible();
  await tapWorld(page, 65, 221);
  await expect(page.locator('.mission-strip')).toContainText('Bag: 1', {timeout:20000});
  await tapWorld(page, 257, 218);
  await expect(page.locator('.mission-strip')).toContainText('Bag: 2', {timeout:20000});
  await tapWorld(page, 270, 229);
  await expect(page.getByRole('button', {name:'DELIVER ITEM'})).toBeEnabled({timeout:20000});
  await page.getByRole('button', {name:'DELIVER ITEM'}).click();
  await expect(page.locator('.mission-strip')).toContainText('Delivered: 2/2');
  await tapWorld(page, 66, 548);
  await expect(page.getByText('🎁 ✓')).toBeVisible({timeout:20000});
  await tapWorld(page, 195, 70);
  await expect(page.getByRole('heading', {name:'Mitzvah accomplished!'})).toBeVisible({timeout:20000});
});

test('slides the heavy wagon into the catch switch and delivers flour', async ({page}) => {
  test.setTimeout(90000);
  await page.addInitScript(({key, progress}) => {
    localStorage.setItem(key, JSON.stringify(progress));
  }, {key:PROGRESS_KEY, progress:{...DEFAULT_PROGRESS, completedLevels:[1,2,3,4,5], settings:{...DEFAULT_PROGRESS.settings, controlMode:'tap'}}});
  await page.goto('/');
  await page.getByRole('button', {name:/PLAY/}).first().click();
  await page.getByRole('button', {name:/Level 6: The Runaway Wagon/}).click();
  await expect(page.locator('canvas')).toBeVisible();
  await tapWorld(page, 315, 495);
  await page.getByRole('button', {name:/HEAVY/}).click();
  await tapWorld(page, 122, 302);
  await expect(page.getByText('1/2 switches')).toBeVisible();
  await tapWorld(page, 76, 495);
  await page.getByRole('button', {name:/SLIPPERY/}).click();
  await tapWorld(page, 122, 302);
  await expect(page.getByText('2/2 switches')).toBeVisible({timeout:12000});
  await tapWorld(page, 65, 206);
  await expect(page.locator('.mission-strip')).toContainText('Bag: 1', {timeout:20000});
  await tapWorld(page, 260, 205);
  await expect(page.locator('.mission-strip')).toContainText('Bag: 2', {timeout:20000});
  await tapWorld(page, 267, 207);
  await expect(page.getByRole('button', {name:'DELIVER ITEM'})).toBeEnabled({timeout:12000});
  await page.getByRole('button', {name:'DELIVER ITEM'}).click();
  await expect(page.locator('.mission-strip')).toContainText('Delivered: 2/2');
  await tapWorld(page, 66, 547);
  await expect(page.getByText('🎁 ✓')).toBeVisible({timeout:20000});
  await tapWorld(page, 195, 70);
  await expect(page.getByRole('heading', {name:'Mitzvah accomplished!'})).toBeVisible({timeout:20000});
});

test('clears the kitchen and carries soup supplies around the spill', async ({page}) => {
  test.setTimeout(90000);
  await page.addInitScript(({key, progress}) => {
    localStorage.setItem(key, JSON.stringify(progress));
  }, {key:PROGRESS_KEY, progress:{...DEFAULT_PROGRESS, completedLevels:[1,2,3,4,5,6], settings:{...DEFAULT_PROGRESS.settings, controlMode:'tap'}}});
  await page.goto('/');
  await page.getByRole('button', {name:/PLAY/}).first().click();
  await page.getByRole('button', {name:/Level 7: Chicken Soup Catastrophe/}).click();
  await expect(page.locator('canvas')).toBeVisible();
  await tapWorld(page, 73, 496);
  await page.getByRole('button', {name:/TINY/}).click();
  await tapWorld(page, 118, 308);
  await expect(page.getByText('1/2 switches')).toBeVisible();
  await tapWorld(page, 312, 483);
  await page.getByRole('button', {name:/HEAVY/}).click();
  await tapWorld(page, 278, 309);
  await expect(page.getByText('2/2 switches')).toBeVisible();
  await tapWorld(page, 68, 464);
  await expect(page.locator('.mission-strip')).toContainText('Bag: 1', {timeout:20000});
  await tapWorld(page, 162, 380);
  await expect(page.locator('.mission-strip')).toContainText('Bag: 0', {timeout:20000});
  await tapWorld(page, 68, 464);
  await expect(page.locator('.mission-strip')).toContainText('Bag: 1', {timeout:20000});
  await tapWorld(page, 316, 425);
  await expect(page.locator('.mission-strip')).toContainText('Bag: 2', {timeout:20000});
  await tapWorld(page, 314, 260);
  await expect(page.getByRole('button', {name:'DELIVER ITEM'})).toBeEnabled({timeout:20000});
  await page.getByRole('button', {name:'DELIVER ITEM'}).click();
  await expect(page.locator('.mission-strip')).toContainText('Delivered: 2/2');
  await tapWorld(page, 66, 546);
  await expect(page.getByText('🎁 ✓')).toBeVisible({timeout:20000});
  await tapWorld(page, 195, 70);
  await expect(page.getByRole('heading', {name:'Mitzvah accomplished!'})).toBeVisible({timeout:20000});
});

test('shrinks through the little passage and helps Tova restart the model', async ({page}) => {
  test.setTimeout(90000);
  await page.addInitScript(({key, progress}) => {
    localStorage.setItem(key, JSON.stringify(progress));
  }, {key:PROGRESS_KEY, progress:{...DEFAULT_PROGRESS, completedLevels:[1,2,3,4,5,6,7], settings:{...DEFAULT_PROGRESS.settings, controlMode:'tap'}}});
  await page.goto('/');
  await page.getByRole('button', {name:/PLAY/}).first().click();
  await page.getByRole('button', {name:/Level 8: The Tiny Shtetl/}).click();
  await expect(page.locator('canvas')).toBeVisible();
  await tapWorld(page, 73, 492);
  await page.getByRole('button', {name:/TINY/}).click();
  await tapWorld(page, 195, 510);
  await tapWorld(page, 195, 320);
  await expect(page.getByText('1/2 switches')).toBeVisible({timeout:20000});
  await tapWorld(page, 315, 492);
  await page.getByRole('button', {name:/MAGNETIC/}).click();
  await tapWorld(page, 195, 232);
  await expect(page.getByText('2/2 switches')).toBeVisible();
  await tapWorld(page, 266, 215);
  await expect(page.getByRole('button', {name:'HELP NEIGHBOR'})).toBeEnabled({timeout:20000});
  await page.getByRole('button', {name:'HELP NEIGHBOR'}).click();
  await expect(page.locator('.mission-strip')).toContainText('Neighbors helped: 1/1');
  await tapWorld(page, 66, 547);
  await expect(page.getByText('🎁 ✓')).toBeVisible({timeout:20000});
  await tapWorld(page, 195, 70);
  await expect(page.getByRole('heading', {name:'Mitzvah accomplished!'})).toBeVisible({timeout:20000});
});

test('floats the supply raft and carries parcels across the stream', async ({page}) => {
  test.setTimeout(90000);
  await page.addInitScript(({key, progress}) => {
    localStorage.setItem(key, JSON.stringify(progress));
  }, {key:PROGRESS_KEY, progress:{...DEFAULT_PROGRESS, completedLevels:[1,2,3,4,5,6,7,8], settings:{...DEFAULT_PROGRESS.settings, controlMode:'tap'}}});
  await page.goto('/');
  await page.getByRole('button', {name:/PLAY/}).first().click();
  await page.getByRole('button', {name:/Level 9: The Floating Bridge/}).click();
  await expect(page.locator('canvas')).toBeVisible();
  await tapWorld(page, 72, 500);
  await page.getByRole('button', {name:/FLOATING/}).click();
  await tapWorld(page, 195, 445);
  await expect(page.getByText('1/2 switches')).toBeVisible();
  await tapWorld(page, 316, 500);
  await page.getByRole('button', {name:/FLOATING/}).click();
  await tapWorld(page, 195, 519);
  await tapWorld(page, 195, 270);
  await expect(page.getByText('2/2 switches')).toBeVisible({timeout:20000});
  await tapWorld(page, 65, 445);
  await expect(page.locator('.mission-strip')).toContainText('Bag: 1', {timeout:20000});
  await tapWorld(page, 318, 443);
  await expect(page.locator('.mission-strip')).toContainText('Bag: 2', {timeout:20000});
  await tapWorld(page, 265, 212);
  await expect(page.getByRole('button', {name:'DELIVER ITEM'})).toBeEnabled({timeout:20000});
  await page.getByRole('button', {name:'DELIVER ITEM'}).click();
  await expect(page.locator('.mission-strip')).toContainText('Delivered: 2/2');
  await tapWorld(page, 66, 550);
  await expect(page.getByText('🎁 ✓')).toBeVisible({timeout:20000});
  await tapWorld(page, 195, 70);
  await expect(page.getByRole('heading', {name:'Mitzvah accomplished!'})).toBeVisible({timeout:20000});
});
