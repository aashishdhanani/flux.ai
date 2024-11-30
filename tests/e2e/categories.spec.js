test.describe('Category management', () => {
    test('should display category cards', async ({ page }) => {
      await page.goto('/categories');
      
      // Verify category cards are visible
      const categoryCards = page.locator('.category-card');
      await expect(categoryCards).toHaveCount(await categoryCards.count());
      
      // Test category card interaction
      const firstCard = categoryCards.first();
      await firstCard.click();
      await expect(page.locator('.category-details')).toBeVisible();
    });
  });