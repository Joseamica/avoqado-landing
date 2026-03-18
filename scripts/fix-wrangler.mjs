/**
 * Post-build: Fix Astro-generated wrangler.json for Cloudflare Pages V3.
 *
 * Problem: Astro generates fields Pages rejects (reserved ASSETS, kv without IDs,
 * empty triggers, unsupported top-level fields).
 *
 * Solution: Keep only the fields Pages actually needs to find and run the worker,
 * remove everything that causes validation errors.
 */
import { readFileSync, writeFileSync, existsSync } from 'fs';

const path = 'dist/server/wrangler.json';
if (!existsSync(path)) process.exit(0);

const config = JSON.parse(readFileSync(path, 'utf-8'));

// Keep worker-essential fields, remove everything Pages rejects
const clean = {
  name: config.name,
  main: config.main,                           // entry.mjs — needed to find the worker
  compatibility_date: config.compatibility_date,
  compatibility_flags: config.compatibility_flags,
  no_bundle: config.no_bundle,
  // assets WITHOUT the reserved "ASSETS" binding name
  assets: config.assets?.directory ? { directory: config.assets.directory } : undefined,
};

// Remove undefined
Object.keys(clean).forEach(k => clean[k] === undefined && delete clean[k]);

writeFileSync(path, JSON.stringify(clean, null, 2));
console.log('✓ Cleaned dist/server/wrangler.json — kept main + assets.directory');
