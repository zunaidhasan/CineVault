const express = require('express');
const prisma = require('../config/database');
const { authenticate, requireAdmin } = require('../middleware/auth');
const router = express.Router();

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

router.get('/', async (_req, res) => {
  const companies = await prisma.productionCompany.findMany({ orderBy: { name: 'asc' }, include: { _count: { select: { movies: true, series: true } } } });
  res.json(companies);
});

router.get('/:slug', async (req, res) => {
  const company = await prisma.productionCompany.findUnique({
    where: { slug: req.params.slug },
    include: {
      movies: { include: { movie: { select: { id: true, title: true, slug: true, posterUrl: true, releaseDate: true, imdbRating: true } } }, take: 50 },
      series: { include: { series: { select: { id: true, title: true, slug: true, posterUrl: true, firstAirDate: true, imdbRating: true } } }, take: 50 }
    }
  });
  if (!company) return res.status(404).json({ error: 'Company not found' });
  res.json(company);
});

router.post('/', authenticate, requireAdmin, async (req, res) => {
  const { name, logoUrl } = req.body;
  const company = await prisma.productionCompany.create({ data: { name, slug: slugify(name), logoUrl } });
  res.status(201).json(company);
});

router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  const data = { ...req.body };
  if (data.name) data.slug = slugify(data.name);
  const company = await prisma.productionCompany.update({ where: { id: req.params.id }, data });
  res.json(company);
});

router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  await prisma.productionCompany.delete({ where: { id: req.params.id } });
  res.json({ message: 'Company deleted' });
});

module.exports = router;
