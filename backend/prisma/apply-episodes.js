const { PrismaClient } = require('@prisma/client');
const { SEASONS } = require('./series-episodes');
const prisma = new PrismaClient();

async function main() {
  let totalEpisodes = 0;
  for (const [slug, seasons] of Object.entries(SEASONS)) {
    const series = await prisma.tVSeries.findUnique({ where: { slug } });
    if (!series) {
      console.log(`✗ series ${slug} not found`);
      continue;
    }
    // Replace existing seasons/episodes for this series
    await prisma.episode.deleteMany({ where: { season: { seriesId: series.id } } });
    await prisma.season.deleteMany({ where: { seriesId: series.id } });

    for (const season of seasons) {
      const created = await prisma.season.create({
        data: {
          seriesId: series.id,
          seasonNumber: season.seasonNumber,
          title: season.title,
          overview: season.overview,
          airDate: season.airDate,
          episodeCount: season.episodeCount,
        },
      });
      await prisma.episode.createMany({
        data: season.episodes.map((e) => ({
          seasonId: created.id,
          episodeNumber: e.episodeNumber,
          title: e.title,
          overview: e.overview,
          runtime: e.runtime,
          airDate: e.airDate,
          imdbRating: e.imdbRating,
        })),
      });
      totalEpisodes += season.episodes.length;
    }
    console.log(`✓ ${series.title}: ${seasons.length} season(s) applied`);
  }
  console.log(`\nTotal episodes applied: ${totalEpisodes}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
