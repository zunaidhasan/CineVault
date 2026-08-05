const express = require('express');
const prisma = require('../config/database');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { q, type, page = 1, limit = 20 } = req.query;
    if (!q || q.length < 1) return res.status(400).json({ error: 'Search query required' });
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const results = { movies: [], series: [], people: [], total: 0 };

    if (!type || type === 'movie') {
      const [movies, movieCount] = await Promise.all([
        prisma.movie.findMany({
          where: { OR: [{ title: { contains: q } }, { overview: { contains: q } }] },
          skip: type ? skip : 0, take: type ? take : 5, orderBy: { imdbRating: 'desc' },
          include: { genres: { include: { genre: true } } }
        }),
        prisma.movie.count({ where: { OR: [{ title: { contains: q } }, { overview: { contains: q } }] } })
      ]);
      results.movies = movies.map(m => ({ ...m, genres: m.genres.map(g => g.genre) }));
      results.total += movieCount;
    }

    if (!type || type === 'series') {
      const [series, seriesCount] = await Promise.all([
        prisma.tVSeries.findMany({
          where: { OR: [{ title: { contains: q } }, { overview: { contains: q } }] },
          skip: type ? skip : 0, take: type ? take : 5, orderBy: { imdbRating: 'desc' },
          include: { genres: { include: { genre: true } } }
        }),
        prisma.tVSeries.count({ where: { OR: [{ title: { contains: q } }, { overview: { contains: q } }] } })
      ]);
      results.series = series.map(s => ({ ...s, genres: s.genres.map(g => g.genre) }));
      results.total += seriesCount;
    }

    if (!type || type === 'people') {
      const [people, peopleCount] = await Promise.all([
        prisma.person.findMany({ where: { name: { contains: q } }, skip: type ? skip : 0, take: type ? take : 5, orderBy: { name: 'asc' } }),
        prisma.person.count({ where: { name: { contains: q } } })
      ]);
      results.people = people;
      results.total += peopleCount;
    }

    res.json({ ...results, query: q, page: parseInt(page) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/suggestions', async (req, res) => {
  const { q } = req.query;
  if (!q || q.length < 2) return res.json([]);
  const [movies, series] = await Promise.all([
    prisma.movie.findMany({ where: { title: { contains: q } }, select: { title: true, slug: true, posterUrl: true, releaseDate: true }, take: 5 }),
    prisma.tVSeries.findMany({ where: { title: { contains: q } }, select: { title: true, slug: true, posterUrl: true, firstAirDate: true }, take: 3 })
  ]);
  res.json([...movies.map(m => ({ ...m, type: 'movie' })), ...series.map(s => ({ ...s, type: 'series' }))]);
});

module.exports = router;

// Advanced search with all filters
router.get('/advanced', async (req, res) => {
  try {
    const { q, genres, yearMin, yearMax, ratingMin, ratingMax, type, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);
    const results = { movies: [], total: 0 };

    const whereMovie = {};
    if (q) whereMovie.OR = [{ title: { contains: q } }, { overview: { contains: q } }];
    if (genres) {
      const genreSlugs = genres.split(',');
      whereMovie.genres = { some: { genre: { slug: { in: genreSlugs } } } };
    }
    if (yearMin) whereMovie.releaseDate = { ...whereMovie.releaseDate, gte: new Date(yearMin + '-01-01') };
    if (yearMax) whereMovie.releaseDate = { ...whereMovie.releaseDate, lte: new Date(yearMax + '-12-31') };
    if (ratingMin) whereMovie.imdbRating = { ...whereMovie.imdbRating, gte: parseFloat(ratingMin) };
    if (ratingMax) whereMovie.imdbRating = { ...whereMovie.imdbRating, lte: parseFloat(ratingMax) };

    if (!type || type === 'movie') {
      const [movies, count] = await Promise.all([
        prisma.movie.findMany({ where: whereMovie, skip, take, orderBy: { imdbRating: 'desc' },
          include: { genres: { include: { genre: true } } } }),
        prisma.movie.count({ where: whereMovie })
      ]);
      results.movies = movies.map(m => ({ ...m, genres: m.genres.map(g => g.genre) }));
      results.total += count;
    }

    res.json(results);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
