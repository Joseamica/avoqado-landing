import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { basename, dirname, join, relative, resolve } from 'node:path';

const landingRoot = process.cwd();
const helpRoot = resolve(landingRoot, 'src/content/help/dashboard');
const inventoryPath = resolve(landingRoot, 'src/content/help/generated/dashboard-inventory.json');

const validCategories = new Set([
  'inicio',
  'ventas',
  'menu',
  'inventario',
  'terminales',
  'equipo',
  'clientes',
  'reportes',
  'reservaciones',
  'configuracion',
]);

const forbiddenProductTerms = [
  /avoqado-android/i,
  /avoqado-tpv/i,
  /\bapp android\b/i,
  /\bapp movil\b/i,
  /\bapp mobile\b/i,
  /\bmobile app\b/i,
  /\btpv app\b/i,
];

const minBodyWords = 180;
const requiredHeadings = ['Antes de empezar', 'Pasos', 'Problemas frecuentes'];

function walkMarkdownFiles(dir) {
  if (!existsSync(dir)) return [];

  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return walkMarkdownFiles(path);
    return entry.isFile() && entry.name.endsWith('.md') ? [path] : [];
  });
}

function parseScalar(value) {
  const trimmed = value.trim();
  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;
  return trimmed.replace(/^['"]|['"]$/g, '');
}

function parseFrontmatter(source) {
  const match = /^---\n([\s\S]*?)\n---/.exec(source);
  if (!match) return null;

  const data = {};
  let currentArrayKey = null;

  for (const line of match[1].split('\n')) {
    const keyMatch = /^([A-Za-z][A-Za-z0-9_-]*):(?:\s*(.*))?$/.exec(line);

    if (keyMatch) {
      const [, key, value = ''] = keyMatch;
      if (value.trim() === '') {
        data[key] = [];
        currentArrayKey = key;
      } else {
        data[key] = parseScalar(value);
        currentArrayKey = null;
      }
      continue;
    }

    const itemMatch = /^\s*-\s+(.*)$/.exec(line);
    if (itemMatch && currentArrayKey) {
      data[currentArrayKey].push(parseScalar(itemMatch[1]));
    }
  }

  return data;
}

function normalizeRoute(route) {
  return String(route).trim().replace(/^\/+/, '').replace(/\/+$/, '');
}

function articleSlug(path) {
  return basename(path, '.md');
}

function markdownBody(source) {
  const match = /^---\n[\s\S]*?\n---\n?([\s\S]*)$/.exec(source);
  return match?.[1] ?? '';
}

function wordCount(text) {
  return text
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length;
}

if (!existsSync(inventoryPath)) {
  console.error('Missing dashboard inventory. Run `npm run help:inventory` first.');
  process.exit(1);
}

const inventory = JSON.parse(readFileSync(inventoryPath, 'utf8'));
const validRoutes = new Set(inventory.routes);
const validFeatureCodes = new Set(inventory.features.map(feature => feature.code));
const coreFeatureCodes = inventory.features
  .filter(feature => feature.code.startsWith('AVOQADO_'))
  .map(feature => feature.code);

const files = walkMarkdownFiles(helpRoot);
const errors = [];
const warnings = [];
const slugs = new Set(files.map(articleSlug));
const seenTitles = new Map();
const documentedFeatureCodes = new Set();

for (const file of files) {
  const source = readFileSync(file, 'utf8');
  const frontmatter = parseFrontmatter(source);
  const body = markdownBody(source);
  const label = relative(landingRoot, file);

  if (!frontmatter) {
    errors.push(`${label}: missing frontmatter`);
    continue;
  }

  const categoryFromPath = basename(dirname(file));

  if (frontmatter.product !== 'dashboard') {
    errors.push(`${label}: product must be "dashboard"`);
  }

  if (frontmatter.sourceRepo !== 'avoqado-web-dashboard') {
    errors.push(`${label}: sourceRepo must be "avoqado-web-dashboard"`);
  }

  if (!validCategories.has(frontmatter.category)) {
    errors.push(`${label}: invalid category "${frontmatter.category}"`);
  }

  if (frontmatter.category !== categoryFromPath) {
    errors.push(`${label}: category does not match folder "${categoryFromPath}"`);
  }

  if (!Array.isArray(frontmatter.dashboardRoutes) || frontmatter.dashboardRoutes.length === 0) {
    errors.push(`${label}: dashboardRoutes must include at least one route`);
  } else {
    for (const rawRoute of frontmatter.dashboardRoutes) {
      const route = normalizeRoute(rawRoute);
      if (route !== 'login' && !validRoutes.has(route)) {
        errors.push(`${label}: unknown dashboard route "${route}"`);
      }
    }
  }

  if (frontmatter.featureCode) {
    documentedFeatureCodes.add(frontmatter.featureCode);
    if (!validFeatureCodes.has(frontmatter.featureCode)) {
      errors.push(`${label}: unknown featureCode "${frontmatter.featureCode}"`);
    }
  }

  if (Array.isArray(frontmatter.relatedArticles)) {
    for (const slug of frontmatter.relatedArticles) {
      if (!slugs.has(slug)) {
        errors.push(`${label}: related article "${slug}" does not exist`);
      }
    }
  }

  if (frontmatter.title) {
    if (seenTitles.has(frontmatter.title)) {
      warnings.push(`${label}: duplicate title also used by ${seenTitles.get(frontmatter.title)}`);
    }
    seenTitles.set(frontmatter.title, label);
  }

  const bodyWords = wordCount(body);
  if (bodyWords < minBodyWords) {
    errors.push(`${label}: body is too thin (${bodyWords} words, minimum ${minBodyWords})`);
  }

  for (const heading of requiredHeadings) {
    if (!body.includes(`## ${heading}`)) {
      errors.push(`${label}: missing required heading "## ${heading}"`);
    }
  }

  for (const pattern of forbiddenProductTerms) {
    if (pattern.test(source)) {
      warnings.push(`${label}: contains non-dashboard product term matching ${pattern}`);
    }
  }
}

const uncoveredCoreFeatures = coreFeatureCodes.filter(code => !documentedFeatureCodes.has(code));
if (uncoveredCoreFeatures.length > 0) {
  warnings.push(`Uncovered Avoqado core features: ${uncoveredCoreFeatures.join(', ')}`);
}

for (const warning of warnings) {
  console.warn(`WARN ${warning}`);
}

if (errors.length > 0) {
  for (const error of errors) {
    console.error(`ERROR ${error}`);
  }
  process.exit(1);
}

console.log(`Checked ${files.length} dashboard help articles`);
console.log(`Documented feature codes: ${documentedFeatureCodes.size}`);
console.log(`Warnings: ${warnings.length}`);
