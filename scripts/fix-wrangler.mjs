/**
 * Post-build: Fix Astro-generated configs for Cloudflare Pages V3.
 *
 * 1. Replace dist/server/wrangler.json with Pages-only fields
 * 2. Keep .wrangler/deploy/config.json configPath intact (Pages requires it)
 */
import { readFileSync, writeFileSync, existsSync } from 'fs';

// 1. Replace dist/server/wrangler.json with Pages-compatible config
const serverWranglerPath = 'dist/server/wrangler.json';
if (existsSync(serverWranglerPath)) {
  writeFileSync(serverWranglerPath, JSON.stringify({
    name: "avoqado-landing",
    pages_build_output_dir: ".",
    compatibility_date: "2025-03-14",
    compatibility_flags: ["nodejs_compat"],
  }, null, 2));
  console.log('✓ Replaced dist/server/wrangler.json with Pages-compatible config');
}

// 2. Leave .wrangler/deploy/config.json alone — Pages needs the configPath
