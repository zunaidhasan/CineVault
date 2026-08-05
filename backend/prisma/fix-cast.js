/**
 * Fix seed cast/crew data so it matches the real movies & TV series.
 * - Adds missing Person records (with real photos + bio from Wikipedia)
 * - Deletes and recreates MovieCast / MovieCrew / SeriesCast rows correctly
 * Resumable: people who already have a photoUrl are skipped.
 */
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const PEOPLE_DIR = path.join(__dirname, '..', '..', 'frontend', 'public', 'people');
fs.mkdirSync(PEOPLE_DIR, { recursive: true });

const UA = 'CineVaultDev/1.0 (local dev cast enrichment)';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------------------------------------------------------------------------
// People to add (slug → name, wiki title for photo, knownFor)
// ---------------------------------------------------------------------------
const PEOPLE = {
  'joseph-gordon-levitt': { name: 'Joseph Gordon-Levitt', wiki: 'Joseph Gordon-Levitt', knownFor: 'Acting' },
  'elliot-page': { name: 'Elliot Page', wiki: 'Elliot Page', knownFor: 'Acting' },
  'tom-hardy': { name: 'Tom Hardy', wiki: 'Tom Hardy', knownFor: 'Acting' },
  'marion-cotillard': { name: 'Marion Cotillard', wiki: 'Marion Cotillard', knownFor: 'Acting' },
  'christian-bale': { name: 'Christian Bale', wiki: 'Christian Bale', knownFor: 'Acting' },
  'heath-ledger': { name: 'Heath Ledger', wiki: 'Heath Ledger', knownFor: 'Acting' },
  'aaron-eckhart': { name: 'Aaron Eckhart', wiki: 'Aaron Eckhart', knownFor: 'Acting' },
  'michael-caine': { name: 'Michael Caine', wiki: 'Michael Caine', knownFor: 'Acting' },
  'gary-oldman': { name: 'Gary Oldman', wiki: 'Gary Oldman', knownFor: 'Acting' },
  'matthew-mcconaughey': { name: 'Matthew McConaughey', wiki: 'Matthew McConaughey', knownFor: 'Acting' },
  'anne-hathaway': { name: 'Anne Hathaway', wiki: 'Anne Hathaway', knownFor: 'Acting' },
  'jessica-chastain': { name: 'Jessica Chastain', wiki: 'Jessica Chastain', knownFor: 'Acting' },
  'matt-damon': { name: 'Matt Damon', wiki: 'Matt Damon', knownFor: 'Acting' },
  'rebecca-ferguson': { name: 'Rebecca Ferguson', wiki: 'Rebecca Ferguson (actress)', knownFor: 'Acting' },
  'oscar-isaac': { name: 'Oscar Isaac', wiki: 'Oscar Isaac', knownFor: 'Acting' },
  'jason-momoa': { name: 'Jason Momoa', wiki: 'Jason Momoa', knownFor: 'Acting' },
  'javier-bardem': { name: 'Javier Bardem', wiki: 'Javier Bardem', knownFor: 'Acting' },
  'america-ferrera': { name: 'America Ferrera', wiki: 'America Ferrera', knownFor: 'Acting' },
  'simu-liu': { name: 'Simu Liu', wiki: 'Simu Liu', knownFor: 'Acting' },
  'kate-mckinnon': { name: 'Kate McKinnon', wiki: 'Kate McKinnon', knownFor: 'Acting' },
  'emily-blunt': { name: 'Emily Blunt', wiki: 'Emily Blunt', knownFor: 'Acting' },
  'robert-pattinson': { name: 'Robert Pattinson', wiki: 'Robert Pattinson', knownFor: 'Acting' },
  'zoe-kravitz': { name: 'Zoë Kravitz', wiki: 'Zoë Kravitz', knownFor: 'Acting' },
  'paul-dano': { name: 'Paul Dano', wiki: 'Paul Dano', knownFor: 'Acting' },
  'jeffrey-wright': { name: 'Jeffrey Wright', wiki: 'Jeffrey Wright', knownFor: 'Acting' },
  'colin-farrell': { name: 'Colin Farrell', wiki: 'Colin Farrell', knownFor: 'Acting' },
  'matt-reeves': { name: 'Matt Reeves', wiki: 'Matt Reeves', knownFor: 'Directing' },
  'john-travolta': { name: 'John Travolta', wiki: 'John Travolta', knownFor: 'Acting' },
  'samuel-l-jackson': { name: 'Samuel L. Jackson', wiki: 'Samuel L. Jackson', knownFor: 'Acting' },
  'uma-thurman': { name: 'Uma Thurman', wiki: 'Uma Thurman', knownFor: 'Acting' },
  'bruce-willis': { name: 'Bruce Willis', wiki: 'Bruce Willis', knownFor: 'Acting' },
  'bong-joon-ho': { name: 'Bong Joon-ho', wiki: 'Bong Joon-ho', knownFor: 'Directing' },
  'song-kang-ho': { name: 'Song Kang-ho', wiki: 'Song Kang-ho', knownFor: 'Acting' },
  'lee-sun-kyun': { name: 'Lee Sun-kyun', wiki: 'Lee Sun-kyun', knownFor: 'Acting' },
  'cho-yeo-jeong': { name: 'Cho Yeo-jeong', wiki: 'Cho Yeo-jeong', knownFor: 'Acting' },
  'park-so-dam': { name: 'Park So-dam', wiki: 'Park So-dam', knownFor: 'Acting' },
  'choi-woo-shik': { name: 'Choi Woo-shik', wiki: 'Choi Woo-shik', knownFor: 'Acting' },
  'michelle-yeoh': { name: 'Michelle Yeoh', wiki: 'Michelle Yeoh', knownFor: 'Acting' },
  'ke-huy-quan': { name: 'Ke Huy Quan', wiki: 'Ke Huy Quan', knownFor: 'Acting' },
  'stephanie-hsu': { name: 'Stephanie Hsu', wiki: 'Stephanie Hsu', knownFor: 'Acting' },
  'jamie-lee-curtis': { name: 'Jamie Lee Curtis', wiki: 'Jamie Lee Curtis', knownFor: 'Acting' },
  'daniel-kwan': { name: 'Daniel Kwan', wiki: 'Daniel Kwan (film director)', knownFor: 'Directing' },
  'bryan-cranston': { name: 'Bryan Cranston', wiki: 'Bryan Cranston', knownFor: 'Acting' },
  'aaron-paul': { name: 'Aaron Paul', wiki: 'Aaron Paul', knownFor: 'Acting' },
  'anna-gunn': { name: 'Anna Gunn', wiki: 'Anna Gunn', knownFor: 'Acting' },
  'giancarlo-esposito': { name: 'Giancarlo Esposito', wiki: 'Giancarlo Esposito', knownFor: 'Acting' },
  'bob-odenkirk': { name: 'Bob Odenkirk', wiki: 'Bob Odenkirk', knownFor: 'Acting' },
  'millie-bobby-brown': { name: 'Millie Bobby Brown', wiki: 'Millie Bobby Brown', knownFor: 'Acting' },
  'finn-wolfhard': { name: 'Finn Wolfhard', wiki: 'Finn Wolfhard', knownFor: 'Acting' },
  'david-harbour': { name: 'David Harbour', wiki: 'David Harbour', knownFor: 'Acting' },
  'winona-ryder': { name: 'Winona Ryder', wiki: 'Winona Ryder', knownFor: 'Acting' },
  'pedro-pascal': { name: 'Pedro Pascal', wiki: 'Pedro Pascal', knownFor: 'Acting' },
  'bella-ramsey': { name: 'Bella Ramsey', wiki: 'Bella Ramsey', knownFor: 'Acting' },
  'gabriel-luna': { name: 'Gabriel Luna', wiki: 'Gabriel Luna', knownFor: 'Acting' },
  'anna-torv': { name: 'Anna Torv', wiki: 'Anna Torv', knownFor: 'Acting' },
  'nick-offerman': { name: 'Nick Offerman', wiki: 'Nick Offerman', knownFor: 'Acting' },
  'brian-cox': { name: 'Brian Cox', wiki: 'Brian Cox', knownFor: 'Acting' },
  'jeremy-strong': { name: 'Jeremy Strong', wiki: 'Jeremy Strong (actor)', knownFor: 'Acting' },
  'sarah-snook': { name: 'Sarah Snook', wiki: 'Sarah Snook', knownFor: 'Acting' },
  'kieran-culkin': { name: 'Kieran Culkin', wiki: 'Kieran Culkin', knownFor: 'Acting' },
  'matthew-macfadyen': { name: 'Matthew Macfadyen', wiki: 'Matthew Macfadyen', knownFor: 'Acting' },
  'claire-foy': { name: 'Claire Foy', wiki: 'Claire Foy', knownFor: 'Acting' },
  'matt-smith': { name: 'Matt Smith', wiki: 'Matt Smith', knownFor: 'Acting' },
  'olivia-colman': { name: 'Olivia Colman', wiki: 'Olivia Colman', knownFor: 'Acting' },
  'vanessa-kirby': { name: 'Vanessa Kirby', wiki: 'Vanessa Kirby', knownFor: 'Acting' },
};

