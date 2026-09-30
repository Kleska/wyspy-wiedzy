import { defineConfig } from '@playwright/test';

const exe = process.env.CHROME_PATH;

export default defineConfig({
  testDir: 'e2e',
  timeout: 120_000,
  use: {
    baseURL: 'http://localhost:4173',
    launchOptions: exe ? { executablePath: exe } : {},
    locale: 'pl-PL',
    reducedMotion: 'reduce',
  },
  webServer: {
    command: 'npx vite preview --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: true,
  },
  projects: [
    { name: 'tablet', use: { viewport: { width: 1180, height: 820 }, hasTouch: true } },
    { name: 'phone', use: { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true } },
  ],
});
