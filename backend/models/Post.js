const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  text: {
    type: String,
    default: '',
  },
  image: {
    type: String,
    default: '',
  },
  reactions: {
    like:  { type: Number, default: 0 },
    fire:  { type: Number, default: 0 },
    laugh: { type: Number, default: 0 },
  },
}, { timestamps: true });

module.exports = mongoose.model('Post', PostSchema);
