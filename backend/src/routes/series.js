const express = require('express');
const prisma = require('../config/database');
const { authenticate, requireAdmin, optionalAuth } = require('../middleware/auth');
const router = express.Router();

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// List TV series
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, genre, sort, search, trending } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {};
    if (search) where.title = { contains: search };
    if (genre) where.genres = { some: { genre: { slug: genre } } };
    if (trending === 'true') where.isTrending = true;

    let orderBy = [{ firstAirDate: 'desc' }];
    if (sort === 'title') orderBy = [{ title: 'asc' }];
    if (sort === 'rating') orderBy = [{ imdbRating: 'desc' }];
    if (trending === 'true') orderBy = [{ trendingRank: 'asc' }];

    const [series, total] = await Promise.all([
      prisma.tVSeries.findMany({
        where, skip, take, orderBy,
        include: { genres: { include: { genre: true } }, _count: { select: { ratings: true, reviews: true } } }
      }),
      prisma.tVSeries.count({ where })
    ]);

    const formatted = series.map(s => ({
      ...s, genres: s.genres.map(g => g.genre),
      ratingCount: s._count.ratings, reviewCount: s._count.reviews, _count: undefined
    }));

    res.json({ series: formatted, total, page: parseInt(page), totalPages: Math.ceil(total / take) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Single TV series with seasons and episodes
router.get('/:slug', optionalAuth, async (req, res) => {
  try {
    const reviewsInclude = {
      user: { select: { id: true, username: true, avatarUrl: true } },
      ...(req.user ? { votes: { where: { userId: req.user.id }, select: { type: true } } } : {}),
    };
    const series = await prisma.tVSeries.findUnique({
      where: { slug: req.params.slug },
      include: {
        genres: { include: { genre: true } },
        seasons: { include: { episodes: { orderBy: { episodeNumber: 'asc' } } }, orderBy: { seasonNumber: 'asc' } },
        cast: { include: { person: true }, orderBy: { order: 'asc' }, take: 30 },
        crew: { include: { person: true } },
        ratings: { select: { score: true } },
        reviews: {
          include: reviewsInclude,
          where: { isApproved: true }, orderBy: { createdAt: 'desc' }, take: 10
        },
        media: { orderBy: { order: 'asc' } },
        productionLinks: { include: { company: true } },
        _count: { select: { ratings: true, reviews: true } }
      }
    });
    if (!series) return res.status(404).json({ error: 'TV Series not found' });

    const avgRating = series.ratings.length > 0
      ? series.ratings.reduce((s, r) => s + r.score, 0) / series.ratings.length : null;

    res.json({
      ...series,
      reviews: series.reviews.map(r => {
        const vote = r.votes?.[0];
        return { ...r, hasLiked: vote?.type === 'like', hasDisliked: vote?.type === 'dislike', votes: undefined };
      }),
      genres: series.genres.map(g => g.genre),
      productionCompanies: series.productionLinks.map(l => l.company),
      productionLinks: undefined,
      avgRating, ratingCount: series._count.ratings, reviewCount: series._count.reviews, _count: undefined
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Create series (admin)
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { title, overview, posterUrl, backdropUrl, firstAirDate, lastAirDate, status,
      trailerUrl, imdbRating, contentRating, genreIds, cast, crew, companyIds, isTrending, trendingRank } = req.body;
    const slug = slugify(title) + '-' + Date.now().toString(36);
    const series = await prisma.tVSeries.create({
      data: {
        title, slug, overview, posterUrl, backdropUrl,
        firstAirDate: firstAirDate ? new Date(firstAirDate) : null,
        lastAirDate: lastAirDate ? new Date(lastAirDate) : null,
        status, trailerUrl, imdbRating: imdbRating ? parseFloat(imdbRating) : null,
        contentRating, isTrending, trendingRank,
        genres: genreIds ? { create: genreIds.map(genreId => ({ genreId })) } : undefined,
        cast: cast ? { create: cast.map(c => ({ personId: c.personId, character: c.character, role: c.role || 'Actor', order: c.order || 0 })) } : undefined,
        crew: crew ? { create: crew.map(c => ({ personId: c.personId, job: c.job, department: c.department })) } : undefined,
        productionLinks: companyIds ? { create: companyIds.map(companyId => ({ companyId })) } : undefined
      },
      include: { genres: { include: { genre: true } } }
    });
    res.status(201).json(series);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.title) data.slug = slugify(data.title) + '-' + Date.now().toString(36);
    if (data.firstAirDate) data.firstAirDate = new Date(data.firstAirDate);
    if (data.lastAirDate) data.lastAirDate = new Date(data.lastAirDate);
    const series = await prisma.tVSeries.update({ where: { id: req.params.id }, data });
    res.json(series);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    await prisma.tVSeries.delete({ where: { id: req.params.id } });
    res.json({ message: 'Series deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
