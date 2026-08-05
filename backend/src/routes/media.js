const express = require('express');
const prisma = require('../config/database');
const { authenticate, requireAdmin } = require('../middleware/auth');
const router = express.Router();

router.get('/movie/:movieId', async (req, res) => {
  const media = await prisma.media.findMany({ where: { movieId: req.params.movieId }, orderBy: { order: 'asc' } });
  res.json(media);
});

router.get('/series/:seriesId', async (req, res) => {
  const media = await prisma.media.findMany({ where: { seriesId: req.params.seriesId }, orderBy: { order: 'asc' } });
  res.json(media);
});

router.post('/', authenticate, requireAdmin, async (req, res) => {
  const { movieId, seriesId, type, url, thumbnail, title, order } = req.body;
  const media = await prisma.media.create({ data: { movieId, seriesId, type, url, thumbnail, title, order: order || 0 } });
  res.status(201).json(media);
});

router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  const media = await prisma.media.update({ where: { id: req.params.id }, data: req.body });
  res.json(media);
});

router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  await prisma.media.delete({ where: { id: req.params.id } });
  res.json({ message: 'Media deleted' });
});

module.exports = router;
