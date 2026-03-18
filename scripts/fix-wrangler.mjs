/**
 * Post-build: clean the Astro-generated dist/server/wrangler.json
 *
 * Pages V3 redirects from our root wrangler.jsonc to this file.
 * Astro generates fields that Pages rejects:
 * - "ASSETS" binding (reserved name)
 * - "kv_namespaces" without IDs
 * - "triggers" empty object
 * - Various unsupported fields
 *
 * We keep ONLY what Astro's worker needs to run.
 */
import { readFileSync, writeFileSync } from 'fs';

const path = 'dist/server/wrangler.json';
const config = JSON.parse(readFileSync(path, 'utf-8'));

writeFileSync(path, JSON.stringify({
  name: config.name,
  main: config.main,
  compatibility_date: config.compatibility_date,
  compatibility_flags: config.compatibility_flags,
  no_bundle: config.no_bundle,
}, null, 2));

console.log('✓ Cleaned dist/server/wrangler.json');
