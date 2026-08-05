/**
 * Production-ready media enrichment:
 * - Downloads real movie posters (missing ones) from Wikipedia
 * - Downloads real TV series posters from Wikipedia
 * - Downloads real celebrity photos from Wikipedia
 * - Generates branded SVG posters for fictional upcoming titles
 * - Generates initial-based SVG avatars for users without one
 * - Updates the SQLite database with the new /posters, /people, /avatars paths
 */
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

const ROOT = path.join(__dirname, '..', '..');
const POSTER_DIR = path.join(ROOT, 'frontend', 'public', 'posters');
const PEOPLE_DIR = path.join(ROOT, 'frontend', 'public', 'people');
const AVATAR_DIR = path.join(ROOT, 'frontend', 'public', 'avatars');

for (const dir of [POSTER_DIR, PEOPLE_DIR, AVATAR_DIR]) {
  fs.mkdirSync(dir, { recursive: true });
}

const UA = 'CineVaultDev/1.0 (local dev enrichment)';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function wikiImage(title, attempts = 3) {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': UA } });
      if (res.status === 429) {
        const wait = parseInt(res.headers.get('retry-after') || '5', 10) * 1000 || 5000;
        console.log(`  ⏳ wiki rate-limited, waiting ${wait / 1000}s (attempt ${i + 1}/${attempts})`);
        await sleep(wait);
        continue;
      }
      if (!res.ok) return null;
      const j = await res.json();
      const img = (j.originalimage && j.originalimage.source) || (j.thumbnail && j.thumbnail.source) || null;
      return img;
    } catch (e) {
      await sleep(2000 * (i + 1));
    }
  }
  console.error('  ⚠ wiki lookup gave up:', title);
  return null;
}

function clean(u) {
  return u ? u.split('?')[0] : u;
}

function avatarSized(u) {
  // Wikimedia thumb URLs look like .../3840px-File.jpg — downscale for avatars
  return u.replace(/\/\d+px-/, '/640px-');
}

async function download(url, filePath, attempts = 3) {
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': UA } });
      if (res.status === 429) {
        const wait = parseInt(res.headers.get('retry-after') || '5', 10) * 1000 || 5000;
        console.log(`  ⏳ download rate-limited, waiting ${wait / 1000}s (attempt ${i + 1}/${attempts})`);
        await sleep(wait);
        continue;
      }
      if (!res.ok) return false;
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 2000) return false; // reject tiny/error payloads
      fs.writeFileSync(filePath, buf);
      return true;
    } catch (e) {
      await sleep(2000 * (i + 1));
    }
  }
  console.error('  ⚠ download gave up:', url);
  return false;
}

function alreadyHasPoster(dbUrl) {
  if (!dbUrl) return false;
  const file = path.join(POSTER_DIR, path.basename(dbUrl));
  return fs.existsSync(file) && fs.statSync(file).size > 2000;
}

function alreadyHasPhoto(dbUrl) {
  if (!dbUrl) return false;
  const file = path.join(PEOPLE_DIR, path.basename(dbUrl));
  return fs.existsSync(file) && fs.statSync(file).size > 2000;
}

// ---------------------------------------------------------------------------
// 1) Movies missing posters
// ---------------------------------------------------------------------------
const MOVIES = [
  { slug: 'parasite-2019', wiki: 'Parasite (2019 film)' },
  { slug: 'pulp-fiction', wiki: 'Pulp Fiction' },
  { slug: 'everything-everywhere-all-at-once', wiki: 'Everything Everywhere All at Once' },
];

// ---------------------------------------------------------------------------
// 2) Series — all missing posters
// ---------------------------------------------------------------------------
const SERIES = [
  { slug: 'breaking-bad', wiki: 'Breaking Bad' },
  { slug: 'stranger-things', wiki: 'Stranger Things' },
  { slug: 'the-last-of-us', wiki: 'The Last of Us (TV series)' },
  { slug: 'succession', wiki: 'Succession (TV series)' },
  { slug: 'the-crown', wiki: 'The Crown (TV series)' },
];

// ---------------------------------------------------------------------------
// 3) People — all missing photos
// ---------------------------------------------------------------------------
const PEOPLE = [
  { slug: 'christopher-nolan', wiki: 'Christopher Nolan' },
  { slug: 'cillian-murphy', wiki: 'Cillian Murphy' },
  { slug: 'denis-villeneuve', wiki: 'Denis Villeneuve' },
  { slug: 'florence-pugh', wiki: 'Florence Pugh' },
  { slug: 'greta-gerwig', wiki: 'Greta Gerwig' },
  { slug: 'leonardo-dicaprio', wiki: 'Leonardo DiCaprio' },
  { slug: 'margot-robbie', wiki: 'Margot Robbie' },
  { slug: 'quentin-tarantino', wiki: 'Quentin Tarantino' },
  { slug: 'robert-downey-jr', wiki: 'Robert Downey Jr.' },
  { slug: 'ryan-gosling', wiki: 'Ryan Gosling' },
  { slug: 'timothee-chalamet', wiki: 'Timothée Chalamet' },
  { slug: 'zendaya', wiki: 'Zendaya' },
];

