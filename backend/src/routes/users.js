const express = require('express');
const prisma = require('../config/database');
const router = express.Router();

router.get('/:username', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { username: req.params.username },
      select: {
        id: true, username: true, fullName: true, avatarUrl: true, bio: true, role: true, createdAt: true,
        _count: { select: { reviews: true, ratings: true, watchlist: true, favorites: true } }
      }
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    const recentRatings = await prisma.rating.findMany({
      where: { userId: user.id }, orderBy: { createdAt: 'desc' }, take: 10,
      include: { movie: { select: { title: true, slug: true, posterUrl: true, imdbRating: true } }, series: { select: { title: true, slug: true, posterUrl: true, imdbRating: true } } }
    });
    const recentReviews = await prisma.review.findMany({
      where: { userId: user.id, isApproved: true }, orderBy: { createdAt: 'desc' }, take: 5,
      include: { movie: { select: { title: true, slug: true } }, series: { select: { title: true, slug: true } } }
    });
    res.json({ ...user, recentRatings, recentReviews, reviewCount: user._count.reviews, _count: undefined });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
