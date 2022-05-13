const express = require('express');
const auth = require('../middlewares/auth.middleware');
const { User, Note } = require('../models');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  const { searchTerm } = req.query;
  const filter = {
    $and: [
      {
        $or: [
          { author: req.ctx.user },
          { assignee: req.ctx.user },
        ],
      },
      (searchTerm ? {
        $or: [
          { title: { $regex: searchTerm, $options: 'i' } },
          { body: { $regex: searchTerm, $options: 'i' } },
        ],
      } : {})
    ]
  }
  const notes = await Note.find(filter).populate([
    { path: 'author', model: 'User' },
    { path: 'assignee', model: 'User' },
  ]);
  res.json(notes);
});

async function getAssignee(assigneeEmailsStr) {
  if (!assigneeEmailsStr)
    return null;
  const assigneeEmails = assigneeEmailsStr.split(';');
  return User.find({ email: { $in: assigneeEmails } });
}

router.post('/', auth, async (req, res) => {
  const { assigneeEmailsStr, ...rest } = req.body;
  const assignee = await getAssignee(assigneeEmailsStr);
  await Note.create({
    author: req.ctx.user,
    assignee,
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
