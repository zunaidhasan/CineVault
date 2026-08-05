const express = require('express');
const prisma = require('../config/database');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

router.post('/:userId', authenticate, async (req, res) => {
  try {
    if (req.user.id === req.params.userId) return res.status(400).json({ error: 'Cannot follow yourself' });
    await prisma.follow.create({ data: { followerId: req.user.id, followingId: req.params.userId } });
    await prisma.notification.create({
      data: { userId: req.params.userId, type: 'follow', title: 'New Follower',
        body: req.user.username + ' started following you', link: '/user/' + req.user.username }
    });
    res.status(201).json({ message: 'Followed' });
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ error: 'Already following' });
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:userId', authenticate, async (req, res) => {
  await prisma.follow.deleteMany({ where: { followerId: req.user.id, followingId: req.params.userId } });
  res.json({ message: 'Unfollowed' });
});

router.get('/:identifier/followers', async (req, res) => {
  let userId = req.params.identifier;
  try {
    if (userId.length < 30 || !userId.includes('-')) {
      const user = await prisma.user.findUnique({ where: { username: userId }, select: { id: true } });
      if (!user) return res.status(404).json({ error: 'User not found' });
      userId = user.id;
    }
    const followers = await prisma.follow.findMany({
      where: { followingId: userId },
      include: { follower: { select: { id: true, username: true, avatarUrl: true, fullName: true } } },
      orderBy: { createdAt: 'desc' }, take: 50
    });
    res.json(followers);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:identifier/following', async (req, res) => {
  let userId = req.params.identifier;
  try {
    if (userId.length < 30 || !userId.includes('-')) {
      const user = await prisma.user.findUnique({ where: { username: userId }, select: { id: true } });
      if (!user) return res.status(404).json({ error: 'User not found' });
      userId = user.id;
    }
    const following = await prisma.follow.findMany({
      where: { followerId: userId },
      include: { following: { select: { id: true, username: true, avatarUrl: true, fullName: true } } },
      orderBy: { createdAt: 'desc' }, take: 50
    });
    res.json(following);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/check/:userId', authenticate, async (req, res) => {
  const f = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId: req.user.id, followingId: req.params.userId } }
  });
  res.json({ isFollowing: !!f });
});

module.exports = router;
