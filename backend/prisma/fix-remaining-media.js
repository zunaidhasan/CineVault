const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const UA = 'CineVaultDev/1.0';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function dl(url, filePath, attempts = 4) {
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': UA } });
      if (res.status === 429) {
        const w = 5000 + i * 3000;
        console.log('  rate-limited, waiting ' + w / 1000 + 's');
        await sleep(w);
        continue;
      }
      if (!res.ok) {
        console.log('  HTTP ' + res.status + ' for ' + url.slice(0, 80));
        return false;
      }
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 3000) {
        console.log('  too small: ' + buf.length + 'B');
        return false;
      }
      fs.writeFileSync(filePath, buf);
      console.log('  ✓ saved ' + filePath + ' (' + (buf.length / 1024).toFixed(0) + 'KB)');
      return true;
    } catch (e) {
      await sleep(2500 * (i + 1));
    }
  }
  return false;
}

const clean = (u) => u.split('?')[0];

async function main() {
  const ROOT = path.join(__dirname, '..', '..');
  const jobs = [
    {
      slug: 'succession',
      url: 'https://upload.wikimedia.org/wikipedia/en/3/3f/Succession_season_1.jpg',
      dir: 'posters',
    },
    {
      slug: 'christopher-nolan',
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/ChristopherNolan-byPhilipRomano_%28cropped%29.jpg/960px-ChristopherNolan-byPhilipRomano_%28cropped%29.jpg',
      dir: 'people',
    },
    {
      slug: 'zendaya',
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Zendaya-byPhilipRomano.jpg/960px-Zendaya-byPhilipRomano.jpg',
      dir: 'people',
    },
  ];

  for (const j of jobs) {
    const file = path.join(ROOT, 'frontend', 'public', j.dir, j.slug + '.jpg');
    console.log('=== ' + j.slug + ' ===');
    await sleep(1500);
    if (await dl(clean(j.url), file)) {
      if (j.dir === 'posters') {
        await prisma.tVSeries.updateMany({
          where: { slug: j.slug },
          data: { posterUrl: '/posters/' + j.slug + '.jpg' },
        });
      } else {
        await prisma.person.updateMany({
          where: { slug: j.slug },
          data: { photoUrl: '/people/' + j.slug + '.jpg' },
        });
      }
      console.log('  DB updated');
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
