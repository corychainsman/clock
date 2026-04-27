import { test, expect } from '@playwright/test';

test.describe('Preset Functionality Test', () => {
  test('should update Tweakpane parameter values when switching between presets', async ({ page }) => {
    await page.goto('/clock/');
    
    // Wait for page to load completely
    await page.waitForSelector('text=Preset', { timeout: 10000 });
    await page.waitForTimeout(3000); // Give Tweakpane time to fully initialize
    
    // Get the preset dropdown
    const presetSelect = page.getByRole('combobox').first();
    
    // Verify initial state is Default
    const initialPreset = await presetSelect.inputValue();
    expect(initialPreset).toBe('Default');
    
    // Expand Clock Face folder to access Background parameter
    const clockFaceFolder = page.locator('text=Clock Face');
    await clockFaceFolder.click();
    await page.waitForTimeout(500);
    
    // Get initial background value (should be Default preset background)
    const backgroundInput = page.locator('text=Background').locator('..').locator('input').first();
    const initialBackground = await backgroundInput.inputValue();
    console.log('Initial background value:', initialBackground);
    
    // Switch to Neon preset (has dark background #1a1a1a)
    await presetSelect.selectOption({ label: 'Neon' });
    await page.waitForTimeout(2000); // Wait for pane recreation
    
    // Verify preset dropdown shows Neon
    const neonPresetValue = await presetSelect.inputValue();
    expect(neonPresetValue).toBe('Neon');
    
    // Re-expand Clock Face folder (pane was recreated)
    const clockFaceFolderAfter = page.locator('text=Clock Face');
    await clockFaceFolderAfter.click();
    await page.waitForTimeout(500);
    
    // Check that background value changed to Neon preset value
    const backgroundInputAfter = page.locator('text=Background').locator('..').locator('input').first();
    const neonBackground = await backgroundInputAfter.inputValue();
    console.log('Neon background value:', neonBackground);
    
    // Verify background changed from default
    expect(neonBackground).not.toBe(initialBackground);
    
    // Verify it contains the expected Neon color (dark background)
    expect(neonBackground.toLowerCase()).toContain('1a1a1a');
    
    // Now test Hour Hand parameters
    // Expand Hour Hand folder
    const hourHandFolder = page.locator('text=Hour Hand');
    await hourHandFolder.click();
    await page.waitForTimeout(500);
    
    // Check Hour Hand color (Neon should be #ff00ff - magenta)
    const colorInput = page.locator('text=Color').locator('..').locator('input').first();
    const neonHourHandColor = await colorInput.inputValue();
    console.log('Neon hour hand color:', neonHourHandColor);
    
    // Verify it contains the expected Neon color
    expect(neonHourHandColor.toLowerCase()).toContain('ff00ff');
    
    // Check Hour Hand length (Neon should be 2.7)
    const lengthInput = page.locator('text=Length').locator('..').locator('input').first();
    const neonHourHandLength = await lengthInput.inputValue();
    console.log('Neon hour hand length:', neonHourHandLength);
    
    expect(neonHourHandLength).toBe('2.7');
    
    // Switch to Classic preset for comparison
    await presetSelect.selectOption({ label: 'Classic' });
    await page.waitForTimeout(2000);
    
    // Verify preset dropdown shows Classic
    const classicPresetValue = await presetSelect.inputValue();
    expect(classicPresetValue).toBe('Classic');
    
    // Re-expand Hour Hand folder (pane was recreated)
    const hourHandFolderClassic = page.locator('text=Hour Hand');
    await hourHandFolderClassic.click();
    await page.waitForTimeout(500);
    
    // Check that Hour Hand color changed to Classic value (#2c3e50)
    const colorInputClassic = page.locator('text=Color').locator('..').locator('input').first();
    const classicHourHandColor = await colorInputClassic.inputValue();
    console.log('Classic hour hand color:', classicHourHandColor);
    
    expect(classicHourHandColor.toLowerCase()).toContain('2c3e50');
    
    // Check that Hour Hand length changed to Classic value (2.5)
    const lengthInputClassic = page.locator('text=Length').locator('..').locator('input').first();
    const classicHourHandLength = await lengthInputClassic.inputValue();
    console.log('Classic hour hand length:', classicHourHandLength);
    
    expect(classicHourHandLength).toBe('2.5');
    
    // Verify values are different from Neon
    expect(classicHourHandColor).not.toBe(neonHourHandColor);
    expect(classicHourHandLength).not.toBe(neonHourHandLength);
    
    // Take final screenshot
    await page.screenshot({ path: 'test-results/preset-functionality-test.png', fullPage: true });
  });
  
  test('should update clock visual appearance when switching presets', async ({ page }) => {
    await page.goto('/clock/');
    await page.waitForSelector('text=Preset', { timeout: 10000 });
    await page.waitForTimeout(3000);
    
    // Get the preset dropdown
    const presetSelect = page.getByRole('combobox').first();
    
    // Take screenshot of Default preset
    await page.screenshot({ path: 'test-results/clock-default.png' });
    
    // Switch to Neon preset
    await presetSelect.selectOption({ label: 'Neon' });
    await page.waitForTimeout(2000);
    
    // Take screenshot of Neon preset
    await page.screenshot({ path: 'test-results/clock-neon.png' });
    
    // Switch to Classic preset
    await presetSelect.selectOption({ label: 'Classic' });
    await page.waitForTimeout(2000);
    
    // Take screenshot of Classic preset
    await page.screenshot({ path: 'test-results/clock-classic.png' });
    
    // Switch to Modern preset
    await presetSelect.selectOption({ label: 'Modern' });
    await page.waitForTimeout(2000);
    
    // Take screenshot of Modern preset
    await page.screenshot({ path: 'test-results/clock-modern.png' });
    
    // Verify the clock canvas exists and is visible (basic sanity check)
    const canvas = page.locator('canvas[data-engine^="three.js"]');
    await expect(canvas).toBeVisible();
  });
});
