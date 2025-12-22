// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

import sentry from '@sentry/astro';
import spotlightjs from '@spotlightjs/astro';

import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  site: 'https://avoqado.io',
  output: 'server', // Required for API routes with Cloudflare adapter
  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [
    react({
      include: ['**/react/*', '**/*.tsx'],
    }),
    sitemap(),
    sentry(),
    spotlightjs()
  ],
  adapter: cloudflare()
});