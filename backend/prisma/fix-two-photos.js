const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const PEOPLE_DIR = path.join(__dirname, '..', '..', 'frontend', 'public', 'people');
const UA = 'CineVaultDev/1.0';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function wikiSummary(title, attempts = 3) {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': UA } });
      if (res.status === 429) {
        await sleep(8000 * (i + 1));
        continue;
      }
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      await sleep(2500 * (i + 1));
    }
  }
  return null;
}

async function download(url, filePath, attempts = 3) {
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': UA } });
      if (res.status === 429) {
        await sleep(6000 * (i + 1));
        continue;
      }
      if (!res.ok) return false;
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 3000) return false;
      fs.writeFileSync(filePath, buf);
      return true;
    } catch (e) {
      await sleep(2000 * (i + 1));
    }
  }
  return false;
}

const clean = (u) => u.split('?')[0];

async function main() {
  const jobs = [
    { slug: 'brian-cox', titles: ['Brian Cox (actor)', 'Brian Cox'], file: 'brian-cox.jpg' },
    { slug: 'daniel-kwan', titles: ['Daniel Kwan', 'Daniel Kwan (filmmaker)', 'Daniel Kwan (film director)'], file: 'daniel-kwan.jpg' },
  ];

  for (const job of jobs) {
    const current = await prisma.person.findUnique({ where: { slug: job.slug } });
    if (!current) { console.log('✗ person', job.slug, 'not found'); continue; }
    if (current.photoUrl && !current.photoUrl.endsWith('.svg')) {
      console.log('· already has photo:', current.photoUrl);
      continue;
    }
    for (const title of job.titles) {
      await sleep(1500);
      console.log(`== ${job.slug} ← ${title} ==`);
      const s = await wikiSummary(title);
      if (!s) { console.log('  no summary'); continue; }
      const img = (s.thumbnail && s.thumbnail.source) || (s.originalimage && s.originalimage.source);
      if (!img) { console.log('  no image on page'); continue; }
      const file = path.join(PEOPLE_DIR, job.file);
      if (await download(clean(img), file)) {
        await prisma.person.update({
          where: { slug: job.slug },
          data: { photoUrl: `/people/${job.file}` },
        });
        console.log(`  ✓ ${job.slug} → /people/${job.file}`);
        break;
      }
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
