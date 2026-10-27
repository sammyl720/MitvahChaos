import { expect, test } from '@playwright/test';
import { DEFAULT_PROGRESS, PROGRESS_KEY } from '../src/state/progress';

async function tapWorld(page: import('@playwright/test').Page, x: number, y: number) {
  const canvas = page.locator('canvas');
  const bounds = await canvas.boundingBox();
  if (!bounds) throw new Error('Canvas has no bounds');
  await canvas.click({position:{x:x*bounds.width/390,y:y*bounds.height/620}});
}

async function tapWorldOnDevice(page: import('@playwright/test').Page, x: number, y: number) {
  const canvas = page.locator('canvas');
  const bounds = await canvas.boundingBox();
  if (!bounds) throw new Error('Canvas has no bounds');
  const position = {x:x*bounds.width/390,y:y*bounds.height/620};
  if (await page.evaluate(() => navigator.maxTouchPoints > 0)) await canvas.tap({position});
  else await canvas.click({position});
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

test('explains adventure words without crowding the sticker book on a small screen', async ({page}) => {
  await page.setViewportSize({width:320,height:568});
  await page.goto('/');
  await page.getByRole('button', {name:/STICKER BOOK/}).click();
  const guide = page.locator('.word-guide');
  await expect(guide).toBeVisible();
  await expect(guide).not.toHaveAttribute('open', '');
  await guide.locator('summary').click();
  await expect(guide).toHaveAttribute('open', '');
  await expect(guide.getByText('A small box for collecting money to give as tzedakah.')).toBeVisible();
  await expect(guide.getByText('A Purim gift of at least two ready-to-eat foods sent to a friend.')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
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
  await page.getByRole('button', {name:'Show mission instructions'}).click();
  await expect(hint).toContainText('Give yourself MAGNETIC');
  await page.getByRole('button', {name:'Show latest status'}).click();
  await expect(hint).toContainText('selected');
  const updatedStageBox = await stage.boundingBox();
  expect(updatedStageBox).not.toBeNull();
  expect(Math.abs(updatedStageBox!.y - stageBox!.y)).toBeLessThanOrEqual(1);
  expect(Math.abs(updatedStageBox!.height - stageBox!.height)).toBeLessThanOrEqual(1);
  const longHint = await hint.locator('.stage-hint-text').evaluate((element) => {
    element.textContent = 'Read this long mission instruction. '.repeat(20);
    const firstLetter = document.createRange();
    firstLetter.setStart(element.firstChild!, 0);
    firstLetter.setEnd(element.firstChild!, 1);
    return { firstLineTop:firstLetter.getBoundingClientRect().top, boxTop:element.getBoundingClientRect().top, scrollHeight:element.scrollHeight, clientHeight:element.clientHeight };
  });
  expect(longHint.scrollHeight).toBeGreaterThan(longHint.clientHeight);
  expect(longHint.firstLineTop).toBeGreaterThanOrEqual(longHint.boxTop - 1);
});

test('enlarges the playfield on a short screen and keeps sticker controls usable', async ({page}) => {
  test.setTimeout(90000);
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await page.setViewportSize({width:320,height:568});
  await page.goto('/');
  await page.getByRole('button', {name:/PLAY/}).first().click();
  await page.getByRole('button', {name:/Level 1: The Runaway Pushka/}).click();
  const canvas = page.locator('canvas');
  const stage = page.locator('.stage-shell');
  await expect(canvas).toBeVisible();
  const fittedWidth = (await canvas.boundingBox())!.width;
  await page.getByRole('button', {name:'Enlarge playfield'}).click();
  await expect(page.getByRole('button', {name:'Fit playfield'})).toBeVisible();
  await expect.poll(async () => (await canvas.boundingBox())?.width ?? 0).toBeGreaterThan(fittedWidth * 1.5);
  const hintBounds = await page.locator('.stage-hint').boundingBox();
  const stageBounds = await stage.boundingBox();
  expect(hintBounds!.y + hintBounds!.height).toBeLessThanOrEqual(stageBounds!.y + 1);
  await expect(page.locator('.game-bottom')).toBeInViewport();
  const bottom = await stage.evaluate((element) => ({scrollTop:element.scrollTop,scrollHeight:element.scrollHeight,clientHeight:element.clientHeight}));
  expect(bottom.scrollHeight).toBeGreaterThan(bottom.clientHeight + 100);
  expect(bottom.scrollTop).toBeGreaterThan(0);
  await page.getByRole('button', {name:'Move view up'}).click();
  await expect.poll(() => stage.evaluate((element) => element.scrollTop)).toBeLessThan(bottom.scrollTop - 100);
  await tapWorldOnDevice(page, 86, 280);
  await expect(page.locator('.sticker-tray')).toContainText('MAGNETIC');
  await page.getByRole('button', {name:/MAGNETIC/}).click();
  await page.getByRole('button', {name:'Move view down'}).click();
  await expect.poll(() => stage.evaluate((element) => element.scrollTop)).toBeGreaterThan(bottom.scrollTop - 10);
  await tapWorldOnDevice(page, 193, 495);
  await expect(page.getByText('1/1 switches')).toBeVisible();
  await page.getByRole('button', {name:'Fit playfield'}).click();
  await expect.poll(async () => (await canvas.boundingBox())?.width ?? 0).toBeLessThan(fittedWidth * 1.1);
  expect(pageErrors).toEqual([]);
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
  await expect(page.locator('.victory-story')).toContainText('Rivky: You found them! Every coin can help someone.');
  await expect(page.getByRole('button', {name:'NEXT LEVEL →'})).toBeVisible();
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
  await tapWorld(page, 116, 333);
  await expect(page.getByRole('button', {name:'HELP NEIGHBOR'})).toBeEnabled({timeout:20000});
  await page.getByRole('button', {name:'HELP NEIGHBOR'}).click();
  await expect(page.locator('.mission-strip')).toContainText('Helped: 1/2 · 📦 1/1');
  await expect(page.locator('.stage-hint')).toContainText('Take the bundle to MOSHE');
  await tapWorld(page, 317, 486);
  await page.getByRole('button', {name:/HEAVY/}).click();
  await tapWorld(page, 263, 288);
  await expect(page.getByText('2/2 switches')).toBeVisible();
  await tapWorld(page, 276, 139);
  await expect(page.getByRole('button', {name:'HELP NEIGHBOR'})).toBeEnabled({timeout:20000});
  await page.getByRole('button', {name:'HELP NEIGHBOR'}).click();
  await expect(page.locator('.mission-strip')).toContainText('Helped: 2/2 · 📦 0/1');
  await tapWorld(page, 66, 548);
  await expect(page.getByText('🎁 ✓')).toBeVisible({timeout:20000});
  await tapWorld(page, 195, 70);
  await expect(page.getByRole('heading', {name:'Mitzvah accomplished!'})).toBeVisible({timeout:20000});
  await expect(page.locator('.victory-story')).toContainText('Leah: The sidewalk is clear, and the supply bundle is ready for Moshe. Thank you!');
  await expect(page.locator('.victory-story')).toContainText('Moshe: Leah’s bundle reached the steady cart. Now we can bring everything inside!');
  await expect(page.getByRole('button', {name:'NEXT LEVEL →'})).toBeInViewport();
  await expect(page.getByRole('button', {name:'PLAY AGAIN'})).toBeInViewport();
  await page.getByRole('button', {name:'NEXT LEVEL →'}).click();
  await expect(page.locator('.game-title')).toContainText('The Great Challah Avalanche');
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
  await expect(page.getByRole('button', {name:'ADD INGREDIENT'})).toBeEnabled({timeout:20000});
  await page.getByRole('button', {name:'ADD INGREDIENT'}).click();
  await expect(page.locator('.mission-strip')).toContainText('In pot: 1/2');
  await expect(page.getByRole('button', {name:'ADD INGREDIENT'})).toBeEnabled();
  await page.getByRole('button', {name:'ADD INGREDIENT'}).click();
  await expect(page.locator('.mission-strip')).toContainText('In pot: 2/2');
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

test('rescues the wagon from mud and delivers its parcels', async ({page}) => {
  test.setTimeout(90000);
  await page.addInitScript(({key, progress}) => {
    localStorage.setItem(key, JSON.stringify(progress));
  }, {key:PROGRESS_KEY, progress:{...DEFAULT_PROGRESS, completedLevels:[1,2,3,4,5,6,7,8,9], settings:{...DEFAULT_PROGRESS.settings, controlMode:'tap'}}});
  await page.goto('/');
  await page.getByRole('button', {name:/PLAY/}).first().click();
  await page.getByRole('button', {name:/Level 10: The Great Wagon Rescue/}).click();
  await expect(page.locator('canvas')).toBeVisible();
  await tapWorld(page, 70, 510);
  await page.getByRole('button', {name:/FLOATING/}).click();
  await tapWorld(page, 73, 300);
  await expect(page.getByText('1/3 switches')).toBeVisible();
  await tapWorld(page, 315, 532);
  await page.getByRole('button', {name:/HEAVY/}).click();
  await tapWorld(page, 300, 470);
  await expect(page.getByText('2/3 switches')).toBeVisible();
  await tapWorld(page, 195, 452);
  await page.getByRole('button', {name:/SLIPPERY/}).click();
  await tapWorld(page, 73, 300);
  await expect(page.getByText('3/3 switches')).toBeVisible({timeout:20000});
  await tapWorld(page, 65, 436);
  await expect(page.locator('.mission-strip')).toContainText('Bag: 1', {timeout:20000});
  await tapWorld(page, 260, 440);
  await expect(page.locator('.mission-strip')).toContainText('Bag: 2', {timeout:20000});
  await tapWorld(page, 265, 209);
  await expect(page.getByRole('button', {name:'DELIVER ITEM'})).toBeEnabled({timeout:20000});
  await page.getByRole('button', {name:'DELIVER ITEM'}).click();
  await expect(page.locator('.mission-strip')).toContainText('Delivered: 2/2');
  await tapWorld(page, 65, 551);
  await expect(page.getByText('🎁 ✓')).toBeVisible({timeout:20000});
  await tapWorld(page, 195, 70);
  await expect(page.getByRole('heading', {name:'Mitzvah accomplished!'})).toBeVisible({timeout:20000});
});

test('guides the giant dreidel and decorates Chaya’s game table', async ({page}) => {
  test.setTimeout(90000);
  await page.addInitScript(({key, progress}) => {
    localStorage.setItem(key, JSON.stringify(progress));
  }, {key:PROGRESS_KEY, progress:{...DEFAULT_PROGRESS, completedLevels:[1,2,3,4,5,6,7,8,9,10], settings:{...DEFAULT_PROGRESS.settings, controlMode:'tap'}}});
  await page.goto('/');
  await page.getByRole('button', {name:/PLAY/}).first().click();
  await page.getByRole('button', {name:/Level 11: Dreidel Disaster/}).click();
  await expect(page.locator('canvas')).toBeVisible();
  await tapWorld(page, 72, 505);
  await page.getByRole('button', {name:/BOUNCY/}).click();
  await tapWorld(page, 80, 310);
  await expect(page.getByText('1/2 switches')).toBeVisible();
  await tapWorld(page, 315, 502);
  await page.getByRole('button', {name:/SLIPPERY/}).click();
  await tapWorld(page, 80, 310);
  await expect(page.getByText('2/2 switches')).toBeVisible({timeout:20000});
  await tapWorld(page, 79, 453);
  await expect(page.locator('.mission-strip')).toContainText('Bag: 1', {timeout:20000});
  await tapWorld(page, 303, 456);
  await expect(page.locator('.mission-strip')).toContainText('Bag: 2', {timeout:20000});
  await tapWorld(page, 260, 208);
  await expect(page.getByRole('button', {name:'HANG DECORATION'})).toBeEnabled({timeout:20000});
  await page.getByRole('button', {name:'HANG DECORATION'}).click();
  await expect(page.locator('.mission-strip')).toContainText('Bag: 1 · Hung: 1/2');
  await expect(page.locator('.stage-hint')).toContainText('Decoration 1/2 hung!');
  await page.getByRole('button', {name:'HANG DECORATION'}).click();
  await expect(page.locator('.mission-strip')).toContainText('Hung: 2/2');
  await tapWorld(page, 67, 550);
  await expect(page.getByText('🎁 ✓')).toBeVisible({timeout:20000});
  await tapWorld(page, 195, 70);
  await expect(page.getByRole('heading', {name:'Mitzvah accomplished!'})).toBeVisible({timeout:20000});
});

test('collects and assembles the Chanukah display pieces', async ({page}) => {
  test.setTimeout(90000);
  await page.addInitScript(({key, progress}) => {
    localStorage.setItem(key, JSON.stringify(progress));
  }, {key:PROGRESS_KEY, progress:{...DEFAULT_PROGRESS, completedLevels:[1,2,3,4,5,6,7,8,9,10,11], settings:{...DEFAULT_PROGRESS.settings, controlMode:'tap'}}});
  await page.goto('/');
  await page.getByRole('button', {name:/PLAY/}).first().click();
  await page.getByRole('button', {name:/Level 12: The Missing Menorah Pieces/}).click();
  await expect(page.locator('canvas')).toBeVisible();
  await tapWorld(page, 72, 510);
  await page.getByRole('button', {name:/TINY/}).click();
  await tapWorld(page, 195, 520);
  await expect(page.getByText('1/2 switches')).toBeVisible();
  await tapWorld(page, 315, 510);
  await page.getByRole('button', {name:/MAGNETIC/}).click();
  await tapWorld(page, 195, 520);
  await expect(page.getByText('2/2 switches')).toBeVisible();
  await tapWorld(page, 75, 455);
  await expect(page.locator('.mission-strip')).toContainText('Bag: 1', {timeout:20000});
  await tapWorld(page, 195, 252);
  await expect(page.locator('.mission-strip')).toContainText('Bag: 2', {timeout:20000});
  await tapWorld(page, 315, 275);
  await expect(page.locator('.mission-strip')).toContainText('Bag: 3', {timeout:20000});
  await tapWorld(page, 265, 205);
  await expect(page.getByRole('button', {name:'ASSEMBLE PIECE'})).toBeEnabled({timeout:20000});
  for (let count = 1; count <= 3; count++) {
    await page.getByRole('button', {name:'ASSEMBLE PIECE'}).click();
    await expect(page.locator('.mission-strip')).toContainText(`Assembled: ${count}/3`);
  }
  await tapWorld(page, 135, 550);
  await expect(page.getByText('🎁 ✓')).toBeVisible({timeout:20000});
  await tapWorld(page, 195, 70);
  await expect(page.getByRole('heading', {name:'Mitzvah accomplished!'})).toBeVisible({timeout:20000});
});

test('shares a Purim package with each neighbor', async ({page}) => {
  test.setTimeout(100000);
  await page.addInitScript(({key, progress}) => {
    localStorage.setItem(key, JSON.stringify(progress));
  }, {key:PROGRESS_KEY, progress:{...DEFAULT_PROGRESS, completedLevels:[1,2,3,4,5,6,7,8,9,10,11,12], settings:{...DEFAULT_PROGRESS.settings, controlMode:'tap'}}});
  await page.goto('/');
  await page.getByRole('button', {name:/PLAY/}).first().click();
  await page.getByRole('button', {name:/Level 13: Purim Delivery Dash/}).click();
  await expect(page.locator('canvas')).toBeVisible();
  await tapWorld(page, 70, 507);
  await page.getByRole('button', {name:/FAST/}).click();
  await tapWorld(page, 195, 520);
  await expect(page.getByText('1/2 switches')).toBeVisible();
  await tapWorld(page, 316, 507);
  await page.getByRole('button', {name:/SLIPPERY/}).click();
  await tapWorld(page, 80, 325);
  await expect(page.getByText('2/2 switches')).toBeVisible({timeout:20000});
  await tapWorld(page, 68, 458);
  await expect(page.locator('.mission-strip')).toContainText('Bag: 1', {timeout:20000});
  await tapWorld(page, 319, 458);
  await expect(page.locator('.mission-strip')).toContainText('Bag: 2', {timeout:20000});
  await tapWorld(page, 125, 226);
  await expect(page.getByRole('button', {name:'DELIVER GIFT'})).toBeEnabled({timeout:20000});
  await page.getByRole('button', {name:'DELIVER GIFT'}).click();
  await expect(page.locator('.mission-strip')).toContainText('Delivered: 1/2');
  await tapWorld(page, 266, 226);
  await expect(page.getByRole('button', {name:'DELIVER GIFT'})).toBeEnabled({timeout:20000});
  await page.getByRole('button', {name:'DELIVER GIFT'}).click();
  await expect(page.locator('.mission-strip')).toContainText('Delivered: 2/2');
  await tapWorld(page, 65, 551);
  await expect(page.getByText('🎁 ✓')).toBeVisible({timeout:20000});
  await tapWorld(page, 195, 70);
  await expect(page.getByRole('heading', {name:'Mitzvah accomplished!'})).toBeVisible({timeout:20000});
});

test('clears the Pesach workshop and brings table coverings', async ({page}) => {
  test.setTimeout(90000);
  await page.addInitScript(({key, progress}) => {
    localStorage.setItem(key, JSON.stringify(progress));
  }, {key:PROGRESS_KEY, progress:{...DEFAULT_PROGRESS, completedLevels:[1,2,3,4,5,6,7,8,9,10,11,12,13], settings:{...DEFAULT_PROGRESS.settings, controlMode:'tap'}}});
  await page.goto('/');
  await page.getByRole('button', {name:/PLAY/}).first().click();
  await page.getByRole('button', {name:/Level 14: Matzah Mountain/}).click();
  await expect(page.locator('canvas')).toBeVisible();
  await tapWorld(page, 195, 315);
  await page.getByRole('button', {name:/BIG/}).click();
  await tapWorld(page, 305, 474);
  await expect(page.getByText('1/2 switches')).toBeVisible();
  await tapWorld(page, 72, 508);
  await page.getByRole('button', {name:/TINY/}).click();
  await tapWorld(page, 195, 315);
  await expect(page.getByText('2/2 switches')).toBeVisible();
  await tapWorld(page, 68, 455);
  await expect(page.locator('.mission-strip')).toContainText('Bag: 1', {timeout:20000});
  await tapWorld(page, 318, 273);
  await expect(page.locator('.mission-strip')).toContainText('Bag: 2', {timeout:20000});
  await tapWorld(page, 265, 209);
  await expect(page.getByRole('button', {name:'DELIVER ITEM'})).toBeEnabled({timeout:20000});
  await page.getByRole('button', {name:'DELIVER ITEM'}).click();
  await expect(page.locator('.mission-strip')).toContainText('Delivered: 2/2');
  await tapWorld(page, 135, 550);
  await expect(page.getByText('🎁 ✓')).toBeVisible({timeout:20000});
  await tapWorld(page, 195, 70);
  await expect(page.getByRole('heading', {name:'Mitzvah accomplished!'})).toBeVisible({timeout:20000});
});

test('builds the sukkah walls and roof from gathered supplies', async ({page}) => {
  test.setTimeout(100000);
  await page.addInitScript(({key, progress}) => {
    localStorage.setItem(key, JSON.stringify(progress));
  }, {key:PROGRESS_KEY, progress:{...DEFAULT_PROGRESS, completedLevels:[1,2,3,4,5,6,7,8,9,10,11,12,13,14], settings:{...DEFAULT_PROGRESS.settings, controlMode:'tap'}}});
  await page.goto('/');
  await page.getByRole('button', {name:/PLAY/}).first().click();
  await page.getByRole('button', {name:/Level 15: The Great Sukkah Scramble/}).click();
  await expect(page.locator('canvas')).toBeVisible();
  await tapWorld(page, 195, 335);
  await page.getByRole('button', {name:/BIG/}).click();
  await tapWorld(page, 75, 265);
  await expect(page.getByText('1/3 switches')).toBeVisible();
  await tapWorld(page, 72, 510);
  await page.getByRole('button', {name:/TINY/}).click();
  await tapWorld(page, 195, 335);
  await expect(page.getByText('2/3 switches')).toBeVisible();
  await tapWorld(page, 316, 513);
  await page.getByRole('button', {name:/HEAVY/}).click();
  await tapWorld(page, 306, 374);
  await expect(page.getByText('3/3 switches')).toBeVisible();
  await tapWorld(page, 65, 459);
  await expect(page.locator('.mission-strip')).toContainText('Bag: 1', {timeout:20000});
  await tapWorld(page, 318, 455);
  await expect(page.locator('.mission-strip')).toContainText('Bag: 2', {timeout:20000});
  await tapWorld(page, 195, 242);
  await expect(page.locator('.mission-strip')).toContainText('Bag: 3', {timeout:20000});
  await tapWorld(page, 265, 209);
  await expect(page.getByRole('button', {name:'ASSEMBLE PIECE'})).toBeEnabled({timeout:20000});
  for (let count = 1; count <= 3; count++) {
    await page.getByRole('button', {name:'ASSEMBLE PIECE'}).click();
    await expect(page.locator('.mission-strip')).toContainText(`Assembled: ${count}/3`);
  }
  await tapWorld(page, 140, 551);
  await expect(page.getByText('🎁 ✓')).toBeVisible({timeout:20000});
  await tapWorld(page, 195, 70);
  await expect(page.getByRole('heading', {name:'Mitzvah accomplished!'})).toBeVisible({timeout:20000});
});

test('floats across the dry wadi with community supplies', async ({page}) => {
  test.setTimeout(100000);
  await page.addInitScript(({key, progress}) => {
    localStorage.setItem(key, JSON.stringify(progress));
  }, {key:PROGRESS_KEY, progress:{...DEFAULT_PROGRESS, completedLevels:[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15], settings:{...DEFAULT_PROGRESS.settings, controlMode:'tap'}}});
  await page.goto('/');
  await page.getByRole('button', {name:/PLAY/}).first().click();
  await page.getByRole('button', {name:/Level 16: The Desert Delivery/}).click();
  await expect(page.locator('canvas')).toBeVisible();
  await tapWorld(page, 72, 510);
  await page.getByRole('button', {name:/FLOATING/}).click();
  await tapWorld(page, 195, 449);
  await expect(page.getByText('1/3 switches')).toBeVisible();
  await tapWorld(page, 316, 510);
  await page.getByRole('button', {name:/FLOATING/}).click();
  await tapWorld(page, 195, 520);
  await expect(page.getByText('2/3 switches')).toBeVisible();
  await tapWorld(page, 282, 460);
  await page.getByRole('button', {name:/HEAVY/}).click();
  await tapWorld(page, 85, 255);
  await expect(page.getByText('3/3 switches')).toBeVisible();
  await tapWorld(page, 65, 455);
  await expect(page.locator('.mission-strip')).toContainText('Bag: 1', {timeout:20000});
  await tapWorld(page, 305, 275);
  await expect(page.locator('.mission-strip')).toContainText('Bag: 2', {timeout:20000});
  await tapWorld(page, 265, 209);
  await expect(page.getByRole('button', {name:'DELIVER ITEM'})).toBeEnabled({timeout:20000});
  await page.getByRole('button', {name:'DELIVER ITEM'}).click();
  await expect(page.locator('.mission-strip')).toContainText('Delivered: 2/2');
  await tapWorld(page, 140, 551);
  await expect(page.getByText('🎁 ✓')).toBeVisible({timeout:20000});
  await tapWorld(page, 195, 70);
  await expect(page.getByRole('heading', {name:'Mitzvah accomplished!'})).toBeVisible({timeout:20000});
});

test('recovers winter supplies with the magnetic adventurer', async ({page}) => {
  test.setTimeout(100000);
  await page.addInitScript(({key, progress}) => {
    localStorage.setItem(key, JSON.stringify(progress));
  }, {key:PROGRESS_KEY, progress:{...DEFAULT_PROGRESS, completedLevels:[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16], settings:{...DEFAULT_PROGRESS.settings, controlMode:'tap'}}});
  await page.goto('/');
  await page.getByRole('button', {name:/PLAY/}).first().click();
  await page.getByRole('button', {name:/Level 17: Snowy Shlichus/}).click();
  await expect(page.locator('canvas')).toBeVisible();
  await tapWorld(page, 72, 510);
  await page.getByRole('button', {name:/SLIPPERY/}).click();
  await tapWorld(page, 80, 310);
  await expect(page.getByText('1/2 switches')).toBeVisible({timeout:20000});
  await tapWorld(page, 316, 510);
  await page.getByRole('button', {name:/MAGNETIC/}).click();
  await tapWorld(page, 195, 520);
  await expect(page.getByText('2/2 switches')).toBeVisible();
  await tapWorld(page, 65, 458);
  await expect(page.locator('.mission-strip')).toContainText('Bag: 1', {timeout:20000});
  await tapWorld(page, 75, 263);
  await expect(page.locator('.mission-strip')).toContainText('Bag: 2', {timeout:20000});
  await tapWorld(page, 303, 266);
  await expect(page.locator('.mission-strip')).toContainText('Bag: 3', {timeout:20000});
  await tapWorld(page, 265, 208);
  await expect(page.getByRole('button', {name:'DELIVER ITEM'})).toBeEnabled({timeout:20000});
  await page.getByRole('button', {name:'DELIVER ITEM'}).click();
  await expect(page.locator('.mission-strip')).toContainText('Delivered: 3/3');
  await tapWorld(page, 65, 551);
  await expect(page.getByText('🎁 ✓')).toBeVisible({timeout:20000});
  await tapWorld(page, 195, 70);
  await expect(page.getByRole('heading', {name:'Mitzvah accomplished!'})).toBeVisible({timeout:20000});
});

test('opens the jungle path and helps both neighbors', async ({page}) => {
  test.setTimeout(100000);
  await page.addInitScript(({key, progress}) => {
    localStorage.setItem(key, JSON.stringify(progress));
  }, {key:PROGRESS_KEY, progress:{...DEFAULT_PROGRESS, completedLevels:[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17], settings:{...DEFAULT_PROGRESS.settings, controlMode:'tap'}}});
  await page.goto('/');
  await page.getByRole('button', {name:/PLAY/}).first().click();
  await page.getByRole('button', {name:/Level 18: Jungle Mitzvah Mission/}).click();
  await expect(page.locator('canvas')).toBeVisible();
  await tapWorld(page, 70, 510);
  await page.getByRole('button', {name:/BIG/}).click();
  await tapWorld(page, 305, 471);
  await expect(page.getByText('1/3 switches')).toBeVisible();
  await tapWorld(page, 72, 450);
  await page.getByRole('button', {name:/BOUNCY/}).click();
  await tapWorld(page, 80, 315);
  await expect(page.getByText('2/3 switches')).toBeVisible({timeout:20000});
  await tapWorld(page, 315, 525);
  await page.getByRole('button', {name:/HEAVY/}).click();
  await tapWorld(page, 125, 250);
  await expect(page.getByText('3/3 switches')).toBeVisible();
  await tapWorld(page, 65, 170);
  await expect(page.getByRole('button', {name:'HELP NEIGHBOR'})).toBeEnabled({timeout:20000});
  await page.getByRole('button', {name:'HELP NEIGHBOR'}).click();
  await expect(page.locator('.mission-strip')).toContainText('Neighbors helped: 1/2');
  await tapWorld(page, 266, 224);
  await expect(page.getByRole('button', {name:'HELP NEIGHBOR'})).toBeEnabled({timeout:20000});
  await page.getByRole('button', {name:'HELP NEIGHBOR'}).click();
  await expect(page.locator('.mission-strip')).toContainText('Neighbors helped: 2/2');
  await tapWorld(page, 135, 550);
  await expect(page.getByText('🎁 ✓')).toBeVisible({timeout:20000});
  await tapWorld(page, 195, 70);
  await expect(page.getByRole('heading', {name:'Mitzvah accomplished!'})).toBeVisible({timeout:20000});
});

test('assembles the three-part worldwide celebration machine', async ({page}) => {
  test.setTimeout(100000);
  await page.addInitScript(({key, progress}) => {
    localStorage.setItem(key, JSON.stringify(progress));
  }, {key:PROGRESS_KEY, progress:{...DEFAULT_PROGRESS, completedLevels:[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18], settings:{...DEFAULT_PROGRESS.settings, controlMode:'tap'}}});
  await page.goto('/');
  await page.getByRole('button', {name:/PLAY/}).first().click();
  await page.getByRole('button', {name:/Level 19: The Worldwide Mitzvah Machine/}).click();
  await expect(page.locator('canvas')).toBeVisible();
  await tapWorld(page, 70, 510);
  await page.getByRole('button', {name:/TINY/}).click();
  await tapWorld(page, 195, 355);
  await expect(page.getByText('1/3 switches')).toBeVisible();
  await tapWorld(page, 315, 510);
  await page.getByRole('button', {name:/FLOATING/}).click();
  await tapWorld(page, 195, 520);
  await expect(page.getByText('2/3 switches')).toBeVisible();
  await tapWorld(page, 281, 465);
  await page.getByRole('button', {name:/HEAVY/}).click();
  await tapWorld(page, 85, 223);
  await expect(page.getByText('3/3 switches')).toBeVisible();
  await tapWorld(page, 65, 459);
  await expect(page.locator('.mission-strip')).toContainText('Bag: 1', {timeout:20000});
  await tapWorld(page, 315, 386);
  await expect(page.locator('.mission-strip')).toContainText('Bag: 2', {timeout:20000});
  await tapWorld(page, 220, 245);
  await expect(page.locator('.mission-strip')).toContainText('Bag: 3', {timeout:20000});
  await tapWorld(page, 265, 205);
  await expect(page.getByRole('button', {name:'ASSEMBLE PIECE'})).toBeEnabled({timeout:20000});
  for (let count = 1; count <= 3; count++) {
    await page.getByRole('button', {name:'ASSEMBLE PIECE'}).click();
    await expect(page.locator('.mission-strip')).toContainText(`Assembled: ${count}/3`);
  }
  await tapWorld(page, 140, 551);
  await expect(page.getByText('🎁 ✓')).toBeVisible({timeout:20000});
  await tapWorld(page, 195, 70);
  await expect(page.getByRole('heading', {name:'Mitzvah accomplished!'})).toBeVisible({timeout:20000});
});

test('finishes the grand celebration with two welcome kits', async ({page}) => {
  test.setTimeout(100000);
  await page.addInitScript(({key, progress}) => {
    localStorage.setItem(key, JSON.stringify(progress));
  }, {key:PROGRESS_KEY, progress:{...DEFAULT_PROGRESS, completedLevels:[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19], settings:{...DEFAULT_PROGRESS.settings, controlMode:'tap'}}});
  await page.goto('/');
  await page.getByRole('button', {name:/PLAY/}).first().click();
  await page.getByRole('button', {name:/Level 20: The Grand Mitzvah Celebration/}).click();
  await expect(page.locator('canvas')).toBeVisible();
  await tapWorld(page, 70, 508);
  await page.getByRole('button', {name:/FAST/}).click();
  await tapWorld(page, 195, 520);
  await expect(page.getByText('1/3 switches')).toBeVisible();
  await tapWorld(page, 316, 508);
  await page.getByRole('button', {name:/BOUNCY/}).click();
  await tapWorld(page, 80, 320);
  await expect(page.getByText('2/3 switches')).toBeVisible({timeout:20000});
  await tapWorld(page, 283, 465);
  await page.getByRole('button', {name:/HEAVY/}).click();
  await tapWorld(page, 125, 245);
  await expect(page.getByText('3/3 switches')).toBeVisible();
  await tapWorld(page, 65, 455);
  await expect(page.locator('.mission-strip')).toContainText('Bag: 1', {timeout:20000});
  await tapWorld(page, 318, 455);
  await expect(page.locator('.mission-strip')).toContainText('Bag: 2', {timeout:20000});
  await tapWorld(page, 65, 170);
  await expect(page.getByRole('button', {name:'DELIVER GIFT'})).toBeEnabled({timeout:20000});
  await page.getByRole('button', {name:'DELIVER GIFT'}).click();
  await expect(page.locator('.mission-strip')).toContainText('Delivered: 1/2');
  await tapWorld(page, 266, 220);
  await expect(page.getByRole('button', {name:'DELIVER GIFT'})).toBeEnabled({timeout:20000});
  await page.getByRole('button', {name:'DELIVER GIFT'}).click();
  await expect(page.locator('.mission-strip')).toContainText('Delivered: 2/2');
  await tapWorld(page, 135, 551);
  await expect(page.getByText('🎁 ✓')).toBeVisible({timeout:20000});
  await tapWorld(page, 195, 70);
  await expect(page.getByRole('heading', {name:'Grand celebration!'})).toBeVisible({timeout:20000});
  await expect(page.locator('.finale-dance')).toBeVisible();
  await expect(page.locator('.finale-confetti span')).toHaveCount(14);
});
