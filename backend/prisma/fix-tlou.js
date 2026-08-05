const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

async function main() {
  const url =
    'https://m.media-amazon.com/images/M/MV5BZGUzYTI3M2EtZmM0Yy00NGUyLWI4ODEtN2Q3ZGJlYzhhZjU3XkEyXkFqcGdeQXVyNTM0OTY1OQ@@._V1_.jpg';
  const file = path.join(
    __dirname,
    '..',
    '..',
    'frontend',
    'public',
    'posters',
    'the-last-of-us.jpg'
  );
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  console.log('HTTP', res.status, res.headers.get('content-type'), res.headers.get('content-length'));
  if (!res.ok) {
    console.log('FAILED');
    return;
  }
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(file, buf);
  console.log('saved', (buf.length / 1024).toFixed(0) + 'KB', 'magic:', buf.slice(0, 3).toString());
  await prisma.tVSeries.updateMany({
    where: { slug: 'the-last-of-us' },
    data: { posterUrl: '/posters/the-last-of-us.jpg' },
  });
  console.log('DB updated');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
