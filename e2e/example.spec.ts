import { test, expect } from '@playwright/test';

test.describe('Website Basic Tests', () => {
  test('homepage loads successfully', async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/');
    
    // Check that the page title contains expected text
    await expect(page).toHaveTitle(/Faruk Hasan/);
    
    // Check that main heading is visible
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();
    
    // Take a screenshot for visual verification
    await page.screenshot({ path: 'test-results/homepage.png' });
  });

  test('navigation links work', async ({ page }) => {
    await page.goto('/');
    
    // Test blog navigation
    const blogLink = page.locator('a[href*="blog"]').first();
    if (await blogLink.isVisible()) {
      await blogLink.click();
      await expect(page).toHaveURL(/blog/);
    }
  });

  test('financial plan page loads', async ({ page }) => {
    await page.goto('/finance/financial_plan.html');
    
    // Check page loads without errors
    await expect(page.locator('h1').filter({ hasText: 'Wealth Structure' })).toBeVisible();
    
    // Check that the chart container exists
    const chartContainer = page.locator('.chart-shell');
    await expect(chartContainer).toBeVisible();
  });

  test('responsive design works', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Check that content is still visible on mobile
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();
    
    // Take mobile screenshot
    await page.screenshot({ path: 'test-results/mobile-homepage.png' });
  });
});