// ---------------------------------------------------------------------------
// Correct cast/crew per title (references people by slug above or existing)
// ---------------------------------------------------------------------------
const MOVIE_CAST = {
  inception: [
    ['leonardo-dicaprio', 'Dom Cobb'],
    ['joseph-gordon-levitt', 'Arthur'],
    ['elliot-page', 'Ariadne'],
    ['tom-hardy', 'Eames'],
    ['cillian-murphy', 'Robert Fischer'],
    ['marion-cotillard', 'Mal'],
  ],
  'the-dark-knight': [
    ['christian-bale', 'Bruce Wayne'],
    ['heath-ledger', 'The Joker'],
    ['aaron-eckhart', 'Harvey Dent'],
    ['michael-caine', 'Alfred Pennyworth'],
    ['gary-oldman', 'James Gordon'],
  ],
  interstellar: [
    ['matthew-mcconaughey', 'Cooper'],
    ['anne-hathaway', 'Amelia Brand'],
    ['jessica-chastain', 'Murph'],
    ['michael-caine', 'Professor Brand'],
    ['matt-damon', 'Dr. Mann'],
  ],
  'dune-2021': [
    ['timothee-chalamet', 'Paul Atreides'],
    ['zendaya', 'Chani'],
    ['rebecca-ferguson', 'Lady Jessica'],
    ['oscar-isaac', 'Duke Leto Atreides'],
    ['jason-momoa', 'Duncan Idaho'],
  ],
  'dune-part-two': [
    ['timothee-chalamet', 'Paul Atreides'],
    ['zendaya', 'Chani'],
    ['florence-pugh', 'Princess Irulan'],
    ['rebecca-ferguson', 'Lady Jessica'],
    ['javier-bardem', 'Stilgar'],
  ],
  'barbie-2023': [
    ['margot-robbie', 'Barbie'],
    ['ryan-gosling', 'Ken'],
    ['america-ferrera', 'Gloria'],
    ['simu-liu', 'Ken'],
    ['kate-mckinnon', 'Weird Barbie'],
  ],
  oppenheimer: [
    ['cillian-murphy', 'J. Robert Oppenheimer'],
    ['robert-downey-jr', 'Lewis Strauss'],
    ['emily-blunt', 'Kitty Oppenheimer'],
    ['florence-pugh', 'Jean Tatlock'],
    ['matt-damon', 'Leslie Groves'],
  ],
  'the-batman-2022': [
    ['robert-pattinson', 'Bruce Wayne'],
    ['zoe-kravitz', 'Selina Kyle'],
    ['paul-dano', 'The Riddler'],
    ['jeffrey-wright', 'James Gordon'],
    ['colin-farrell', 'The Penguin'],
  ],
  'pulp-fiction': [
    ['john-travolta', 'Vincent Vega'],
    ['samuel-l-jackson', 'Jules Winnfield'],
    ['uma-thurman', 'Mia Wallace'],
    ['bruce-willis', 'Butch Coolidge'],
  ],
  'parasite-2019': [
    ['song-kang-ho', 'Kim Ki-taek'],
    ['lee-sun-kyun', 'Park Dong-ik'],
    ['cho-yeo-jeong', 'Yeon-kyo'],
    ['park-so-dam', 'Kim Ki-jung'],
    ['choi-woo-shik', 'Kim Ki-woo'],
  ],
  'everything-everywhere-all-at-once': [
    ['michelle-yeoh', 'Evelyn Wang'],
    ['ke-huy-quan', 'Waymond Wang'],
    ['stephanie-hsu', 'Joy Wang'],
    ['jamie-lee-curtis', 'Deirdre Beaubeirdre'],
  ],
};

