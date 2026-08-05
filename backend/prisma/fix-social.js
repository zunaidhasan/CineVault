const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({ take: 5, select: { id: true, username: true } });
  console.log('Users:', users.map(u => u.username).join(', '));

  // Follows
  const existingFollows = await prisma.follow.count();
  console.log('Existing follows:', existingFollows);
  if (existingFollows === 0) {
    const pairs = [[users[1], users[2]],[users[1], users[3]],[users[2], users[1]],[users[3], users[1]],[users[2], users[4]]];
    let c = 0;
    for (const [a, b] of pairs) { try { await prisma.follow.create({ data: { followerId: a.id, followingId: b.id } }); c++; } catch(e) { console.log('Skip:', e.code); } }
    console.log('Created', c, 'follows');
  }

  // Notifications
  const nc = await prisma.notification.count();
  console.log('Existing notifications:', nc);
  if (nc === 0) {
    await prisma.notification.createMany({ data: [
      { userId: users[1].id, type: 'follow', title: 'New Follower', body: 'janedoe started following you', link: '/user/janedoe' },
      { userId: users[1].id, type: 'like', title: 'Review Liked', body: 'Your review of Inception received 45 likes', link: '/movie/inception' },
      { userId: users[2].id, type: 'follow', title: 'New Follower', body: 'johndoe started following you', link: '/user/johndoe' },
    ]});
    console.log('Created 3 notifications');
  }

  // Activities
  const ac = await prisma.activity.count();
  console.log('Existing activities:', ac);
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
  }

  console.log('Done!');
  await prisma.$disconnect();
}

main().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
