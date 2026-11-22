import { defineConfig } from '@playwright/test';

const baseURL = 'http://127.0.0.1:4177';
const demoOutput = 'node_modules/.cache/antdv-e2e-demo';

export default defineConfig({
  testDir: './tests/e2e',
  outputDir: 'node_modules/.cache/antdv-e2e-results',
  forbidOnly: Boolean(process.env.CI),
  use: {
    baseURL,
    browserName: 'chromium',
    locale: 'zh-CN',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: `npm run build:demo -- --outDir ${demoOutput} && npm run preview -- --outDir ${demoOutput} --host 127.0.0.1 --port 4177 --strictPort`,
    url: baseURL,
    timeout: 120_000,
  },
});
