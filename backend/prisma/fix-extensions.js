const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const ROOT = path.join(__dirname, '..', '..');
const dirs = [
  { dir: path.join(ROOT, 'frontend', 'public', 'posters'), table: 'poster' },
  { dir: path.join(ROOT, 'frontend', 'public', 'people'), table: 'people' },
];

function detectType(buf) {
  if (buf.length < 4) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'jpg';
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return 'png';
  const head = buf.slice(0, 200).toString('latin1');
  if (head.includes('<svg')) return 'svg';
  if (head.startsWith('<?xml') && head.includes('<svg')) return 'svg';
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46) return 'gif';
  if (buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46) return 'webp';
  return null;
}

async function main() {
  let fixed = 0;
  for (const { dir, table } of dirs) {
    for (const file of fs.readdirSync(dir)) {
      const full = path.join(dir, file);
      const stat = fs.statSync(full);
      if (!stat.isFile()) continue;
      const ext = path.extname(file).slice(1).toLowerCase();
      if (ext === 'svg') continue; // intentional SVGs
      const buf = fs.readFileSync(full);
      const real = detectType(buf);
      if (!real) {
        console.log(`⚠ unknown type: ${file} (${buf.length}B)`);
        continue;
      }
      if (real !== ext) {
        const base = path.basename(file, '.' + ext);
        const newFile = base + '.' + real;
        fs.renameSync(full, path.join(dir, newFile));
        console.log(`✎ ${file} → ${newFile} (was ${ext}, is ${real})`);
        const publicPath = '/' + path.basename(dir) + '/' + newFile;
        if (table === 'poster') {
          // match by slug = base (movies & series share this folder)
          await prisma.movie.updateMany({ where: { posterUrl: { contains: base } }, data: { posterUrl: publicPath } });
          await prisma.tVSeries.updateMany({ where: { posterUrl: { contains: base } }, data: { posterUrl: publicPath } });
        } else {
          await prisma.person.updateMany({ where: { photoUrl: { contains: base } }, data: { photoUrl: publicPath } });
        }
        fixed++;
      }
    }
  }
  console.log(`\nFixed ${fixed} file(s).`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
