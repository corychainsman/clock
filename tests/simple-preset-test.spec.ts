import { test, expect } from '@playwright/test';

test.describe('Simple Preset Test', () => {
  test('should be able to select different presets', async ({ page }) => {
    await page.goto('/clock/');
    
    // Wait for page to load
    await page.waitForSelector('text=Preset', { timeout: 10000 });
    await page.waitForTimeout(2000);
    
    // Find the preset dropdown
    const presetSelect = page.getByRole('combobox').first();
    await expect(presetSelect).toBeVisible();
    
    // Get initial value
    const initialValue = await presetSelect.inputValue();
    console.log('Initial preset value:', initialValue);
    
    // Try selecting Classic preset by text value
    await presetSelect.selectOption({ label: 'Classic' });
    await page.waitForTimeout(1000);
    
    // Verify preset changed
    const classicValue = await presetSelect.inputValue();
    console.log('After selecting Classic:', classicValue);
    expect(classicValue).toBe('Classic');
    
    // Try selecting Neon preset by text value
    await presetSelect.selectOption({ label: 'Neon' });
    await page.waitForTimeout(1000);
    
    // Verify preset changed
    const neonValue = await presetSelect.inputValue();
    console.log('After selecting Neon:', neonValue);
    expect(neonValue).toBe('Neon');
    
    // Take a screenshot to see what we're working with
    await page.screenshot({ path: 'test-results/preset-test.png', fullPage: true });
  });
  
  test('should show parameter folders', async ({ page }) => {
    await page.goto('/clock/');
    await page.waitForSelector('text=Preset', { timeout: 10000 });
    await page.waitForTimeout(2000);
    
    // Check for parameter folders
    const parametersFolder = page.locator('text=Parameters');
    await expect(parametersFolder).toBeVisible();
    
    const clockFaceFolder = page.locator('text=Clock Face');
    await expect(clockFaceFolder).toBeVisible();
    
    const hourHandFolder = page.locator('text=Hour Hand');
    await expect(hourHandFolder).toBeVisible();
    
    // Take a screenshot
    await page.screenshot({ path: 'test-results/folders-test.png', fullPage: true });
  });
});