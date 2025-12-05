import cloudflare from '@astrojs/cloudflare'
import react from '@astrojs/react'
import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'astro/config'
import { fontless } from 'fontless'


export default defineConfig({
	output: 'server',
	site: 'https://doorpasses.me',
	integrations: [
		react(),
		sitemap({
			filter: (page) =>
				!page.includes('/preview/') &&
				!page.includes('/api/'),
			changefreq: 'weekly',
			priority: 0.7,
			lastmod: new Date(),
		}),
	],

	vite: {
		plugins: [tailwindcss(), fontless()],
		server: {
			allowedHosts: ['doorpasses.me', 'localhost'],
		},
		optimizeDeps: {
			exclude: ['@sentry/profiling-node', '@sentry-internal/node-cpu-profiler'],
		}
	},

	adapter: cloudflare(),
})
