test.describe('Spending analysis', () => {
    test('should show spending patterns', async ({ page }) => {
      await page.goto('/spending');
      
      // Verify spending chart is visible
      await expect(page.locator('.spending-chart')).toBeVisible();
      
      // Test date range selector
      await page.selectOption('select[name="timeRange"]', 'monthly');
      await expect(page.locator('.spending-total')).toBeVisible();
    });
  });