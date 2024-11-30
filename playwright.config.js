const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 30000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    // Use chromium for extension testing
    browserName: 'chromium',
    // Load extension on browser launch
    contextOptions: {
      extensions: [path.join(__dirname, 'extension')]
    },
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'cd client && npm start',
    port: 3000,
    reuseExistingServer: !process.env.CI
  }
});
