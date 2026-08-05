const express = require('express');
const prisma = require('../config/database');
const { authenticate, requireAdmin } = require('../middleware/auth');
const router = express.Router();

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = search ? { name: { contains: search } } : {};
    const [people, total] = await Promise.all([
      prisma.person.findMany({
        where, skip, take: parseInt(limit), orderBy: { name: 'asc' },
        include: { _count: { select: { movieCastRoles: true, movieCrewRoles: true } } }
      }),
      prisma.person.count({ where })
    ]);
    res.json({ people, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:slug', async (req, res) => {
  try {
    const person = await prisma.person.findUnique({
      where: { slug: req.params.slug },
      include: {
        movieCastRoles: { include: { movie: { select: { id: true, title: true, slug: true, posterUrl: true, releaseDate: true } } }, orderBy: { order: 'asc' }, take: 30 },
        movieCrewRoles: { include: { movie: { select: { id: true, title: true, slug: true, posterUrl: true, releaseDate: true } } }, take: 30 },
        seriesCastRoles: { include: { series: { select: { id: true, title: true, slug: true, posterUrl: true } } }, orderBy: { order: 'asc' }, take: 20 },
        seriesCrewRoles: { include: { series: { select: { id: true, title: true, slug: true, posterUrl: true } } }, take: 20 }
      }
    });
    if (!person) return res.status(404).json({ error: 'Person not found' });
    res.json(person);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, photoUrl, biography, birthDate, birthPlace, deathDate, height, knownFor } = req.body;
    const slug = slugify(name) + '-' + Date.now().toString(36);
    const person = await prisma.person.create({
      data: { name, slug, photoUrl, biography, birthDate: birthDate ? new Date(birthDate) : null, birthPlace, deathDate: deathDate ? new Date(deathDate) : null, height, knownFor }
    });
    res.status(201).json(person);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.name) data.slug = slugify(data.name) + '-' + Date.now().toString(36);
    if (data.birthDate) data.birthDate = new Date(data.birthDate);
    const person = await prisma.person.update({ where: { id: req.params.id }, data });
    res.json(person);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  await prisma.person.delete({ where: { id: req.params.id } });
  res.json({ message: 'Person deleted' });
});

module.exports = router;
