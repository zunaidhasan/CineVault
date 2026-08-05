const express = require('express');
const prisma = require('../config/database');
const { authenticate, optionalAuth } = require('../middleware/auth');
const router = express.Router();

const reviewInclude = (userId) => ({
  user: { select: { id: true, username: true, avatarUrl: true } },
  ...(userId ? { votes: { where: { userId }, select: { type: true } } } : {}),
});

async function attachVoteStatus(reviews, userId) {
  if (!userId) {
    return reviews.map(r => ({ ...r, hasLiked: false, hasDisliked: false, votes: undefined }));
  }
  return reviews.map(r => {
    const vote = r.votes?.[0];
    return { ...r, hasLiked: vote?.type === 'like', hasDisliked: vote?.type === 'dislike', votes: undefined };
  });
}

router.get('/movie/:movieId', optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { movieId: req.params.movieId, isApproved: true },
        skip: (parseInt(page) - 1) * parseInt(limit), take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: reviewInclude(req.user?.id)
      }),
      prisma.review.count({ where: { movieId: req.params.movieId, isApproved: true } })
    ]);
    res.json({ reviews: await attachVoteStatus(reviews, req.user?.id), total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/series/:seriesId', optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { seriesId: req.params.seriesId, isApproved: true },
        skip: (parseInt(page) - 1) * parseInt(limit), take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: reviewInclude(req.user?.id)
      }),
      prisma.review.count({ where: { seriesId: req.params.seriesId, isApproved: true } })
    ]);
    res.json({ reviews: await attachVoteStatus(reviews, req.user?.id), total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', authenticate, async (req, res) => {
  try {
    const { movieId, seriesId, title, content, isSpoiler } = req.body;
    if (!content) return res.status(400).json({ error: 'Content required' });
    if (!movieId && !seriesId) return res.status(400).json({ error: 'MovieId or seriesId required' });
    const review = await prisma.review.create({
      data: { userId: req.user.id, movieId, seriesId, title, content, isSpoiler: isSpoiler || false },
      include: reviewInclude(req.user.id)
    });
    // Record activity
    const targetType = movieId ? 'movie' : 'series';
    const target = movieId
      ? await prisma.movie.findUnique({ where: { id: movieId }, select: { slug: true, title: true } })
      : await prisma.tVSeries.findUnique({ where: { id: seriesId }, select: { slug: true, title: true } });
    if (target) {
      await prisma.activity.create({
        data: { userId: req.user.id, type: 'review', targetType, targetId: movieId || seriesId, targetSlug: target.slug, targetTitle: target.title }
      });
    }
    res.status(201).json({ ...review, hasLiked: false, hasDisliked: false, votes: undefined });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Vote (like/dislike) — toggles, one vote per user per review
router.post('/:id/vote', authenticate, async (req, res) => {
  try {
    const { type } = req.body;
    if (!['like', 'dislike'].includes(type)) return res.status(400).json({ error: 'Type must be like or dislike' });

    const review = await prisma.review.findUnique({ where: { id: req.params.id } });
    if (!review) return res.status(404).json({ error: 'Review not found' });

    const existing = await prisma.reviewVote.findUnique({
      where: { userId_reviewId: { userId: req.user.id, reviewId: req.params.id } }
    });

    // Remove any current vote effect
    if (existing) {
      if (existing.type === 'like') await prisma.review.update({ where: { id: req.params.id }, data: { likes: { decrement: 1 } } });
      if (existing.type === 'dislike') await prisma.review.update({ where: { id: req.params.id }, data: { dislikes: { decrement: 1 } } });
      await prisma.reviewVote.delete({ where: { id: existing.id } });
    }

    let hasLiked = false, hasDisliked = false;

    // Re-vote if a different type was chosen (toggle off if same)
    if (!existing || existing.type !== type) {
      if (type === 'like') await prisma.review.update({ where: { id: req.params.id }, data: { likes: { increment: 1 } } });
      if (type === 'dislike') await prisma.review.update({ where: { id: req.params.id }, data: { dislikes: { increment: 1 } } });
      await prisma.reviewVote.create({ data: { userId: req.user.id, reviewId: req.params.id, type } });
      hasLiked = type === 'like';
      hasDisliked = type === 'dislike';
    }

    const updated = await prisma.review.findUnique({ where: { id: req.params.id }, select: { likes: true, dislikes: true } });
    res.json({ ...updated, hasLiked, hasDisliked });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', authenticate, async (req, res) => {
  const review = await prisma.review.findUnique({ where: { id: req.params.id } });
  if (!review) return res.status(404).json({ error: 'Review not found' });
  if (review.userId !== req.user.id && req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Not authorized' });
  const { title, content, isSpoiler } = req.body;
  const updated = await prisma.review.update({ where: { id: req.params.id }, data: { title, content, isSpoiler } });
  res.json(updated);
});

router.delete('/:id', authenticate, async (req, res) => {
  const review = await prisma.review.findUnique({ where: { id: req.params.id } });
  if (!review) return res.status(404).json({ error: 'Not found' });
  if (review.userId !== req.user.id && req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Not authorized' });
  await prisma.review.delete({ where: { id: req.params.id } });
  res.json({ message: 'Deleted' });
});

router.get('/user/me', authenticate, async (req, res) => {
  const reviews = await prisma.review.findMany({
    where: { userId: req.user.id },
    include: { movie: { select: { title: true, slug: true, posterUrl: true } }, series: { select: { title: true, slug: true, posterUrl: true } } },
    orderBy: { createdAt: 'desc' }
  });
  res.json(reviews);
});

module.exports = router;
