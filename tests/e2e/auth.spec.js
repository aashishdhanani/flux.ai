const { test, expect } = require('@playwright/test');

test.describe('Authentication flows', () => {
  test('should allow user to login', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Verify redirect to home page
    await expect(page).toHaveURL('/home');
    // Verify dashboard is visible
    await expect(page.locator('.dashboard-card')).toBeVisible();
  });
});
