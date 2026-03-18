// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

import sentry from '@sentry/astro';

import cloudflare from '@astrojs/cloudflare';

/**
 * Vite plugin that fixes React SSR dual-instance bug in Astro 6 + Cloudflare.
 *
 * Problem: When Vite does a "program reload" (HMR boundary miss, config change,
 * or late dep discovery), the SSR pre-bundled React modules can create separate
 * instances — react-dom/server initializes ReactSharedInternals on one instance
 * while components read hooks from another, causing "Invalid hook call".
 *
 * Fix: Patch the pre-bundled React SSR chunk to store ReactSharedInternals on
 * globalThis, ensuring ALL React instances (across reloads) share the same
 * dispatcher object.
 */
function reactSsrSingletonPlugin() {
  return {
    name: 'react-ssr-singleton',
    enforce: 'pre',
    transform(code, id, options) {
      if (!options?.ssr) return;

      // Patch the pre-bundled React CJS wrapper in deps_ssr/
      // Look for the ReactSharedInternals object creation in the React chunk
      if (id.includes('deps_ssr/') && code.includes('__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE') && code.includes('exports.useRef')) {
        // Patch: after the exports are set, redirect __CLIENT_INTERNALS to a global singleton
        const patchCode = code.replace(
          'exports.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = ReactSharedInternals;',
          `if (globalThis.__REACT_SHARED_INTERNALS_SINGLETON__) {
            ReactSharedInternals = globalThis.__REACT_SHARED_INTERNALS_SINGLETON__;
          } else {
            globalThis.__REACT_SHARED_INTERNALS_SINGLETON__ = ReactSharedInternals;
          }
          exports.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = ReactSharedInternals;`
        );
        if (patchCode !== code) {
          return { code: patchCode, map: null };
        }
      }
    }
  };
}

// https://astro.build/config
export default defineConfig({
  site: 'https://avoqado.io',
  output: 'server',
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      dedupe: ['react', 'react-dom'],
    },
    ssr: {
      noExternal: ['cmdk', 'framer-motion'],
      optimizeDeps: {
        // Pre-include Sentry to avoid initial re-optimization reloads
        include: [
          '@sentry/astro',
          '@sentry/astro/middleware',
        ],
      },
    },
    optimizeDeps: {
      exclude: ['@sentry/astro'],
    },
    server: {
      host: true,
      allowedHosts: ['localhost', '.ngrok-free.app', '.ngrok.io', '.ngrok-free.dev', '.devtunnels.ms', '.trycloudflare.com', 'dev.avoqado.io'],
    }
  },

  integrations: [
    react(),
    sitemap(),
    sentry()
  ],
  adapter: cloudflare()
});
