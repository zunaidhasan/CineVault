const express = require('express');
const prisma = require('../config/database');
const { authenticate, requireAdmin, optionalAuth } = require('../middleware/auth');
const router = express.Router();

// Slug helper
function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// GET /api/movies — list with filters, pagination, search
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, genre, year, sort, search, trending, upcoming, topRated } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {};
    if (search) where.title = { contains: search };
    if (genre) where.genres = { some: { genre: { slug: genre } } };
    if (year) {
      const start = new Date(`${year}-01-01`);
      const end = new Date(`${year}-12-31`);
      where.releaseDate = { gte: start, lte: end };
    }
    if (trending === 'true') where.isTrending = true;
    if (upcoming === 'true') where.isUpcoming = true;

    let orderBy = [{ releaseDate: 'desc' }];
    if (topRated === 'true') orderBy = [{ imdbRating: 'desc' }];
    if (trending === 'true') orderBy = [{ trendingRank: 'asc' }];
    if (sort === 'title') orderBy = [{ title: 'asc' }];
    if (sort === 'rating') orderBy = [{ imdbRating: 'desc' }];
    if (sort === 'oldest') orderBy = [{ releaseDate: 'asc' }];

    const [movies, total] = await Promise.all([
      prisma.movie.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          genres: { include: { genre: true } },
          _count: { select: { ratings: true, reviews: true } }
        }
      }),
      prisma.movie.count({ where })
    ]);

    const formatted = movies.map(m => ({
      ...m,
      genres: m.genres.map(g => g.genre),
      avgRating: null,
      ratingCount: m._count.ratings,
      reviewCount: m._count.reviews,
      _count: undefined
    }));

    res.json({ movies: formatted, total, page: parseInt(page), totalPages: Math.ceil(total / take) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/movies/:slug — single movie detail
router.get('/:slug', optionalAuth, async (req, res) => {
  try {
    const reviewsInclude = {
      user: { select: { id: true, username: true, avatarUrl: true } },
      ...(req.user ? { votes: { where: { userId: req.user.id }, select: { type: true } } } : {}),
    };
    const movie = await prisma.movie.findUnique({
      where: { slug: req.params.slug },
      include: {
        genres: { include: { genre: true } },
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
    if (!movie) return res.status(404).json({ error: 'Movie not found' });

    const avgRating = movie.ratings.length > 0
      ? movie.ratings.reduce((s, r) => s + r.score, 0) / movie.ratings.length
      : null;

    res.json({
      ...movie,
      reviews: movie.reviews.map(r => {
        const vote = r.votes?.[0];
        return { ...r, hasLiked: vote?.type === 'like', hasDisliked: vote?.type === 'dislike', votes: undefined };
      }),
      genres: movie.genres.map(g => g.genre),
      productionCompanies: movie.productionLinks.map(l => l.company),
      productionLinks: undefined,
      avgRating,
      ratingCount: movie._count.ratings,
      reviewCount: movie._count.reviews,
      _count: undefined
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/movies — create movie (admin)
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { title, overview, tagline, posterUrl, backdropUrl, releaseDate, runtime, budget, revenue,
      status, trailerUrl, imdbRating, contentRating, genreIds, cast, crew, companyIds, isTrending, trendingRank, isUpcoming } = req.body;

    const slug = slugify(title) + '-' + Date.now().toString(36);
    const movie = await prisma.movie.create({
      data: {
        title, slug, overview, tagline, posterUrl, backdropUrl,
        releaseDate: releaseDate ? new Date(releaseDate) : null,
        runtime: runtime ? parseInt(runtime) : null,
        budget: budget ? parseFloat(budget) : null,
        revenue: revenue ? parseFloat(revenue) : null,
        status, trailerUrl, imdbRating: imdbRating ? parseFloat(imdbRating) : null,
        contentRating, isTrending, trendingRank, isUpcoming,
        genres: genreIds ? { create: genreIds.map(genreId => ({ genreId })) } : undefined,
        cast: cast ? { create: cast.map(c => ({ personId: c.personId, character: c.character, role: c.role || 'Actor', order: c.order || 0 })) } : undefined,
        crew: crew ? { create: crew.map(c => ({ personId: c.personId, job: c.job, department: c.department })) } : undefined,
        productionLinks: companyIds ? { create: companyIds.map(companyId => ({ companyId })) } : undefined
      },
      include: { genres: { include: { genre: true } }, cast: { include: { person: true } }, crew: { include: { person: true } } }
    });
    res.status(201).json(movie);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/movies/:id — update movie (admin)
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.releaseDate) data.releaseDate = new Date(data.releaseDate);
    if (data.runtime) data.runtime = parseInt(data.runtime);
    delete data.genreIds; delete data.cast; delete data.crew; delete data.companyIds;

    if (data.title) data.slug = slugify(data.title) + '-' + Date.now().toString(36);

    const movie = await prisma.movie.update({ where: { id: req.params.id }, data });
    res.json(movie);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/movies/:id
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    await prisma.movie.delete({ where: { id: req.params.id } });
    res.json({ message: 'Movie deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
