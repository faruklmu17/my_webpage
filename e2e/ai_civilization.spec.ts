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
    
    // Perform manual clicks on the planet with delay to bypass 50ms debouncer
    await page.mouse.click(cx, cy);
    await page.waitForTimeout(100);
    await page.mouse.click(cx, cy);
    await page.waitForTimeout(100);
    await page.mouse.click(cx, cy);
    await page.waitForTimeout(100);

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
  await buyBtn.click({ force: true });

  // Assert hardware count is 1
  await expect(page.locator('#qty-cpu')).toContainText('1', { timeout: 10000 });

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
  await page.locator('#upg-solar .buy-btn').click({ force: true });
  await expect(page.locator('#qty-solar')).toContainText('1', { timeout: 10000 });

  // Purchase Wind Turbine
  await page.locator('#upg-wind .buy-btn').click({ force: true });
  await expect(page.locator('#qty-wind')).toContainText('1', { timeout: 10000 });

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
  await page.locator('#upg-fan .buy-btn').click({ force: true });
  await expect(page.locator('#qty-fan')).toContainText('1', { timeout: 10000 });

  // Run a single simulation step to verify heat drops
  await page.evaluate(() => {
    (window as any).gameTick();
  });

  // Verify heat is lower than initial 105.0
  const tempVal = await page.locator('#stockpile-temp').innerText();
  const tempNum = parseFloat(tempVal);
  expect(tempNum).toBeLessThan(105.0);
});

test('Resuming game from local storage loads state correctly', async ({ page }) => {
  // 1. Go to page and set some state in local storage
  await page.evaluate(() => {
    const saveData = {
      compute: 1234,
      hardware: { cpu: 2, ram: 0, gpu: 0, server: 0, datacenter: 0, neuralcore: 0 },
      climate: { solar: 1, wind: 0, carbon: 0 },
      cooling: { fan: 0, liquid: 0, cryo: 0 },
      research: { neural: true, superconductor: false, ecorouting: false, geocool: false, agi: false },
      heat: 45.5,
      green: 85.0,
      day: 5,
      hour: 12,
      minute: 0,
      season: "Fall",
      tickCount: 240
    };
    localStorage.setItem('ai_planet_builder_save', JSON.stringify(saveData));
  });

  // Reload page to trigger loading from local storage
  await page.reload();

  // Onboarding screen button should have resume text
  const startBtn = page.locator('#btn-start-game');
  await expect(startBtn).toContainText('Resume Mainframe');

  // Verify loaded telemetry values BEFORE dismissing the overlay while simulation is paused
  await expect(page.locator('#stockpile-compute')).toContainText('1,234');
  await expect(page.locator('#stockpile-temp')).toContainText('45.5°C');
  await expect(page.locator('#stockpile-green')).toContainText('85%');
  await expect(page.locator('#day-counter')).toContainText('Day 5');

  // Dismiss overlay
  await startBtn.click();

  // Verify elements are visible and we can see CPU/Solar counts
  await expect(page.locator('#qty-cpu')).toContainText('2');
  await expect(page.locator('#qty-solar')).toContainText('1');
});

test('Offline Standby progression calculates and harvests compute correctly on resuming', async ({ page }) => {
  // Go to page and set a save state from 1 hour (3600 seconds) ago
  const oneHourAgo = Date.now() - 3600 * 1000;
  
  await page.evaluate((savedAtTime) => {
    const saveData = {
      compute: 500,
      hardware: { cpu: 5, ram: 0, gpu: 0, server: 0, datacenter: 0, neuralcore: 0 }, // 5 CPUs generate 5 Pflop/s
      climate: { solar: 10, wind: 0, carbon: 0 }, // 10 Solar arrays cover grid perfectly (no brownouts)
      cooling: { fan: 5, liquid: 0, cryo: 0 },
      research: { neural: false, superconductor: false, ecorouting: false, geocool: false, agi: false },
      heat: 40.0,
      green: 100.0,
      day: 1,
      hour: 8,
      minute: 0,
      season: "Summer",
      tickCount: 0,
      savedAt: savedAtTime
    };
    localStorage.setItem('ai_planet_builder_save', JSON.stringify(saveData));
  }, oneHourAgo);

  // Reload page to trigger loading from local storage
  await page.reload();

  // Onboarding screen button should have resume text
  const startBtn = page.locator('#btn-start-game');
  await expect(startBtn).toContainText('Resume Mainframe');
  await startBtn.click();

  // Verify that the CORE-9 Standby Report overlay is visible
  const reportOverlay = page.locator('#offline-report-overlay');
  await expect(reportOverlay).toBeVisible();

  // Verify duration metrics in standby report (approx 1h)
  await expect(reportOverlay).toContainText('1h 0m');
  
  // 5 CPUs generate 5 Pflops/s. Offline rate is 50% = 2.5 Pflops/s.
  // 3600 seconds offline * 2.5 Pflops/s = 9000 Pflops earned.
  // Verify standby yield reported matches with a regex buffer for ms execution time
  await expect(reportOverlay).toContainText(/\+9,00[0-9] Pflops/);

  // Click Claim button
  const claimBtn = page.locator('#btn-claim-offline');
  await claimBtn.click();

  // Verify overlay is closed
  await expect(reportOverlay).not.toBeVisible();

  // Total compute should now be 500 (initial) + ~9000 (offline) = ~9500
  const finalComputeVal = await page.locator('#stockpile-compute').innerText();
  expect(Number(finalComputeVal.replace(/,/g, ''))).toBeGreaterThanOrEqual(9500);
});



