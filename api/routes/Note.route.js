const express = require('express');
const auth = require('../middlewares/auth.middleware');
const { User, Note } = require('../models');
const router = express.Router();

/**
 * @description Get notes where user is either the author or assigned
 * @param searchTerm A search term to filter notes by their title/body
 */
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

/**
 * @description Create a new note
 */
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

/**
 * @description Update an existing note
 */
router.patch('/:id', auth, async (req, res) => {
  const { id: noteId } = req.params;
  const { assigneeEmailsStr, ...rest } = req.body;
  const note = await Note.findById(noteId);
  if (!note)
    return res.sendStatus(404);
  if (note.author != req.ctx.user)
    return res.sendStatus(403);
  const assignee = await getAssignee(assigneeEmailsStr);
  Object.assign(note, rest);
  Object.assign(note, { assignee });
  await note.save();
  res.sendStatus(200);
});

/**
 * @description Delete an existing note
 */
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
