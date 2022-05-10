const mongoose = require('mongoose');
const { Schema, Types } = mongoose;
const { ObjectId } = Types;

const NoteSchema = new Schema({
  author: { type: ObjectId, ref: 'User', required: true },
  assigned: [{ type: ObjectId, ref: 'User', required: true }],
  title: { type: String, required: false },
  body: { type: String, required: true },
  pinned: { type: Boolean, required: true, default: false },
  completionDate: { type: Date, required: false },
}, { timestamps: true });

module.exports = mongoose.model('Note', NoteSchema, 'notes');
