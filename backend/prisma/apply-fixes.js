const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Applying all updates...');

  // 1. Update MOVIE posters + embed trailers
  const movieUpdates = [
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

  let updatedMovies = 0;
  for (const u of movieUpdates) {
    const r = await prisma.movie.updateMany({ where: { slug: u.slug }, data: { posterUrl: u.poster, trailerUrl: u.trailer } });
    updatedMovies += r.count;
  }
  console.log('Updated ' + updatedMovies + ' movies');

  // 2. Update SERIES trailers
  const seriesUpdates = [
    { slug: 'breaking-bad', trailer: 'https://www.youtube.com/embed/HhesaQXluRY' },
    { slug: 'stranger-things', trailer: 'https://www.youtube.com/embed/b9EkMc79ZSU' },
    { slug: 'the-crown', trailer: 'https://www.youtube.com/embed/JWtnJjn6nx0' },
    { slug: 'the-last-of-us', trailer: 'https://www.youtube.com/embed/uLtkt8BonwM' },
    { slug: 'succession', trailer: 'https://www.youtube.com/embed/OzYxJV_rmE8' },
  ];
  let updatedSeries = 0;
  for (const u of seriesUpdates) {
    const r = await prisma.tVSeries.updateMany({ where: { slug: u.slug }, data: { trailerUrl: u.trailer } });
    updatedSeries += r.count;
  }
  console.log('Updated ' + updatedSeries + ' TV series');

  // 3. Create follows
  const users = await prisma.user.findMany({ take: 5, select: { id: true, username: true } });
  console.log('Found ' + users.length + ' users: ' + users.map(u => u.username).join(', '));

  if (users.length >= 5) {
    const pairs = [
      [users[1], users[2]], [users[1], users[3]],
      [users[2], users[1]], [users[3], users[1]],
      [users[2], users[4]],
    ];
    let c = 0;
    for (const [a, b] of pairs) {
      try { await prisma.follow.create({ data: { followerId: a.id, followingId: b.id } }); c++; }
      catch (e) { if (e.code === 'P2002') console.log('  Skip existing follow'); }
    }
    console.log('Created ' + c + ' follows');
  }

  // 4. Notifications
  const nc = await prisma.notification.count();
  if (nc === 0) {
    await prisma.notification.createMany({ data: [
      { userId: users[1].id, type: 'follow', title: 'New Follower', body: 'janedoe started following you', link: '/user/janedoe' },
      { userId: users[1].id, type: 'like', title: 'Review Liked', body: 'Your review of Inception received 45 likes', link: '/movie/inception' },
      { userId: users[2].id, type: 'follow', title: 'New Follower', body: 'johndoe started following you', link: '/user/johndoe' },
    ]});
    console.log('Created 3 notifications');
  } else { console.log(nc + ' notifications exist'); }

  // 5. Activities
  const ac = await prisma.activity.count();
  if (ac === 0) {
    await prisma.activity.createMany({ data: [
      { userId: users[1].id, type: 'rating', targetType: 'movie', targetSlug: 'inception', targetTitle: 'Inception', metadata: '9' },
      { userId: users[1].id, type: 'review', targetType: 'movie', targetSlug: 'the-dark-knight', targetTitle: 'The Dark Knight' },
      { userId: users[2].id, type: 'watchlist', targetType: 'movie', targetSlug: 'oppenheimer', targetTitle: 'Oppenheimer' },
      { userId: users[2].id, type: 'rating', targetType: 'series', targetSlug: 'stranger-things', targetTitle: 'Stranger Things', metadata: '9' },
      { userId: users[3].id, type: 'favorite', targetType: 'movie', targetSlug: 'dune-2021', targetTitle: 'Dune' },
      { userId: users[4].id, type: 'review', targetType: 'series', targetSlug: 'breaking-bad', targetTitle: 'Breaking Bad' },
    ]});
    console.log('Created 6 activities');
  } else { console.log(ac + ' activities exist'); }

  console.log('All updates complete!');
}

main().catch(e => { console.error('ERROR:', e.message); process.exit(1); }).finally(() => prisma.$disconnect());