const MOVIE_CREW = {
  inception: [
    ['christopher-nolan', 'Director', 'Directing'],
    ['christopher-nolan', 'Writer', 'Writing'],
  ],
  'the-dark-knight': [['christopher-nolan', 'Director', 'Directing']],
  interstellar: [
    ['christopher-nolan', 'Director', 'Directing'],
    ['christopher-nolan', 'Writer', 'Writing'],
  ],
  'dune-2021': [
    ['denis-villeneuve', 'Director', 'Directing'],
    ['denis-villeneuve', 'Writer', 'Writing'],
  ],
  'dune-part-two': [
    ['denis-villeneuve', 'Director', 'Directing'],
    ['denis-villeneuve', 'Writer', 'Writing'],
  ],
  'barbie-2023': [
    ['greta-gerwig', 'Director', 'Directing'],
    ['greta-gerwig', 'Writer', 'Writing'],
  ],
  oppenheimer: [
    ['christopher-nolan', 'Director', 'Directing'],
    ['christopher-nolan', 'Writer', 'Writing'],
  ],
  'the-batman-2022': [['matt-reeves', 'Director', 'Directing']],
  'pulp-fiction': [
    ['quentin-tarantino', 'Director', 'Directing'],
    ['quentin-tarantino', 'Writer', 'Writing'],
  ],
  'parasite-2019': [
    ['bong-joon-ho', 'Director', 'Directing'],
    ['bong-joon-ho', 'Writer', 'Writing'],
  ],
  'everything-everywhere-all-at-once': [
    ['daniel-kwan', 'Director', 'Directing'],
    ['daniel-kwan', 'Writer', 'Writing'],
  ],
};

