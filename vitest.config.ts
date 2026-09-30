import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';

import { playwright } from '@vitest/browser-playwright';

const dirname =
  typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      // Only measure the files that unit tests actually run against.
      // Components are covered by the storybook project (Chromium), not here.
      // db.ts and session.ts are always mocked, so they show 0% and skew totals.
      include: [
        'src/app/api/**/*.ts',
        'src/lib/auth.ts',
        'src/lib/api-url.ts',
      ],
      exclude: ['src/**/*.test.ts'],
      reporter: ['text', 'html', 'json-summary'],
      thresholds: {
        lines: 80,
        functions: 75,
        branches: 70,
        statements: 80,
      },
    },
    projects: [
      {
        extends: true,
        plugins: [
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
          storybookTest({ configDir: path.join(dirname, '.storybook') }),
        ],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
      {
        test: {
          name: 'unit',
          environment: 'node',
          include: ['src/**/*.test.ts'],
        },
        resolve: {
          alias: {
            '@': path.join(dirname, 'src'),
          },
        },
      },
    ],
  },
});
