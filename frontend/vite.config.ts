import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
	plugins: [sveltekit() as any],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	},
  build: {
    rollupOptions: {
      external: [
      ]
    }
  }
})
