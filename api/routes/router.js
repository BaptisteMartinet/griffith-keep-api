const express = require('express');
const { AccountRouter, NoteRouter } = require('./index');
const router = express.Router();

router.use('/account', AccountRouter);
router.use('/note', NoteRouter);

module.exports = router;
