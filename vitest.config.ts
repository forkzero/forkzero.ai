import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/main.tsx', 'src/**/*.test.{ts,tsx}'],
      reporter: ['text', 'lcov'],
      thresholds: {
        statements: 43,
        branches: 100,
        functions: 4,
        lines: 43,
      },
      thresholdAutoUpdate: true,
    },
  },
})
