const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const PEOPLE_DIR = path.join(__dirname, '..', '..', 'frontend', 'public', 'people');

async function main() {
  const allPeople = await prisma.person.findMany({ select: { id: true, name: true, slug: true, photoUrl: true } });
  const movieCast = await prisma.movieCast.findMany({ select: { personId: true } });
  const seriesCast = await prisma.seriesCast.findMany({ select: { personId: true } });
  const movieCrew = await prisma.movieCrew.findMany({ select: { personId: true } });
  const seriesCrew = await prisma.seriesCrew.findMany({ select: { personId: true } });
  const used = new Set([...movieCast, ...seriesCast, ...movieCrew, ...seriesCrew].map((r) => r.personId));

  const orphans = allPeople.filter((p) => !used.has(p.id));
  if (orphans.length === 0) {
    console.log('No orphaned people found — nothing to do.');
    return;
  }

  for (const p of orphans) {
    // Cascade deletes any leftover cast/crew rows (should be none)
    await prisma.person.delete({ where: { id: p.id } });
    // Remove the person's photo file(s) from public/people
    if (p.photoUrl && p.photoUrl.startsWith('/people/')) {
      const file = path.join(PEOPLE_DIR, path.basename(p.photoUrl));
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
        console.log(`✗ deleted ${p.name} (${p.photoUrl} removed)`);
        continue;
      }
    }
    console.log(`✗ deleted ${p.name}`);
  }

  const remaining = await prisma.person.count();
  console.log(`\nPeople remaining in directory: ${remaining}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
