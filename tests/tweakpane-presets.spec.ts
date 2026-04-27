import { test, expect, type Page } from '@playwright/test';

test.describe('Tweakpane Preset Switching', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/clock/');
    
    // Wait for the page to load and Tweakpane to be created
    await page.waitForSelector('[class*="tp-"]', { timeout: 10000 });
    
    // Wait a bit more for the pane to be fully initialized
    await page.waitForTimeout(1000);
  });

  test('should show Tweakpane panel on page load', async ({ page }) => {
    // Check that the Tweakpane container exists
    const tweakpane = page.locator('[class*="tp-"]').first();
    await expect(tweakpane).toBeVisible();

    // Check that the preset dropdown exists
    const presetDropdown = page.getByRole('combobox').first();
    await expect(presetDropdown).toBeVisible();
  });

  test('should update parameter values when switching between presets', async ({ page }) => {
    // Wait for Tweakpane to be fully loaded
    await page.waitForSelector('text=Preset');
    
    // Get the preset dropdown (the actual select element)
    const presetDropdown = page.getByRole('combobox').first();
    
    // Function to get a parameter value by its label
    const getParameterValue = async (label: string): Promise<string> => {
      // Find the control row whose visible label exactly matches.
      const container = page.locator(`.tp-lblv:has(> .tp-lblv_l:text-is("${label}"))`).first();
      
      // Try to find various input types
      const inputs = [
        container.locator('input[type="text"]'),
        container.locator('input[type="number"]'),
        container.locator('input[type="range"]'),
        container.locator('select'),
        container.locator('[class*="tp-txtv_i"]'),
        container.locator('[class*="tp-coltxtv_m"]')
      ];
      
      for (const input of inputs) {
        if (await input.count() > 0) {
          const value = await input.first().inputValue().catch(() => 
            input.first().textContent().catch(() => ''));
          if (value && value.trim()) {
            return value.trim();
          }
        }
      }
      
      return '';
    };

    // Test 1: Switch to "Classic" preset and verify parameter changes
    console.log('Testing Classic preset...');
    
    // Select "Classic" preset using selectOption
    await presetDropdown.selectOption({ label: 'Classic' });
    
    // Wait for the pane to update
    await page.waitForTimeout(1000);
    
    // Check that hour hand color changed (Classic uses #2c3e50)
    const hourHandColor = await getParameterValue('Color');
    console.log('Hour hand color after Classic:', hourHandColor);
    
    // Check that hour hand length changed (Classic uses 2.5)
    const hourHandLength = await getParameterValue('Length');
    console.log('Hour hand length after Classic:', hourHandLength);
    
    // Verify the values match the Classic preset
    // Note: Colors might be in different formats (hex, rgb), so we'll check if it contains the expected value
    expect(hourHandColor.toLowerCase()).toContain('2c3e50');
    expect(hourHandLength).toBe('2.5');

    // Test 2: Switch to "Neon" preset and verify different values
    console.log('Testing Neon preset...');
    
    // Select "Neon" preset using selectOption
    await presetDropdown.selectOption({ label: 'Neon' });
    
    // Wait for the pane to update
    await page.waitForTimeout(1000);
    
    // Check that values changed to Neon preset values
    const neonHourHandColor = await getParameterValue('Color');
    const neonHourHandLength = await getParameterValue('Length');
    
    console.log('Hour hand color after Neon:', neonHourHandColor);
    console.log('Hour hand length after Neon:', neonHourHandLength);
    
    // Verify the values changed and match the Neon preset
    expect(neonHourHandColor.toLowerCase()).toContain('ff00ff'); // Neon uses #ff00ff
    expect(neonHourHandLength).toBe('2.7'); // Neon uses 2.7
    
    // Verify the values are different from Classic
    expect(neonHourHandColor).not.toBe(hourHandColor);
    expect(neonHourHandLength).not.toBe(hourHandLength);
  });

  test('should update clock face background when switching presets', async ({ page }) => {
    // Check initial background
    const clockFaceBackground = await getParameterValue(page, 'Background');
    console.log('Initial background:', clockFaceBackground);
    
    // Switch to Neon preset (has dark background #1a1a1a)
    const presetDropdown = page.getByRole('combobox').first();
    await presetDropdown.selectOption({ label: 'Neon' });
    await page.waitForTimeout(1000);
    
    // Check that background changed
    const neonBackground = await getParameterValue(page, 'Background');
    console.log('Neon background:', neonBackground);
    
    expect(neonBackground.toLowerCase()).toContain('1a1a1a');
    expect(neonBackground).not.toBe(clockFaceBackground);
  });

  test('should update all hand parameters when switching to Modern preset', async ({ page }) => {
    // Switch to Modern preset
    const presetDropdown = page.getByRole('combobox').first();
    await presetDropdown.selectOption({ label: 'Modern' });
    await page.waitForTimeout(1000);
    
    // Expand Hour Hand folder to access its parameters
    const hourHandFolder = page.locator('text=Hour Hand').locator('..');
    await hourHandFolder.click();
    await page.waitForTimeout(500);
    
    // Check Hour Hand parameters
    const hourHandColor = await getParameterValue(page, 'Color');
    const hourHandLength = await getParameterValue(page, 'Length');
    
    console.log('Modern Hour Hand - Color:', hourHandColor, 'Length:', hourHandLength);
    
    // Modern preset should have #3498db color and 2.8 length
    expect(hourHandColor.toLowerCase()).toContain('3498db');
    expect(hourHandLength).toBe('2.8');
  });

  // Helper function to get parameter value by label
  async function getParameterValue(page: Page, label: string): Promise<string> {
    // Find the control row whose visible label exactly matches.
    const container = page.locator(`.tp-lblv:has(> .tp-lblv_l:text-is("${label}"))`).first();
    
    // Try to find various input types
    const inputs = [
      container.locator('input[type="text"]'),
      container.locator('input[type="number"]'),
      container.locator('input[type="range"]'),
      container.locator('select'),
      container.locator('[class*="tp-txtv_i"]'),
      container.locator('[class*="tp-coltxtv_m"]')
    ];
    
    for (const input of inputs) {
      if (await input.count() > 0) {
        const value = await input.first().inputValue().catch(() => 
          input.first().textContent().catch(() => ''));
        if (value && value.trim()) {
          return value.trim();
        }
      }
    }
    
    return '';
  }
});
