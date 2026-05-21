import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';

const landingRoot = process.cwd();
const dashboardRoot = resolve(landingRoot, '../avoqado-web-dashboard');
const outputPath = resolve(landingRoot, 'src/content/help/generated/dashboard-inventory.json');

const sourceFiles = {
  venueRoutes: resolve(dashboardRoot, 'src/routes/venueRoutes.tsx'),
  sidebar: resolve(dashboardRoot, 'src/components/Sidebar/app-sidebar.tsx'),
  featureRegistry: resolve(dashboardRoot, 'src/config/feature-registry.ts'),
};

function readSource(label, path) {
  if (!existsSync(path)) {
    throw new Error(`Missing ${label}: ${path}`);
  }

  return readFileSync(path, 'utf8');
}

function stripComments(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1');
}

function normalizeRoute(route) {
  if (!route || route.includes('${')) return null;

  const normalized = route
    .trim()
    .replace(/[?#].*$/, '')
    .replace(/^\/+/, '')
    .replace(/\/+$/, '');

  if (!normalized) return null;
  if (normalized.startsWith('#')) return null;
  if (normalized.startsWith('http')) return null;
  if (normalized.startsWith('superadmin')) return null;
  if (normalized === 'admin' || normalized.startsWith('admin/')) return null;
  if (normalized === 'wl' || normalized.startsWith('wl/')) return null;

  return normalized;
}

function collectMatches(source, regex) {
  const values = new Set();
  let match;

  while ((match = regex.exec(source))) {
    const route = normalizeRoute(match[1]);
    if (route) values.add(route);
  }

  return [...values].sort((a, b) => a.localeCompare(b, 'es'));
}

function extractFeatureBlocks(source) {
  const registryIndex = source.indexOf('FEATURE_REGISTRY');
  if (registryIndex === -1) return [];

  const objectStart = source.indexOf('{', registryIndex);
  if (objectStart === -1) return [];

  const blocks = [];
  let cursor = objectStart + 1;

  while (cursor < source.length) {
    const keyMatch = /\s*([A-Z][A-Z0-9_]+):\s*\{/.exec(source.slice(cursor));
    if (!keyMatch) break;

    const keyStart = cursor + keyMatch.index;
    const key = keyMatch[1];
    let bodyStart = keyStart + keyMatch[0].length;
    let depth = 1;
    let i = bodyStart;
    let quote = null;

    for (; i < source.length; i += 1) {
      const char = source[i];
      const previous = source[i - 1];

      if (quote) {
        if (char === quote && previous !== '\\') quote = null;
        continue;
      }

      if (char === '\'' || char === '"' || char === '`') {
        quote = char;
        continue;
      }

      if (char === '{') depth += 1;
      if (char === '}') depth -= 1;

      if (depth === 0) break;
    }

    blocks.push({ key, body: source.slice(bodyStart, i) });
    cursor = i + 1;
  }

  return blocks;
}

function readStringField(body, field) {
  const match = new RegExp(`${field}:\\s*['"\`]([^'"\`]+)['"\`]`).exec(body);
  return match?.[1] ?? '';
}

function extractFeatures(featureRegistrySource) {
	return extractFeatureBlocks(stripComments(featureRegistrySource)).map(({ key, body }) => {
		const routes = collectMatches(body, /path:\s*['"`]([^'"`]+)['"`]/g).filter(route => !route.startsWith('@/'));

		return {
			code: readStringField(body, 'code') || key,
      name: readStringField(body, 'name'),
      description: readStringField(body, 'description'),
      category: readStringField(body, 'category'),
      source: readStringField(body, 'source'),
      routes,
    };
  });
}

const venueRoutesSource = stripComments(readSource('dashboard venue routes', sourceFiles.venueRoutes));
const sidebarSource = stripComments(readSource('dashboard sidebar', sourceFiles.sidebar));
const featureRegistrySource = readSource('dashboard feature registry', sourceFiles.featureRegistry);

const routePaths = collectMatches(venueRoutesSource, /path:\s*['"`]([^'"`]+)['"`]/g);
const sidebarRoutes = collectMatches(sidebarSource, /url:\s*['"`]([^'"`]+)['"`]/g);
const features = extractFeatures(featureRegistrySource);

const routes = [...new Set([...routePaths, ...sidebarRoutes])].sort((a, b) => a.localeCompare(b, 'es'));

const inventory = {
  generatedAt: new Date().toISOString(),
  sourceRepo: 'avoqado-web-dashboard',
  sourceFiles: Object.fromEntries(
    Object.entries(sourceFiles).map(([key, value]) => [key, relative(landingRoot, value)]),
  ),
  summary: {
    routeCount: routes.length,
    sidebarRouteCount: sidebarRoutes.length,
    featureCount: features.length,
    avoqadoCoreFeatureCount: features.filter(feature => feature.code.startsWith('AVOQADO_')).length,
  },
  routes,
  sidebarRoutes,
  routePaths,
  features,
};

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(inventory, null, 2)}\n`);

console.log(`Wrote ${relative(landingRoot, outputPath)}`);
console.log(`Routes: ${inventory.summary.routeCount}`);
console.log(`Features: ${inventory.summary.featureCount}`);