const SERIES_CAST = {
  'breaking-bad': [
    ['bryan-cranston', 'Walter White'],
    ['aaron-paul', 'Jesse Pinkman'],
    ['anna-gunn', 'Skyler White'],
    ['giancarlo-esposito', 'Gus Fring'],
    ['bob-odenkirk', 'Saul Goodman'],
  ],
  'stranger-things': [
    ['millie-bobby-brown', 'Eleven'],
    ['finn-wolfhard', 'Mike Wheeler'],
    ['david-harbour', 'Jim Hopper'],
    ['winona-ryder', 'Joyce Byers'],
  ],
  'the-last-of-us': [
    ['pedro-pascal', 'Joel Miller'],
    ['bella-ramsey', 'Ellie Williams'],
    ['gabriel-luna', 'Tommy Miller'],
    ['anna-torv', 'Tess'],
    ['nick-offerman', 'Bill'],
  ],
  succession: [
    ['brian-cox', 'Logan Roy'],
    ['jeremy-strong', 'Kendall Roy'],
    ['sarah-snook', 'Shiv Roy'],
    ['kieran-culkin', 'Roman Roy'],
    ['matthew-macfadyen', 'Tom Wambsgans'],
  ],
  'the-crown': [
    ['claire-foy', 'Queen Elizabeth II'],
    ['matt-smith', 'Prince Philip'],
    ['olivia-colman', 'Queen Elizabeth II'],
    ['vanessa-kirby', 'Princess Margaret'],
  ],
};

// ---------------------------------------------------------------------------
// Wikipedia helpers
// ---------------------------------------------------------------------------
async function wikiSummary(title, attempts = 3) {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': UA } });
      if (res.status === 429) {
        const wait = parseInt(res.headers.get('retry-after') || '5', 10) * 1000 || 5000;
        console.log(`  ⏳ rate-limited, waiting ${wait / 1000}s`);
        await sleep(wait);
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
        await sleep(5000 * (i + 1));
        continue;
      }
      if (!res.ok) return false;
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 2000) return false;
      fs.writeFileSync(filePath, buf);
      return true;
    } catch (e) {
      await sleep(2000 * (i + 1));
    }
  }
  return false;
}

function clean(u) {
  return u ? u.split('?')[0] : u;
}

