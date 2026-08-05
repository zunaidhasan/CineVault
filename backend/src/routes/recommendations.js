const express = require('express');
const prisma = require('../config/database');
const { optionalAuth } = require('../middleware/auth');
const router = express.Router();

router.get('/movie/:movieId', async (req, res) => {
  try {
    const movie = await prisma.movie.findUnique({
      where: { id: req.params.movieId },
      include: { genres: { include: { genre: true } }, crew: { take: 3, include: { person: true } } }
    });
    if (!movie) return res.status(404).json({ error: 'Movie not found' });

    const genreIds = movie.genres.map(g => g.genreId);
    const directorIds = movie.crew.filter(c => c.job === 'Director').map(c => c.personId);

    const similar = await prisma.movie.findMany({
      where: {
        id: { not: movie.id },
        OR: [
          { genres: { some: { genreId: { in: genreIds } } } },
          { crew: { some: { personId: { in: directorIds }, job: 'Director' } } },
        ]
      },
      include: { genres: { include: { genre: true } } },
      orderBy: { imdbRating: 'desc' }, take: 12
    });

    const scored = similar.map(m => {
      let score = 0;
      const mGenreIds = m.genres.map(g => g.genreId);
      score += mGenreIds.filter(id => genreIds.includes(id)).length * 3;
      if (directorIds.some(d => m.crew?.some(c => c.personId === d && c.job === 'Director'))) score += 10;
      score += (m.imdbRating || 7);
      return { ...m, genres: m.genres.map(g => g.genre), score };
    });

    scored.sort((a, b) => b.score - a.score);
    res.json(scored.slice(0, 8));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/user', optionalAuth, async (req, res) => {
  try {
    if (!req.user) {
      const top = await prisma.movie.findMany({
        where: { imdbRating: { not: null } }, orderBy: { imdbRating: 'desc' }, take: 8,
        include: { genres: { include: { genre: true } } }
      });
      return res.json(top.map(m => ({ ...m, genres: m.genres.map(g => g.genre) })));
    }

    const userRatings = await prisma.rating.findMany({
      where: { userId: req.user.id, movieId: { not: null } },
      include: { movie: { include: { genres: { include: { genre: true } } } } },
      orderBy: { score: 'desc' }, take: 20
    });

    if (userRatings.length === 0) {
      const top = await prisma.movie.findMany({
        where: { imdbRating: { not: null } }, orderBy: { imdbRating: 'desc' }, take: 8,
        include: { genres: { include: { genre: true } } }
      });
      return res.json(top.map(m => ({ ...m, genres: m.genres.map(g => g.genre) })));
    }

    const genreScores = {};
    const ratedIds = userRatings.map(r => r.movieId);
    for (const r of userRatings) {
      if (!r.movie) continue;
      for (const mg of r.movie.genres) {
        genreScores[mg.genreId] = (genreScores[mg.genreId] || 0) + r.score;
      }
    }

    const candidates = await prisma.movie.findMany({
      where: { id: { notIn: ratedIds }, imdbRating: { not: null } },
      include: { genres: { include: { genre: true } } },
      orderBy: { imdbRating: 'desc' }, take: 30
    });

    const scored = candidates.map(m => {
      let score = 0;
      for (const mg of m.genres) score += genreScores[mg.genreId] || 0;
      score += (m.imdbRating || 7);
      if (m.isTrending) score += 5;
      return { ...m, genres: m.genres.map(g => g.genre), score };
    });

    scored.sort((a, b) => b.score - a.score);
    res.json(scored.slice(0, 10));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
