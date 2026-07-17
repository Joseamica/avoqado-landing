import { expect, test } from 'playwright/test';

test('conserva la homepage anterior en /legacy sin competir en buscadores', async ({ page }) => {
  await page.goto('/?motion=full');
  await expect(page.locator('main[data-scrollytelling]')).toHaveCount(1);
  await expect(page.locator('[data-story-mode]').first()).toBeAttached();
  await expect(page.locator('[data-legacy-homepage]')).toHaveCount(0);

  await page.goto('/legacy');
  const legacy = page.locator('[data-legacy-homepage]');
  await expect(legacy).toHaveCount(1);
  await expect(legacy).toContainText('Tu tienda, tu gym, tu estética.');
  await expect(legacy.locator('#chatbot-section')).toHaveCount(1);
  await expect(legacy.locator('.unified-platform-wrapper')).toHaveCount(1);
  await expect(legacy.locator('.industry-section-wrapper')).toHaveCount(1);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://avoqado.io/');
  await expect(page.locator('[data-site-navigation]')).toHaveCount(1);
  await expect(page.locator('footer')).toHaveCount(1);
  await expect(page.getByRole('button', { name: 'Abrir chat de ayuda' })).toHaveCount(1);

  await page.goto('/demo');
  await expect(page.locator('main[data-scrollytelling], [data-legacy-homepage]')).toHaveCount(0);
});
