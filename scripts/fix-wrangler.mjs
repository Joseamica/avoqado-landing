/**
 * Post-build: Replace Astro's Worker-style wrangler.json with Pages-compatible config.
 *
 * @astrojs/cloudflare v13 generates dist/server/wrangler.json with Worker fields
 * (main, assets, no_bundle, rules, triggers, kv_namespaces without IDs, reserved ASSETS name)
 * that Cloudflare Pages V3 explicitly rejects.
 *
 * Pages only supports: name, pages_build_output_dir, compatibility_date,
 * compatibility_flags, vars, kv_namespaces (with IDs), d1_databases, r2_buckets, etc.
 *
 * The root wrangler.jsonc has pages_build_output_dir which Pages reads first.
 * This script ensures the redirected dist/server/wrangler.json is also Pages-valid.
 *
 * Reference: https://developers.cloudflare.com/pages/functions/wrangler-configuration/
 */
import { readFileSync, writeFileSync, existsSync } from 'fs';

// Also fix .wrangler/deploy/config.json if it exists — remove the redirect
// so Pages uses the root wrangler.jsonc directly
const deployConfigPath = '.wrangler/deploy/config.json';
if (existsSync(deployConfigPath)) {
  const deployConfig = JSON.parse(readFileSync(deployConfigPath, 'utf-8'));
  // Remove the redirect that points to dist/server/wrangler.json
  if (deployConfig.configPath) {
    delete deployConfig.configPath;
    writeFileSync(deployConfigPath, JSON.stringify(deployConfig, null, 2));
    console.log('✓ Removed configPath redirect from .wrangler/deploy/config.json');
  }
}

// Replace the dist/server/wrangler.json with a minimal Pages-valid config
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
