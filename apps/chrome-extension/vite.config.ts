import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { crx, ManifestV3Export } from '@crxjs/vite-plugin'
import tailwindcss from '@tailwindcss/vite'

const baseManifest: ManifestV3Export = {
  manifest_version: 3,
  name: "Epic SaaS Chrome Extension",
  version: "1.0",
  description: "Injects a script into a domain after user permission.",
  permissions: ["storage", "activeTab", "scripting", "tabs"],
  host_permissions: ["<all_urls>"],
  action: {
    default_popup: "index.html"
  },
  background: {
    service_worker: "src/background/index.ts",
    type: "module"
  },
  web_accessible_resources: [
    {
      resources: ["assets/*.js"],
      matches: ["<all_urls>"]
    }
  ]
}

const devManifest: Partial<ManifestV3Export> = {
  host_permissions: ['http://localhost:5173/*'],
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isDev = mode === 'development'

  const finalManifest = {
    ...baseManifest,
    ...(isDev ? devManifest : {}),
  }

  return {
    base: './',
    build: {
      emptyOutDir: true,
      outDir: 'build',
      rollupOptions: {
        output: {
          chunkFileNames: 'assets/chunk-[hash].js',
        },
      },
    },
    server: {
      port: 5173,
      strictPort: true,
      hmr: {
        port: 5173,
      },
    },
    plugins: [
      react(),
      tailwindcss(),
      crx({ 
        manifest: finalManifest as ManifestV3Export,
        contentScripts: {
          injectCss: true,
        }
      }),
    ],
  }
})
