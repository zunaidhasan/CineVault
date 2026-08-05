const express = require('express');
const prisma = require('../config/database');
const { authenticate, requireAdmin } = require('../middleware/auth');
const router = express.Router();

router.get('/', async (_req, res) => { res.json(await prisma.language.findMany({ orderBy: { name: 'asc' } })); });
router.post('/', authenticate, requireAdmin, async (req, res) => {
  res.status(201).json(await prisma.language.create({ data: req.body }));
});
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  await prisma.language.delete({ where: { id: req.params.id } });
  res.json({ message: 'Deleted' });
});
module.exports = router;
