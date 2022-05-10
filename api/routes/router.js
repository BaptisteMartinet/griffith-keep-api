const express = require('express');
const { UserRouter, NoteRouter } = require('./index');
const router = express.Router();

router.use('/user', UserRouter);
router.use('/note', NoteRouter);

module.exports = router;
