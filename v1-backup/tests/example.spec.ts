import { test, expect } from '@playwright/test';


test('Mission 7 stays hidden after page refresh', async ({ page }) => {


    await page.goto('http://127.0.0.1:5500/automation/playwright-selenium-cypress-practice.html');

    const mission9 = page.locator('#persistent-hide-btn');
    const mission7= page.getByRole('heading', { level:2,name: 'Mission 7: Search Functionality' });

    //click mission 9 

    await mission9.click();


    //verify mission 7 is hidden
    await expect(mission7).not.toBeVisible();


    // wait untill local storage becomes "true"
    await expect.poll(() =>
        page.evaluate(() => localStorage.getItem('mission7PersistentHide'))
      ).toBe('true');

      await page.reload();

      await expect(mission7).not.toBeVisible();
     



})
