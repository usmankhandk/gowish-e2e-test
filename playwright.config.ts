import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: /.*\.spec\.ts$/,

  // ✅ Run all tests in files in parallel
  fullyParallel: true,

  // ✅ Prevent accidental .only on CI
  forbidOnly: !!process.env.CI,

  // ✅ Retry failed tests twice on CI
  retries: process.env.CI ? 2 : 0,

  // ✅ Custom workers count
  workers: process.env.CI ? 1 : undefined,


  // ✅ Reporter to generate HTML test results
  reporter: 'html',

  use: {
    // ✅ Run tests headlessly
    headless: true,

    // ✅ Capture trace only on retry
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    // Uncomment to enable other browsers
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  // ✅ Uncomment if you run tests against a local dev server
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
