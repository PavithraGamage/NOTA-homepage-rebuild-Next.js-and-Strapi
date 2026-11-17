import { loadEnvConfig } from '@next/env';
import { defineConfig, devices } from '@playwright/test';

// Same env files as the app (.env.local): STRAPI_INTERNAL_URL and the tests' E2E_STRAPI_TOKEN.
loadEnvConfig(process.cwd());

/**
 * End-to-end tests against a running site and CMS (local by default; see README → End-to-end
 * tests). They use the installed Chrome, so no browser download is needed.
 */
export default defineConfig({
  testDir: 'e2e',
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  reporter: 'list',
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:3000',
    trace: 'retain-on-failure',
  },
  projects: [
    // Reduced motion: no preloader or scroll scenes in the way of the form.
    { name: 'desktop', use: { channel: 'chrome', viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' } },
    { name: 'mobile', use: { ...devices['Pixel 7'], channel: 'chrome' } },
    // Other engines on request (needs `npx playwright install webkit firefox`): E2E_ALL_BROWSERS=1.
    ...(process.env.E2E_ALL_BROWSERS
      ? [
          {
            name: 'desktop-firefox',
            use: {
              browserName: 'firefox' as const,
              viewport: { width: 1440, height: 900 },
              reducedMotion: 'reduce' as const,
            },
          },
          {
            name: 'desktop-safari',
            use: {
              browserName: 'webkit' as const,
              viewport: { width: 1440, height: 900 },
              reducedMotion: 'reduce' as const,
            },
          },
          { name: 'iphone', use: { ...devices['iPhone 15'] } },
        ]
      : []),
  ],
});
