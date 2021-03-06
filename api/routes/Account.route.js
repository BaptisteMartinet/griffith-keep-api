const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const auth = require('../middlewares/auth.middleware');
const { User } = require('../models');
const router = express.Router();

/**
 * @description Return the authentified user
 */
router.get('/currentUser', auth, async (req, res) => {
  const user = await User.findById(req.ctx.user);
  if (!user)
    return res.sendStatus(404);
  res.json(user);
});

router.post('/logout', auth, async (req, res) => {
  res.clearCookie('x-access-token', { httpOnly: true, secure: true, sameSite: 'none' }).sendStatus(200);
});

/**
 * @description Register a new user
 */
router.post('/register', async (req, res) => {
  const { password, ...args } = req.body;
  if (await User.exists({ email: args.email }))
    return res.status(409).send('User already exists.');
  const hashedPassword = await bcrypt.hash(password, 10);
  await User.create({
    ...args,
    password: hashedPassword,
  });
  res.sendStatus(201);
});

/**
 * @description Login
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.sendStatus(400);
  const user = await User.findOne({ email }, '+password');
  if (!user)
    return res.sendStatus(404)
  if (!(await bcrypt.compare(password, user.password)))
    return res.status(400).send('Invalid credentials.');
  const token = jwt.sign({ user: user.id }, process.env.JWT_SECRET_KEY, { expiresIn: '24h' });
  res.cookie('x-access-token', token, { expires: new Date(Date.now() + 86400000), httpOnly: true, secure: true, sameSite: 'none' });
  res.json(user);
});

module.exports = router;