function svgAvatar(name) {
  const parts = name.trim().split(/\s+/);
  const initials = ((parts[0]?.[0] || 'U') + (parts[1]?.[0] || '')).toUpperCase();
  const palette = [
    ['#7c3aed', '#4f46e5'],
    ['#db2777', '#be185d'],
    ['#0ea5e9', '#2563eb'],
    ['#f59e0b', '#dc2626'],
    ['#10b981', '#059669'],
    ['#f43f5e', '#7c3aed'],
  ];
  const [a, b] = palette[name.length % palette.length];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${a}"/><stop offset="100%" stop-color="${b}"/></linearGradient></defs>
  <rect width="200" height="200" fill="url(#g)"/>
  <circle cx="100" cy="76" r="34" fill="#ffffff" fill-opacity="0.22"/>
  <path d="M100 118c-30 0-48 20-52 48l-4 26h112l-4-26c-4-28-22-48-52-48z" fill="#ffffff" fill-opacity="0.22"/>
  <text x="100" y="150" text-anchor="middle" font-family="Arial, sans-serif" font-size="64" font-weight="bold" fill="#ffffff">${initials}</text>
</svg>`;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  // 1) Ensure every person exists (with photo + bio)
  const personCache = new Map();
  let added = 0;

  for (const [slug, info] of Object.entries(PEOPLE)) {
    const existing = await prisma.person.findUnique({ where: { slug } });
    if (existing) {
      personCache.set(slug, existing);
      continue;
    }

    let photoUrl = null;
    let biography = null;
    const summary = await wikiSummary(info.wiki);
    if (summary) {
      if (summary.thumbnail && summary.thumbnail.source) {
        const file = path.join(PEOPLE_DIR, `${slug}.jpg`);
        if (await download(clean(summary.thumbnail.source), file)) photoUrl = `/people/${slug}.jpg`;
      }
      biography = summary.extract ? summary.extract.slice(0, 400) + (summary.extract.length > 400 ? '…' : '') : null;
    }
    if (!photoUrl) {
      const file = path.join(PEOPLE_DIR, `${slug}.svg`);
      fs.writeFileSync(file, svgAvatar(info.name));
      photoUrl = `/people/${slug}.svg`;
    }

    const person = await prisma.person.create({
      data: {
        slug,
        name: info.name,
        photoUrl,
        knownFor: info.knownFor,
        biography,
      },
    });
    personCache.set(slug, person);
    added++;
    console.log(`+ ${info.name} → ${photoUrl}`);
    await sleep(1200);
  }
  console.log(`\nPeople: ${added} added, ${personCache.size} total available.`);

  // 2) Rewrite movie cast + crew
  for (const [slug, cast] of Object.entries(MOVIE_CAST)) {
    const movie = await prisma.movie.findUnique({ where: { slug } });
    if (!movie) { console.log(`✗ movie ${slug} not found`); continue; }
    await prisma.movieCast.deleteMany({ where: { movieId: movie.id } });
    for (let i = 0; i < cast.length; i++) {
      const [pSlug, character] = cast[i];
      const person = personCache.get(pSlug) || (await prisma.person.findUnique({ where: { slug: pSlug } }));
      if (!person) { console.log(`  ⚠ missing person ${pSlug} for ${slug}`); continue; }
      await prisma.movieCast.create({
        data: { movieId: movie.id, personId: person.id, character, role: 'Actor', order: i },
      });
    }
    console.log(`✓ ${movie.title}: ${cast.length} cast`);
  }

  for (const [slug, crew] of Object.entries(MOVIE_CREW)) {
    const movie = await prisma.movie.findUnique({ where: { slug } });
    if (!movie) { console.log(`✗ movie ${slug} not found`); continue; }
    await prisma.movieCrew.deleteMany({ where: { movieId: movie.id } });
    for (const [pSlug, job, department] of crew) {
      const person = personCache.get(pSlug) || (await prisma.person.findUnique({ where: { slug: pSlug } }));
      if (!person) { console.log(`  ⚠ missing person ${pSlug} for ${slug}`); continue; }
      await prisma.movieCrew.create({
        data: { movieId: movie.id, personId: person.id, job, department },
      });
    }
    console.log(`✓ ${movie.title}: crew set`);
  }

  // 3) Rewrite series cast
  for (const [slug, cast] of Object.entries(SERIES_CAST)) {
    const series = await prisma.tVSeries.findUnique({ where: { slug } });
    if (!series) { console.log(`✗ series ${slug} not found`); continue; }
    await prisma.seriesCast.deleteMany({ where: { seriesId: series.id } });
    for (let i = 0; i < cast.length; i++) {
      const [pSlug, character] = cast[i];
      const person = personCache.get(pSlug) || (await prisma.person.findUnique({ where: { slug: pSlug } }));
      if (!person) { console.log(`  ⚠ missing person ${pSlug} for ${slug}`); continue; }
      await prisma.seriesCast.create({
        data: { seriesId: series.id, personId: person.id, character, role: 'Actor', order: i },
      });
    }
    console.log(`✓ ${series.title}: ${cast.length} cast`);
  }

  // 4) Report orphaned people (no longer in any cast/crew)
  const allPeople = await prisma.person.findMany({ select: { id: true, name: true, slug: true } });
  const movieCast = await prisma.movieCast.findMany({ select: { personId: true } });
  const seriesCast = await prisma.seriesCast.findMany({ select: { personId: true } });
  const movieCrew = await prisma.movieCrew.findMany({ select: { personId: true } });
  const used = new Set([...movieCast, ...seriesCast, ...movieCrew].map((r) => r.personId));
  const orphans = allPeople.filter((p) => !used.has(p.id));
  console.log('\nOrphaned people (no roles):', orphans.map((p) => p.name).join(', ') || 'none');

  console.log('\nDone.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
