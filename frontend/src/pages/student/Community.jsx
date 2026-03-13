import { useState, useEffect } from 'react';
import StudentNavbar from '../../components/StudentNavbar';
import PostCreator from '../../components/community/PostCreator';
import PostCard from '../../components/community/PostCard';
import { Loader2, Users2 } from 'lucide-react';

const API = 'http://localhost:5000/api';

function decodeToken() {
  try {
    const token = localStorage.getItem('hf_token');
    if (!token) return {};
    return JSON.parse(atob(token.split('.')[1]));
  } catch { return {}; }
}

export default function Community() {
  const [posts, setPosts]     = useState([]);
  const [loading, setLoading] = useState(true);
  const user = decodeToken();
  const authorName = user.name || user.email || 'You';

  const fetchPosts = async () => {
    try {
      const res  = await fetch(`${API}/posts`);
      const data = await res.json();
      if (data.success) setPosts(data.data);
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPosts(); }, []);

  // Add new post to the top of the list without full refetch
  const handleNewPost = (post) => {
    setPosts(prev => [post, ...prev]);
  };

  return (
    <div className="min-h-screen bg-light-gray font-sans">
      <StudentNavbar />

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Page header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-royal flex items-center justify-center shadow-sm shadow-royal/30">
              <Users2 size={18} className="text-white" />
            </div>
            <h1 className="text-2xl font-black text-dark">Community Feed</h1>
          </div>
          <p className="text-sm text-gray-500 pl-12">Share ideas, memes, and inspiration with fellow hackers 💡</p>
        </div>

        {/* Post creator */}
        <PostCreator authorName={authorName} onPost={handleNewPost} />

        {/* Feed */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="w-8 h-8 text-royal animate-spin" />
            <p className="text-sm text-gray-400">Loading posts…</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <div className="text-5xl">🦗</div>
            <p className="text-base font-bold text-dark">It's quiet here…</p>
            <p className="text-sm text-gray-400">Be the first to share something!</p>
          </div>
        ) : (
          <div>
            {posts.map(post => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
