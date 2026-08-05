const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Update posters and trailer embed URLs
  const updates = [
    { slug: 'inception', poster: '/posters/inception.jpg', trailer: 'https://www.youtube.com/embed/YoHD9XEInc0' },
    { slug: 'the-dark-knight', poster: '/posters/the-dark-knight.jpg', trailer: 'https://www.youtube.com/embed/EXeTwQWrcwY' },
    { slug: 'interstellar', poster: '/posters/interstellar.jpg', trailer: 'https://www.youtube.com/embed/zSWdZVtXT7E' },
    { slug: 'dune-2021', poster: '/posters/dune.jpg', trailer: 'https://www.youtube.com/embed/n9xhJrPXop4' },
    { slug: 'barbie-2023', poster: '/posters/barbie.jpg', trailer: 'https://www.youtube.com/embed/pBk4NYhWNMM' },
    { slug: 'oppenheimer', poster: '/posters/oppenheimer.jpg', trailer: 'https://www.youtube.com/embed/uYPbbksJxIg' },
    { slug: 'dune-part-two', poster: '/posters/dune.jpg', trailer: 'https://www.youtube.com/embed/Way9Dexny3w' },
    { slug: 'the-batman-2022', poster: '/posters/the-dark-knight.jpg', trailer: 'https://www.youtube.com/embed/mqqft2x_Aa4' },
    { slug: 'pulp-fiction', poster: null, trailer: 'https://www.youtube.com/embed/s7EdQ4FqbhY' },
    { slug: 'parasite-2019', poster: null, trailer: 'https://www.youtube.com/embed/5xH0HfJHsaY' },
    { slug: 'everything-everywhere-all-at-once', poster: null, trailer: 'https://www.youtube.com/embed/wxN1T1uxQ2g' },
  ];

  for (const u of updates) {
    await prisma.movie.updateMany({
      where: { slug: u.slug },
      data: { posterUrl: u.poster, trailerUrl: u.trailer }
    });
  }

  // Update series trailers to embed format
  const seriesUpdates = [
    { slug: 'breaking-bad', trailer: 'https://www.youtube.com/embed/HhesaQXluRY' },
    { slug: 'stranger-things', trailer: 'https://www.youtube.com/embed/b9EkMc79ZSU' },
    { slug: 'the-crown', trailer: 'https://www.youtube.com/embed/JWtnJjn6nx0' },
    { slug: 'the-last-of-us', trailer: 'https://www.youtube.com/embed/uLtkt8BonwM' },
    { slug: 'succession', trailer: 'https://www.youtube.com/embed/OzYxJV_rmE8' },
  ];

  for (const u of seriesUpdates) {
    await prisma.tVSeries.updateMany({
      where: { slug: u.slug },
      data: { trailerUrl: u.trailer }
    });
  }

  // Create sample follows and activities
  const users = await prisma.user.findMany({ take: 5 });
  if (users.length >= 3) {
    // User 1 follows User 2 and User 3
    const followPairs = [
      { followerId: users[1].id, followingId: users[2].id },
      { followerId: users[1].id, followingId: users[3].id },
      { followerId: users[2].id, followingId: users[1].id },
      { followerId: users[3].id, followingId: users[1].id },
      { followerId: users[2].id, followingId: users[4].id },
    ];
    for (const f of followPairs) {
      await prisma.follow.create({ data: f }).catch(() => {});
    }

    // Sample notifications
    await prisma.notification.createMany({ data: [
      { userId: users[1].id, type: 'follow', title: 'New Follower', body: 'janedoe started following you', link: '/user/janedoe' },
      { userId: users[1].id, type: 'like', title: 'Review Liked', body: 'Your review of Inception received 45 likes', link: '/movie/inception' },
      { userId: users[2].id, type: 'follow', title: 'New Follower', body: 'johndoe started following you', link: '/user/johndoe' },
    ]});

    // Sample activities
    await prisma.activity.createMany({ data: [
      { userId: users[1].id, type: 'rating', targetType: 'movie', targetSlug: 'inception', targetTitle: 'Inception', metadata: '9' },
      { userId: users[1].id, type: 'review', targetType: 'movie', targetSlug: 'the-dark-knight', targetTitle: 'The Dark Knight' },
      { userId: users[2].id, type: 'watchlist', targetType: 'movie', targetSlug: 'oppenheimer', targetTitle: 'Oppenheimer' },
      { userId: users[2].id, type: 'rating', targetType: 'series', targetSlug: 'stranger-things', targetTitle: 'Stranger Things', metadata: '9' },
      { userId: users[3].id, type: 'favorite', targetType: 'movie', targetSlug: 'dune-2021', targetTitle: 'Dune' },
      { userId: users[4].id, type: 'review', targetType: 'series', targetSlug: 'breaking-bad', targetTitle: 'Breaking Bad' },
    ]});
  }

  console.log('✅ Database updated with posters, trailers, follows, notifications, activities');
}

main().catch(console.error).finally(() => prisma.$disconnect());
