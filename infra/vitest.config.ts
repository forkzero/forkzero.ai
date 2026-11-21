import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['test/**/*.test.ts', 'analytics-report/**/*.test.mjs'],
    // CDK synthesis bundles Lambda assets; give it room on cold CI runners
    testTimeout: 30_000,
  },
})
