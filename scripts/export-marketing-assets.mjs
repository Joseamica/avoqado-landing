#!/usr/bin/env node
/**
 * Marketing asset exporter.
 *
 * Produces a single `exports/` folder the marketing team can reuse, with two parts:
 *
 *   1. Real assets (just copied):
 *        exports/videos-reales/      <- public/*.webm
 *        exports/imagenes-reales/    <- src/assets/** + public images (logos, terminals, hero tiles)
 *
 *   2. HTML/CSS mockups (rendered + captured from the live dev server):
 *        exports/mockups/<producto>/<producto>-estado-N.png   <- high-res still per state (3x)
 *        exports/mockups/<producto>/<producto>.mp4            <- full scroll animation as video
 *
 * The mockups are the LivingPreview components, which only exist as live HTML — they are
 * captured via headless Chromium driving /export-stage, then encoded with ffmpeg.
 *
 * Requirements: a dev server running at BASE (default http://localhost:4321),
 * `playwright` installed, and `ffmpeg` on PATH.
 *
 * Run:  npm run assets:export
 */

import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { cp, mkdir, rm, readdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'exports');
const BASE = process.env.EXPORT_BASE || 'http://localhost:4321';

// Each product mockup + how to frame it for the video canvas (centered on dark bg).
// stillKeyframes sit on the plateau of each crossfade state so every PNG is a clean state.
// vw/vh sized to comfortably contain the #capture element (measured constant per state).
const COMPONENTS = [
  { key: 'dashboard', label: 'Dashboard Web', vw: 1340, vh: 1080, stills: [0.15, 0.37, 0.62, 0.88, 0.99] },
  { key: 'pos', label: 'POS', vw: 1260, vh: 1000, stills: [0.12, 0.37, 0.62, 0.88, 0.99] },
  { key: 'ai', label: 'Asistente IA', vw: 980, vh: 1220, stills: [0.15, 0.37, 0.62, 0.88, 0.99] },
  { key: 'widget', label: 'Booking Widget', vw: 1160, vh: 940, stills: [0.12, 0.37, 0.62, 0.88, 0.99] },
  { key: 'tpv', label: 'TPV', vw: 820, vh: 720, stills: [0.12, 0.4, 0.65, 0.9, 0.99] },
  { key: 'qr', label: 'QR', vw: 640, vh: 760, stills: [0.12, 0.4, 0.65, 0.9, 0.99] },
];

const VIDEO_FRAMES = 160; // frames swept 0 -> 1
const VIDEO_FPS = 30;

function run(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: 'inherit', ...opts });
    p.on('error', reject);
    p.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} exited ${code}`))));
  });
}

async function waitForServer() {
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(`${BASE}/export-stage?c=dashboard&p=0`);
      if (res.ok) return;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Dev server not reachable at ${BASE}. Start it with: npm run dev`);
}

async function settle(page, p) {
  await page.evaluate((v) => window.__avoSetProgress(v), p);
  // two animation frames so framer-motion flushes derived values to the DOM
  await page.evaluate(
    () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
  );
}

// ── 1. Copy real assets ────────────────────────────────────────────────────
async function copyRealAssets() {
  console.log('\n[1/3] Copiando assets reales (videos + imagenes)...');

  // Videos
  const videosOut = path.join(OUT, 'videos-reales');
  await mkdir(videosOut, { recursive: true });
  for (const f of await readdir(path.join(ROOT, 'public'))) {
    if (/\.(webm|mp4|mov)$/i.test(f)) {
      await cp(path.join(ROOT, 'public', f), path.join(videosOut, f));
      console.log(`   video  ${f}`);
    }
  }

  // src/assets (hero tiles, industry, tpv slides) — preserve structure
  const assetsOut = path.join(OUT, 'imagenes-reales');
  await cp(path.join(ROOT, 'src', 'assets'), path.join(assetsOut, 'assets'), { recursive: true });

  // public images (logos, terminals) — skip fonts/favicon noise is fine to keep
  const publicImgOut = path.join(assetsOut, 'public');
  await mkdir(publicImgOut, { recursive: true });
  for (const f of await readdir(path.join(ROOT, 'public'))) {
    if (/\.(png|jpe?g|webp|avif|svg)$/i.test(f)) {
      await cp(path.join(ROOT, 'public', f), path.join(publicImgOut, f));
    }
  }
  console.log('   imagenes reales copiadas (src/assets + public)');
}

