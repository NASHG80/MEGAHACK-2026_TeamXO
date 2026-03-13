const Post = require('../models/Post');

/* ─────────────────────────────────────────────────────────────
   POST /api/posts/create
   Creates a new community post. Accepts text + optional image.
───────────────────────────────────────────────────────────── */
const createPost = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Not authenticated' });

    const { text } = req.body;
    const image = req.file ? `/uploads/posts/${req.file.filename}` : '';

    if (!text && !image) {
      return res.status(400).json({ success: false, message: 'Post must have text or an image.' });
    }

    const post = await Post.create({ author: userId, text: text || '', image });
    const populated = await Post.findById(post._id).populate('author', 'name college');

    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    console.error('[createPost]', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ─────────────────────────────────────────────────────────────
   GET /api/posts
   Returns all posts newest first with author populated.
───────────────────────────────────────────────────────────── */
const getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate('author', 'name college');
    res.json({ success: true, data: posts });
  } catch (err) {
    console.error('[getPosts]', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ─────────────────────────────────────────────────────────────
   POST /api/posts/react
   Increments a reaction counter on a post.
   Body: { postId, reactionType: 'like' | 'fire' | 'laugh' }
───────────────────────────────────────────────────────────── */
const reactToPost = async (req, res) => {
  try {
    const { postId, reactionType } = req.body;
    const allowed = ['like', 'fire', 'laugh'];
    if (!postId || !allowed.includes(reactionType)) {
      return res.status(400).json({ success: false, message: 'Invalid postId or reactionType.' });
    }

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found.' });

    post.reactions[reactionType] = (post.reactions[reactionType] || 0) + 1;
    await post.save();

    res.json({ success: true, reactions: post.reactions });
  } catch (err) {
    console.error('[reactToPost]', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createPost, getPosts, reactToPost };
