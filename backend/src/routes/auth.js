const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/database');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, username, password, fullName } = req.body;
    if (!email || !username || !password) return res.status(400).json({ error: 'Email, username, and password are required' });

    const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { username }] } });
    if (existing) return res.status(409).json({ error: 'Email or username already taken' });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, username, passwordHash, fullName, role: 'USER' },
      select: { id: true, email: true, username: true, fullName: true, avatarUrl: true, role: true, createdAt: true }
    });

    const token = jwt.sign({ id: user.id, email: user.email, username: user.username, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
    await prisma.session.create({ data: { userId: user.id, token, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) } });

    res.status(201).json({ user, token });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, email: user.email, username: user.username, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
    await prisma.session.create({ data: { userId: user.id, token, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) } });

    const { passwordHash: _, ...userData } = user;
    res.json({ user: userData, token });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Get current user
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, email: true, username: true, fullName: true, avatarUrl: true, bio: true, role: true, isVerified: true, createdAt: true }
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Logout
router.post('/logout', authenticate, async (req, res) => {
  try {
    const header = req.headers.authorization;
    const token = header.split(' ')[1];
    await prisma.session.deleteMany({ where: { token } });
    res.json({ message: 'Logged out successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Update profile
router.patch('/profile', authenticate, async (req, res) => {
  try {
    const { fullName, bio, avatarUrl } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { fullName, bio, avatarUrl },
      select: { id: true, email: true, username: true, fullName: true, avatarUrl: true, bio: true, role: true }
    });
    res.json(user);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
