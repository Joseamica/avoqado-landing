/**
 * Post-build script: replaces the Astro-generated wrangler.json with a
 * minimal Pages-compatible config. Pages V3 only wants pages_build_output_dir
 * and rejects Worker fields like main, rules, assets, no_bundle.
 */
import { writeFileSync } from 'fs';

const configPath = 'dist/server/wrangler.json';

const pagesConfig = {
  name: "avoqado-landing",
  pages_build_output_dir: ".",
  compatibility_date: "2025-03-14",
  compatibility_flags: ["nodejs_compat"],
};

writeFileSync(configPath, JSON.stringify(pagesConfig, null, 2));
console.log('✓ Replaced dist/server/wrangler.json with Pages V3 config');
