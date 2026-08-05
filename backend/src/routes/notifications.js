const express = require('express');
const prisma = require('../config/database');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id }, orderBy: { createdAt: 'desc' }, take: 50
    });
    const unreadCount = await prisma.notification.count({
      where: { userId: req.user.id, isRead: false }
    });
    res.json({ notifications, unreadCount });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.patch('/:id/read', authenticate, async (req, res) => {
  await prisma.notification.updateMany({
    where: { id: req.params.id, userId: req.user.id }, data: { isRead: true }
  });
  res.json({ message: 'Marked as read' });
});

router.patch('/read-all', authenticate, async (req, res) => {
  await prisma.notification.updateMany({
    where: { userId: req.user.id, isRead: false }, data: { isRead: true }
  });
  res.json({ message: 'All marked as read' });
});

router.get('/unread-count', authenticate, async (req, res) => {
  const count = await prisma.notification.count({
    where: { userId: req.user.id, isRead: false }
  });
  res.json({ count });
});

module.exports = router;
