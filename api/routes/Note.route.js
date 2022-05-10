const express = require('express');
const auth = require('../middlewares/auth.middleware');
const { Note } = require('../models');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  const notes = await Note.find({ author: req.ctx.user }).populate([
    { path: 'author', model: 'User' },
    { path: 'assigned', model: 'User' },
  ]);
  res.json(notes);
});

router.post('/', auth, async (req, res) => {
  await Note.create({
    author: req.ctx.user,
    ...req.body,
  });
  res.sendStatus(200);
});

router.patch('/:id', auth, async (req, res) => {
  const { id: noteId } = req.params;
  const note = await Note.findById(noteId);
  if (!note)
    return res.sendStatus(404);
  if (note.author != req.ctx.user)
    return res.sendStatus(403);
  Object.assign(note, req.body);
  await note.save();
  res.sendStatus(200);
});

router.delete('/:id', auth, async (req, res) => {
  const { id: noteId } = req.params;
  const note = await Note.findById(noteId);
  if (!note)
    return res.sendStatus(404);
  if (note.author != req.ctx.user)
    return res.sendStatus(403);
  await note.deleteOne();
  res.sendStatus(200);
});

module.exports = router;
