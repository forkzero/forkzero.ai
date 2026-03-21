import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['scripts/smoke.test.ts'],
    testTimeout: 15_000,
    reporters: ['default', ['junit', { outputFile: 'test-results/smoke.xml' }]],
  },
})
