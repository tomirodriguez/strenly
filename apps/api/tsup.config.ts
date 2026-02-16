import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/server.ts'],
  format: ['esm'],
  target: 'node18',
  outDir: 'dist',
  clean: true,
  sourcemap: true,
  bundle: true,
  splitting: false,
  treeshake: true,
  minify: false,
  noExternal: [
    // Bundle workspace dependencies
    '@strenly/backend',
    '@strenly/auth',
    '@strenly/contracts',
    '@strenly/core',
    '@strenly/database',
  ],
})
