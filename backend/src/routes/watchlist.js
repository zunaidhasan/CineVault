const express = require('express');
const prisma = require('../config/database');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  const items = await prisma.watchlist.findMany({
    where: { userId: req.user.id },
    include: {
      movie: { select: { id: true, title: true, slug: true, posterUrl: true, releaseDate: true, imdbRating: true } },
      series: { select: { id: true, title: true, slug: true, posterUrl: true, firstAirDate: true, imdbRating: true } }
    },
    orderBy: { addedAt: 'desc' }
  });
  res.json(items);
});

router.post('/', authenticate, async (req, res) => {
  const { movieId, seriesId } = req.body;
  if (!movieId && !seriesId) return res.status(400).json({ error: 'movieId or seriesId required' });
  const existing = await prisma.watchlist.findFirst({ where: { userId: req.user.id, movieId: movieId || null, seriesId: seriesId || null } });
  if (existing) return res.status(409).json({ error: 'Already in watchlist' });
  const item = await prisma.watchlist.create({ data: { userId: req.user.id, movieId, seriesId } });
  res.status(201).json(item);
});

router.delete('/:id', authenticate, async (req, res) => {
  const item = await prisma.watchlist.findUnique({ where: { id: req.params.id } });
  if (!item || item.userId !== req.user.id) return res.status(403).json({ error: 'Not authorized' });
  await prisma.watchlist.delete({ where: { id: req.params.id } });
  res.json({ message: 'Removed from watchlist' });
});

router.get('/check', authenticate, async (req, res) => {
  const { movieId, seriesId } = req.query;
  const item = await prisma.watchlist.findFirst({ where: { userId: req.user.id, movieId: movieId || null, seriesId: seriesId || null } });
  res.json({ isInWatchlist: !!item });
});

module.exports = router;
