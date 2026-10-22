import {defineConfig,devices} from '@playwright/test';

export default defineConfig({
  testDir: '.',
  testMatch: 'homologacao-*.spec.mjs',
  timeout: 90_000,
  expect: {timeout: 10_000},
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  fullyParallel: false,
  reporter: [
    ['list'],
    ['html',{outputFolder:'qa-results/html',open:'never'}],
    ['junit',{outputFile:'qa-results/junit.xml'}]
  ],
  outputDir: 'qa-results/artifacts',
  use: {
    baseURL: process.env.MRL_URL || 'http://127.0.0.1:4173/',
    viewport: {width:1440,height:900},
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10_000
  },
  projects: [
    {name:'chromium',use:{...devices['Desktop Chrome'],viewport:{width:1440,height:900}}},
    {name:'firefox',use:{...devices['Desktop Firefox'],viewport:{width:1440,height:900}}},
    {name:'webkit',use:{...devices['Desktop Safari'],viewport:{width:1440,height:900}}}
  ]
});
