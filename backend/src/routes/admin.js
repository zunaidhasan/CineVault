const express = require('express');
const prisma = require('../config/database');
const { authenticate, requireAdmin } = require('../middleware/auth');
const router = express.Router();

// All admin routes require admin
router.use(authenticate, requireAdmin);

// Dashboard stats
router.get('/dashboard', async (_req, res) => {
  try {
    const [movieCount, seriesCount, userCount, reviewCount, personCount, totalRatings] = await Promise.all([
      prisma.movie.count(), prisma.tVSeries.count(), prisma.user.count(),
      prisma.review.count(), prisma.person.count(), prisma.rating.count()
    ]);
    const recentUsers = await prisma.user.findMany({ orderBy: { createdAt: 'desc' }, take: 5, select: { id: true, username: true, email: true, createdAt: true } });
    const recentReviews = await prisma.review.findMany({
      orderBy: { createdAt: 'desc' }, take: 5,
      include: { user: { select: { username: true } }, movie: { select: { title: true } }, series: { select: { title: true } } }
    });
    const topMovies = await prisma.movie.findMany({ orderBy: { imdbRating: 'desc' }, take: 5, select: { id: true, title: true, slug: true, imdbRating: true } });
    res.json({ movieCount, seriesCount, userCount, reviewCount, personCount, totalRatings, recentUsers, recentReviews, topMovies });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Users CRUD
router.get('/users', async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      skip: (parseInt(page) - 1) * parseInt(limit), take: parseInt(limit), orderBy: { createdAt: 'desc' },
      select: { id: true, email: true, username: true, fullName: true, role: true, isActive: true, isVerified: true, createdAt: true, _count: { select: { reviews: true, ratings: true } } }
    }),
    prisma.user.count()
  ]);
  res.json({ users, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
});

router.patch('/users/:id', async (req, res) => {
  const { role, isActive, isVerified } = req.body;
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: { role, isActive, isVerified },
    select: { id: true, email: true, username: true, role: true, isActive: true, isVerified: true }
  });
  res.json(user);
});

router.delete('/users/:id', async (req, res) => {
  await prisma.user.delete({ where: { id: req.params.id } });
  res.json({ message: 'User deleted' });
});

// Review moderation
router.get('/reviews/pending', async (req, res) => {
  const reviews = await prisma.review.findMany({
    where: { isApproved: false },
    include: { user: { select: { username: true } }, movie: { select: { title: true } }, series: { select: { title: true } } },
    orderBy: { createdAt: 'desc' }
  });
  res.json(reviews);
});

router.patch('/reviews/:id/moderate', async (req, res) => {
  const { isApproved } = req.body;
  const review = await prisma.review.update({ where: { id: req.params.id }, data: { isApproved } });
  res.json(review);
});

module.exports = router;
