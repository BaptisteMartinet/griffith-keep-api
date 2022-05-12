const express = require('express');
const auth = require('../middlewares/auth.middleware');
const { User, Note } = require('../models');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  const notes = await Note.find({
    author: req.ctx.user,
    assignee: req.ctx.user,
  }).populate([
    { path: 'author', model: 'User' },
    { path: 'assigned', model: 'User' },
  ]);
  res.json(notes);
});

router.post('/', auth, async (req, res) => {
  const { assigneeEmailsStr, ...rest } = req.body;
  const assigneeEmails = assigneeEmailsStr.split(';');
  const assignee = await User.find({ email: { $in: assigneeEmails } });
  const assigneeIds = assignee.reduce((prev, curr) => (prev.push(curr._id)), []);
  await Note.create({
    author: req.ctx.user,
    assignee: assigneeIds,
    ...rest,
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
