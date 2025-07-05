/// <reference types="vitest" />
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { configDefaults } from 'vitest/config';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['@testing-library/jest-dom'],
    exclude: [...configDefaults.exclude, 'build/**/*'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'build/', 'test/', '**/*.d.ts', 'vite.config.ts', 'vitest.config.ts'],
    },
  },
});