// ── 2. Capture mockup stills (high-res PNG per state) ───────────────────────
async function captureStills(browser) {
  console.log('\n[2/3] Capturando PNGs de mockups (3x, con marco)...');
  const ctx = await browser.newContext({ deviceScaleFactor: 3 });
  const page = await ctx.newPage();

  for (const c of COMPONENTS) {
    const dir = path.join(OUT, 'mockups', c.key);
    await mkdir(dir, { recursive: true });
    await page.setViewportSize({ width: c.vw, height: c.vh });
    await page.goto(`${BASE}/export-stage?c=${c.key}&p=0`, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => window.__avoReady === true);
    await page.evaluate(() => document.fonts.ready);

    let n = 1;
    for (const p of c.stills) {
      await settle(page, p);
      await page.waitForTimeout(120);
      const file = path.join(dir, `${c.key}-estado-${n}.png`);
      await page.locator('#capture').screenshot({ path: file });
      console.log(`   PNG  ${c.key}-estado-${n}.png  (p=${p})`);
      n++;
    }
  }
  await ctx.close();
}

// ── 3. Capture mockup video (sweep progress, encode with ffmpeg) ────────────
async function captureVideos(browser) {
  console.log('\n[3/3] Grabando videos de mockups (barrido 0->1 + ffmpeg)...');
  const ctx = await browser.newContext({ deviceScaleFactor: 2 });
  const page = await ctx.newPage();

  for (const c of COMPONENTS) {
    const dir = path.join(OUT, 'mockups', c.key);
    await mkdir(dir, { recursive: true });
    const framesDir = path.join(dir, '_frames');
    await rm(framesDir, { recursive: true, force: true });
    await mkdir(framesDir, { recursive: true });

    await page.setViewportSize({ width: c.vw, height: c.vh });
    await page.goto(`${BASE}/export-stage?c=${c.key}&p=0`, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => window.__avoReady === true);
    await page.evaluate(() => document.fonts.ready);

    const capture = page.locator('#capture');
    for (let i = 0; i < VIDEO_FRAMES; i++) {
      const p = i / (VIDEO_FRAMES - 1);
      await settle(page, p);
      // #capture is a constant size per component (measured) => tight crop, ffmpeg-safe
      await capture.screenshot({
        path: path.join(framesDir, `frame-${String(i).padStart(4, '0')}.png`),
      });
    }
    console.log(`   ${VIDEO_FRAMES} frames -> encoding ${c.key}.mp4`);

    await run('ffmpeg', [
      '-y',
      '-framerate', String(VIDEO_FPS),
      '-i', path.join(framesDir, 'frame-%04d.png'),
      '-c:v', 'libx264',
      '-pix_fmt', 'yuv420p',
      '-crf', '18',
      '-vf', "scale='min(1920,iw)':-2",
      '-movflags', '+faststart',
      path.join(dir, `${c.key}.mp4`),
    ]);
    await rm(framesDir, { recursive: true, force: true });
  }
  await ctx.close();
}

async function writeReadme() {
  const lines = [
    '# Assets Avoqado para Marketing',
    '',
    `Generado: ${new Date().toISOString()}`,
    '',
    '## Estructura',
    '',
    '- `videos-reales/` — videos del sitio (.webm)',
    '- `imagenes-reales/` — imagenes del sitio (hero, industrias, terminales, logos)',
    '- `mockups/<producto>/` — vistas del producto hechas con HTML, capturadas con marco de dispositivo:',
    '    - `<producto>-estado-N.png` — captura de cada estado en alta resolucion (3x)',
    '    - `<producto>.mp4` — animacion completa del recorrido',
    '',
    '## Productos',
    ...COMPONENTS.map((c) => `- **${c.label}** (\`${c.key}\`) — ${c.stills.length} estados + video`),
    '',
    'Regenerar: `npm run dev` y en otra terminal `npm run assets:export`.',
    '',
  ];
  await writeFile(path.join(OUT, 'README.md'), lines.join('\n'));
}

async function main() {
  if (!existsSync(path.join(ROOT, 'node_modules', 'playwright'))) {
    throw new Error('Falta playwright. Instala con: npm install');
  }
  await waitForServer();
  await rm(path.join(OUT, 'mockups'), { recursive: true, force: true });
  await mkdir(OUT, { recursive: true });

  await copyRealAssets();

  const browser = await chromium.launch();
  try {
    await captureStills(browser);
    await captureVideos(browser);
  } finally {
    await browser.close();
  }

  await writeReadme();
  console.log(`\n✓ Listo. Assets en: ${OUT}`);
}

main().catch((err) => {
  console.error('\n✗ Error:', err.message);
  process.exit(1);
});
