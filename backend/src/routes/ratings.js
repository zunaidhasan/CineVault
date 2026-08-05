const express = require('express');
const prisma = require('../config/database');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

router.post('/', authenticate, async (req, res) => {
  try {
    const { movieId, seriesId, score } = req.body;
    if (!score || score < 0 || score > 10) return res.status(400).json({ error: 'Score must be between 0 and 10' });
    const existing = await prisma.rating.findFirst({ where: { userId: req.user.id, movieId: movieId || null, seriesId: seriesId || null } });
    let rating;
    if (existing) {
      rating = await prisma.rating.update({ where: { id: existing.id }, data: { score } });
    } else {
      rating = await prisma.rating.create({ data: { userId: req.user.id, movieId, seriesId, score } });
    }
    // Recalculate average
    if (movieId) {
      const agg = await prisma.rating.aggregate({ where: { movieId }, _avg: { score: true }, _count: true });
      await prisma.movie.update({ where: { id: movieId }, data: { imdbRating: agg._avg.score } });
    }
    if (seriesId) {
      const agg = await prisma.rating.aggregate({ where: { seriesId }, _avg: { score: true }, _count: true });
      await prisma.tVSeries.update({ where: { id: seriesId }, data: { imdbRating: agg._avg.score } });
    }
    res.json(rating);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/my', authenticate, async (req, res) => {
  const ratings = await prisma.rating.findMany({
    where: { userId: req.user.id },
    include: { movie: { select: { title: true, slug: true, posterUrl: true } }, series: { select: { title: true, slug: true, posterUrl: true } } }
  });
  res.json(ratings);
});

// Get current user's rating for a specific movie/series
router.get('/status', authenticate, async (req, res) => {
  const { movieId, seriesId } = req.query;
  const rating = await prisma.rating.findFirst({
    where: { userId: req.user.id, movieId: movieId || null, seriesId: seriesId || null }
  });
  res.json({ score: rating?.score || null });
});

module.exports = router;