// ---------------------------------------------------------------------------
// Branded SVG poster for fictional upcoming titles
// ---------------------------------------------------------------------------
function svgPoster(title, tagline, colors) {
  const safeTitle = title
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  const words = safeTitle.split(' ');
  let tspans = '';
  words.forEach((w, i) => {
    const y = 430 + i * 64;
    const size = Math.min(58, Math.max(30, Math.round(420 / words.length / (w.length * 0.55))));
    tspans += `<text x="300" y="${y}" text-anchor="middle" font-family="Georgia, serif" font-size="${size}" font-weight="bold" fill="#ffffff" letter-spacing="2">${w}</text>`;
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="900" viewBox="0 0 600 900">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${colors[0]}"/>
      <stop offset="55%" stop-color="${colors[1]}"/>
      <stop offset="100%" stop-color="${colors[2]}"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="42%" r="50%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="600" height="900" fill="url(#bg)"/>
  <rect width="600" height="900" fill="url(#glow)"/>
  <rect x="24" y="24" width="552" height="852" fill="none" stroke="#ffffff" stroke-opacity="0.35" stroke-width="1.5"/>
  <rect x="28" y="28" width="544" height="844" fill="none" stroke="#ffffff" stroke-opacity="0.12" stroke-width="0.75"/>
  <circle cx="300" cy="300" r="150" fill="none" stroke="#f5c518" stroke-opacity="0.45" stroke-width="2"/>
  <circle cx="300" cy="300" r="118" fill="none" stroke="#f5c518" stroke-opacity="0.25" stroke-width="1"/>
  <text x="300" y="150" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" letter-spacing="8" fill="#f5c518">CINEVAULT</text>
  ${tspans}
  <text x="300" y="680" text-anchor="middle" font-family="Georgia, serif" font-size="20" font-style="italic" fill="#d1d5db">${tagline}</text>
  <rect x="210" y="730" width="180" height="44" rx="22" fill="none" stroke="#f5c518" stroke-width="1.5"/>
  <text x="300" y="758" text-anchor="middle" font-family="Arial, sans-serif" font-size="15" letter-spacing="4" fill="#f5c518">COMING SOON</text>
  <text x="300" y="830" text-anchor="middle" font-family="Arial, sans-serif" font-size="13" letter-spacing="2" fill="#9ca3af">IN THEATERS SOON</text>
</svg>`;
}

async function makeSvgPoster(slug, title, tagline, colors) {
  const filePath = path.join(POSTER_DIR, `${slug}.svg`);
  fs.writeFileSync(filePath, svgPoster(title, tagline, colors));
  return `/posters/${slug}.svg`;
}

// ---------------------------------------------------------------------------
// Initial-based SVG avatar
// ---------------------------------------------------------------------------
function svgAvatar(initials, colorA, colorB) {
  const safe = initials.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${colorA}"/>
      <stop offset="100%" stop-color="${colorB}"/>
    </linearGradient>
  </defs>
  <rect width="200" height="200" fill="url(#g)"/>
  <circle cx="100" cy="76" r="34" fill="#ffffff" fill-opacity="0.22"/>
  <path d="M100 118c-30 0-48 20-52 48l-4 26h112l-4-26c-4-28-22-48-52-48z" fill="#ffffff" fill-opacity="0.22"/>
  <text x="100" y="150" text-anchor="middle" font-family="Arial, sans-serif" font-size="64" font-weight="bold" fill="#ffffff">${safe}</text>
</svg>`;
}

const PALETTES = [
  ['#7c3aed', '#4f46e5', '#1e1b4b'],
  ['#db2777', '#be185d', '#4c0519'],
  ['#0ea5e9', '#2563eb', '#0c1445'],
  ['#f59e0b', '#dc2626', '#450a0a'],
  ['#10b981', '#059669', '#022c22'],
  ['#f43f5e', '#7c3aed', '#1e0b2e'],
  ['#eab308', '#f97316', '#431407'],
  ['#22d3ee', '#6366f1', '#111827'],
];

const AVATAR_COLORS = [
  ['#f59e0b', '#dc2626'],
  ['#7c3aed', '#4f46e5'],
  ['#0ea5e9', '#2563eb'],
  ['#10b981', '#059669'],
  ['#db2777', '#be185d'],
  ['#f43f5e', '#7c3aed'],
  ['#eab308', '#f97316'],
  ['#22d3ee', '#6366f1'],
];

function initialsFrom(name) {
  const parts = String(name || 'U').trim().split(/\s+/);
  return ((parts[0]?.[0] || 'U') + (parts[1]?.[0] || '')).toUpperCase();
}

// ---------------------------------------------------------------------------
async function main() {
  let ok = 0, fail = 0;

  // --- Movies -------------------------------------------------------------
  for (const m of MOVIES) {
    const existing = await prisma.movie.findUnique({ where: { slug: m.slug }, select: { id: true, title: true, posterUrl: true } });
    if (!existing) { console.log(`✗ movie ${m.slug} not found`); continue; }
    if (alreadyHasPoster(existing.posterUrl)) { console.log(`· already done: ${m.slug}`); continue; }
    const img = await wikiImage(m.wiki);
    if (!img) { console.log(`✗ no image for ${m.slug}`); fail++; continue; }
    await sleep(1200);
    const file = path.join(POSTER_DIR, `${m.slug}.jpg`);
    if (await download(clean(img), file)) {
      await prisma.movie.update({ where: { id: existing.id }, data: { posterUrl: `/posters/${m.slug}.jpg` } });
      console.log(`✓ poster ${m.slug} ← ${clean(img).slice(0, 70)}`);
      ok++;
    } else {
      console.log(`✗ download failed ${m.slug}`);
      fail++;
    }
    await sleep(800);
  }

  // --- Fictional upcoming movies → branded SVG posters ----------------------
  const upcoming = [
    { slug: 'upcoming-last-symphony', title: 'The Last Symphony', tagline: 'Every ending hides a beginning.', colors: PALETTES[1] },
    { slug: 'upcoming-eternal-horizon', title: 'Eternal Horizon', tagline: 'Beyond the edge of forever.', colors: PALETTES[2] },
  ];
  for (const u of upcoming) {
    const existing = await prisma.movie.findUnique({ where: { slug: u.slug }, select: { id: true } });
    if (!existing) { console.log(`✗ movie ${u.slug} not found`); continue; }
    const poster = await makeSvgPoster(u.slug, u.title, u.tagline, u.colors);
    await prisma.movie.update({ where: { id: existing.id }, data: { posterUrl: poster } });
    console.log(`✓ branded poster ${u.slug} → ${poster}`);
    ok++;
  }

  // --- Series --------------------------------------------------------------
  for (const s of SERIES) {
    const existing = await prisma.tVSeries.findUnique({ where: { slug: s.slug }, select: { id: true, title: true, posterUrl: true } });
    if (!existing) { console.log(`✗ series ${s.slug} not found`); continue; }
    if (alreadyHasPoster(existing.posterUrl)) { console.log(`· already done: ${s.slug}`); continue; }
    const img = await wikiImage(s.wiki);
    if (!img) { console.log(`✗ no image for ${s.slug}`); fail++; continue; }
    await sleep(1200);
    const file = path.join(POSTER_DIR, `${s.slug}.jpg`);
    if (await download(clean(img), file)) {
      await prisma.tVSeries.update({ where: { id: existing.id }, data: { posterUrl: `/posters/${s.slug}.jpg` } });
      console.log(`✓ poster ${s.slug} ← ${clean(img).slice(0, 70)}`);
      ok++;
    } else {
      console.log(`✗ download failed ${s.slug}`);
      fail++;
    }
    await sleep(800);
  }

  // --- People ---------------------------------------------------------------
  for (const p of PEOPLE) {
    const existing = await prisma.person.findUnique({ where: { slug: p.slug }, select: { id: true, name: true, photoUrl: true } });
    if (!existing) { console.log(`✗ person ${p.slug} not found`); continue; }
    if (alreadyHasPhoto(existing.photoUrl)) { console.log(`· already done: ${p.slug}`); continue; }
    const img = await wikiImage(p.wiki);
    if (!img) { console.log(`✗ no image for ${p.slug}`); fail++; continue; }
    await sleep(1200);
    const file = path.join(PEOPLE_DIR, `${p.slug}.jpg`);
    const src = avatarSized(clean(img));
    if (await download(src, file)) {
      await prisma.person.update({ where: { id: existing.id }, data: { photoUrl: `/people/${p.slug}.jpg` } });
      console.log(`✓ photo ${p.slug} ← ${src.slice(0, 70)}`);
      ok++;
    } else {
      console.log(`✗ download failed ${p.slug}`);
      fail++;
    }
    await sleep(800);
  }

  // --- User avatars ---------------------------------------------------------
  const users = await prisma.user.findMany({ select: { id: true, username: true, fullName: true, avatarUrl: true } });
  let avatars = 0;
  for (let i = 0; i < users.length; i++) {
    const u = users[i];
    if (u.avatarUrl) continue;
    const colors = AVATAR_COLORS[i % AVATAR_COLORS.length];
    const initials = initialsFrom(u.fullName || u.username);
    const file = path.join(AVATAR_DIR, `${u.username}.svg`);
    fs.writeFileSync(file, svgAvatar(initials, colors[0], colors[1]));
    await prisma.user.update({ where: { id: u.id }, data: { avatarUrl: `/avatars/${u.username}.svg` } });
    avatars++;
  }
  if (avatars > 0) console.log(`✓ generated ${avatars} user avatars`);

  console.log(`\nDone. ${ok} ok, ${fail} failed, ${avatars} avatars.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
