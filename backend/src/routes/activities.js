const express = require('express');
const prisma = require('../config/database');
const { authenticate, optionalAuth } = require('../middleware/auth');
const router = express.Router();

router.get('/', optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const activities = await prisma.activity.findMany({
      skip: (parseInt(page) - 1) * parseInt(limit), take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, username: true, avatarUrl: true } } }
    });
    res.json(activities);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/following', authenticate, async (req, res) => {
  try {
    const following = await prisma.follow.findMany({
      where: { followerId: req.user.id }, select: { followingId: true }
    });
    const ids = following.map(f => f.followingId);
    ids.push(req.user.id);
    const activities = await prisma.activity.findMany({
      where: { userId: { in: ids } },
      orderBy: { createdAt: 'desc' }, take: 30,
      include: { user: { select: { id: true, username: true, avatarUrl: true } } }
    });
    res.json(activities);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/user/:identifier', async (req, res) => {
  try {
    let userId = req.params.identifier;
    if (userId.length < 30 || !userId.includes('-')) {
      const user = await prisma.user.findUnique({ where: { username: userId }, select: { id: true } });
      if (!user) return res.status(404).json({ error: 'User not found' });
      userId = user.id;
    }
    const activities = await prisma.activity.findMany({
      where: { userId }, orderBy: { createdAt: 'desc' }, take: 30,
      include: { user: { select: { id: true, username: true, avatarUrl: true } } }
    });
    res.json(activities);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
