import { test, expect } from '@playwright/test';
import * as path from 'path';

// Load local index.html directly from filesystem for robust, isolated testing
const fileUrl = `file://${path.resolve(__dirname, '../games/ai_civilization/index.html')}`;

test.beforeEach(async ({ page }) => {
  // Collect any page console errors to fail the test if JS crashes
  page.on('pageerror', (err) => {
    throw new Error(`Browser console error encountered: ${err.message}`);
  });

  await page.goto(fileUrl);

  // Click the Start Simulation button to dismiss onboarding welcome screen
  await page.click('#btn-start-game');
});

test('Page header and elements are fully rendered', async ({ page }) => {
  // 1. Verify Page Title
  await expect(page).toHaveTitle(/AI Planet Builder/);

  // 2. Verify Title Header
  const title = page.locator('.game-title');
  await expect(title).toContainText('AI Planet Builder');

  // 3. Verify Canvas presence
  const canvas = page.locator('#world-map');
  await expect(canvas).toBeVisible();

  // 4. Verify Stockpile Bar is loaded with initial values
  await expect(page.locator('#stockpile-compute')).toContainText('0');
  await expect(page.locator('#stockpile-energy')).toContainText('0 / 0');
  await expect(page.locator('#stockpile-temp')).toContainText('°C');
  await expect(page.locator('#stockpile-green')).toContainText('100%');
});

test('Planet canvas click increments Compute Power successfully', async ({ page }) => {
  // Verify starting compute
  await expect(page.locator('#stockpile-compute')).toContainText('0');

  // Find canvas element bounding box
  const canvas = page.locator('#world-map');
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();

  if (box) {
    // Click at center of the canvas where the planet is drawn
    const cx = box.x + box.width / 2;
    const cy = box.y + box.height / 2;
    
    // Perform manual clicks on the planet
    await page.mouse.click(cx, cy);
    await page.mouse.click(cx, cy);
    await page.mouse.click(cx, cy);

    // Verify compute increased to at least 3
    const computeVal = await page.locator('#stockpile-compute').innerText();
    expect(Number(computeVal.replace(/,/g, ''))).toBeGreaterThanOrEqual(3);
  }
});

test('Sidebar tabs navigation updates content active classes correctly', async ({ page }) => {
  // Default active tab should be hardware
  await expect(page.locator('#content-hardware')).toHaveClass(/active/);
  await expect(page.locator('#content-climate')).not.toHaveClass(/active/);

  // Switch to Climate Control
  await page.click('#tab-climate');
  await expect(page.locator('#content-climate')).toHaveClass(/active/);
  await expect(page.locator('#content-hardware')).not.toHaveClass(/active/);

  // Switch to Cooling Grid
  await page.click('#tab-cooling');
  await expect(page.locator('#content-cooling')).toHaveClass(/active/);

  // Switch to Algorithmic Research
  await page.click('#tab-research');
  await expect(page.locator('#content-research')).toHaveClass(/active/);
});

test('Injecting compute and buying basic CPU elevates hardware count & power demand', async ({ page }) => {
  // Default CPU count is 0
  await expect(page.locator('#qty-cpu')).toContainText('0');

  // Inject compute directly into simulation state via browser evaluation
  await page.evaluate(() => {
    (window as any).State.compute = 50;
    (window as any).updateUI();
  });

  // Verify upgrade buy-button is now enabled and has full opacity
  const buyBtn = page.locator('#upg-cpu .buy-btn');
  await expect(buyBtn).toBeEnabled();

  // Buy CPU
  await buyBtn.click();

  // Assert hardware count is 1
  await expect(page.locator('#qty-cpu')).toContainText('1');

  // Verify power demand and passive compute rate rises (throttled to 10% due to grid power shortage!)
  await expect(page.locator('#stockpile-energy')).toContainText('1 / 0');
  await expect(page.locator('#trend-compute')).toContainText('+0.1/s');
});

test('Deploys solar array & wind turbine and increases green power grid supply', async ({ page }) => {
  // Switch to Climate tab
  await page.click('#tab-climate');

  // Inject 200 compute
  await page.evaluate(() => {
    (window as any).State.compute = 200;
    (window as any).updateUI();
  });

  // Purchase Solar Panel
  await page.click('#upg-solar .buy-btn');
  await expect(page.locator('#qty-solar')).toContainText('1');

  // Purchase Wind Turbine
  await page.click('#upg-wind .buy-btn');
  await expect(page.locator('#qty-wind')).toContainText('1');

  // Verify energy supply matches (10 GW solar + 25 GW wind = 35 GW supply)
  await expect(page.locator('#stockpile-energy')).toContainText('0 / 35');
});

test('High core temperature triggers warning class and throttling status, cooling fan reduces core heat', async ({ page }) => {
  // Inject compute and high heat to trigger warning
  await page.evaluate(() => {
    (window as any).State.heat = 105.0;
    (window as any).State.compute = 100;
    (window as any).updateUI();
  });

  // Verify temperature card has danger alert styling
  await expect(page.locator('#res-temp')).toHaveClass(/danger/);

  // Switch to Cooling Grid tab
  await page.click('#tab-cooling');

  // Purchase Exhaust Cooling Fan
  await page.click('#upg-fan .buy-btn');
  await expect(page.locator('#qty-fan')).toContainText('1');

  // Run a single simulation step to verify heat drops
  await page.evaluate(() => {
    (window as any).gameTick();
  });

  // Verify heat is lower than initial 105.0
  const tempVal = await page.locator('#stockpile-temp').innerText();
  const tempNum = parseFloat(tempVal);
  expect(tempNum).toBeLessThan(105.0);
});
