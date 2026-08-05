const express = require('express');
const prisma = require('../config/database');
const { authenticate, requireAdmin } = require('../middleware/auth');
const router = express.Router();

router.get('/', async (_req, res) => {
  const genres = await prisma.genre.findMany({ orderBy: { name: 'asc' }, include: { _count: { select: { movies: true, series: true } } } });
  res.json(genres);
});

router.get('/:slug', async (req, res) => {
  const genre = await prisma.genre.findUnique({
    where: { slug: req.params.slug },
    include: {
      movies: { include: { movie: { select: { id: true, title: true, slug: true, posterUrl: true, releaseDate: true, imdbRating: true } } }, take: 50 },
      series: { include: { series: { select: { id: true, title: true, slug: true, posterUrl: true, firstAirDate: true, imdbRating: true } } }, take: 50 }
    }
  });
  if (!genre) return res.status(404).json({ error: 'Genre not found' });
  res.json(genre);
});

router.post('/', authenticate, requireAdmin, async (req, res) => {
  const { name, slug } = req.body;
  const genre = await prisma.genre.create({ data: { name, slug: slug || name.toLowerCase().replace(/\s+/g, '-') } });
  res.status(201).json(genre);
});

router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  const genre = await prisma.genre.update({ where: { id: req.params.id }, data: req.body });
  res.json(genre);
});

router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  await prisma.genre.delete({ where: { id: req.params.id } });
  res.json({ message: 'Genre deleted' });
});

module.exports = router;
