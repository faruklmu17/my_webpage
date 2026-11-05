import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Space Typing Hero Game', () => {
    test('loads properly with nav, hands visual, and starts mission', async ({ page }) => {
        const filePath = 'file://' + path.resolve(__dirname, '../games/typing_practice.html');
        await page.goto(filePath);

        // Check header title
        await expect(page.locator('h1')).toHaveText(/Space Typing Hero/);

        // Check top navigation
        await expect(page.locator('a:has-text("Games Hub")')).toBeVisible();
        await expect(page.locator('a:has-text("Resources")')).toBeVisible();
        await expect(page.locator('#levelSelect')).toBeVisible();
        await expect(page.locator('#soundToggleBtn')).toBeVisible();

        // Check hands visual
        await expect(page.locator('#leftHand')).toBeVisible();
        await expect(page.locator('#rightHand')).toBeVisible();

        // Check Start Mission button
        const startBtn = page.locator('#mainBtn');
        await expect(startBtn).toBeVisible();
        await startBtn.click();

        // Game is now playing
        await expect(page.locator('#typingBox .char').first()).toBeVisible();

        // Read the characters to type
        const charElements = page.locator('#typingBox .char');
        const count = await charElements.count();
        expect(count).toBeGreaterThan(0);

        // Type all characters accurately
        for (let i = 0; i < count; i++) {
            const charText = await charElements.nth(i).innerText();
            const keyToPress = charText === '' || charText === ' ' ? 'Space' : charText;
            await page.keyboard.press(keyToPress);
            await page.waitForTimeout(30);
        }

        // Round completes and Next Round button is displayed
        await expect(page.locator('#mainBtn')).toBeVisible();
        await expect(page.locator('#mainBtn')).toContainText('Next Round');
        
        // Verify score increased
        const scoreText = await page.locator('#scoreDisplay').innerText();
        expect(parseInt(scoreText, 10)).toBeGreaterThan(0);

        // Verify Streak
        const streakText = await page.locator('#streakDisplay').innerText();
        expect(streakText).toContain('Streak');
    });

    test('level selector dropdown switches missions', async ({ page }) => {
        const filePath = 'file://' + path.resolve(__dirname, '../games/typing_practice.html');
        await page.goto(filePath);

        // Switch to Level 6 (Galaxy Explorer)
        await page.selectOption('#levelSelect', '5');

        await expect(page.locator('#lvlDisplay')).toHaveText('Level 6');
        await expect(page.locator('#missionBadge')).toContainText('Mission 6');

        // It automatically starts the selected mission
        await expect(page.locator('#typingBox .char').first()).toBeVisible();
    });

    test('sound toggle toggles correctly', async ({ page }) => {
        const filePath = 'file://' + path.resolve(__dirname, '../games/typing_practice.html');
        await page.goto(filePath);

        const soundBtn = page.locator('#soundToggleBtn');
        await expect(soundBtn).toContainText('Sound ON');
        await soundBtn.click();
        await expect(soundBtn).toContainText('Sound OFF');
        await soundBtn.click();
        await expect(soundBtn).toContainText('Sound ON');
    });
});
