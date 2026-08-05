const express = require('express');
const prisma = require('../config/database');
const { authenticate, requireAdmin } = require('../middleware/auth');
const router = express.Router();

router.get('/', async (_req, res) => { res.json(await prisma.category.findMany({ orderBy: { name: 'asc' } })); });
router.post('/', authenticate, requireAdmin, async (req, res) => {
  const { name, description } = req.body;
  res.status(201).json(await prisma.category.create({ data: { name, slug: name.toLowerCase().replace(/\s+/g, '-'), description } }));
});
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  res.json(await prisma.category.update({ where: { id: req.params.id }, data: req.body }));
});
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  await prisma.category.delete({ where: { id: req.params.id } });
  res.json({ message: 'Deleted' });
});
module.exports = router;
