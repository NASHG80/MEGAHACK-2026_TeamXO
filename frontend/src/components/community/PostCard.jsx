import ReactionBar from './ReactionBar';

const BASE = 'http://localhost:5000';

function timeAgo(dateStr) {
  try {
    const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
    if (diff < 60)  return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  } catch { return ''; }
}

const initials = (name = '') =>
  name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '??';

const avBg = (str = '') =>
  `hsl(${(str.charCodeAt(0) || 0) * 47 % 360},55%,55%)`;

export default function PostCard({ post }) {
  const author = post.author || {};
  const name   = author.name   || 'Anonymous';
  const college = author.college || '';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.06)] overflow-hidden hover:shadow-[0_4px_20px_rgba(30,100,255,0.08)] hover:-translate-y-0.5 transition-all duration-200 mb-4">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-5 pb-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
          style={{ background: avBg(name) }}
        >
          {initials(name)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-extrabold text-dark leading-snug">{name}</p>
          {college && (
            <p className="text-[11px] text-gray-400 font-semibold truncate">{college}</p>
          )}
        </div>
        <p className="text-[11px] text-gray-400 shrink-0">{timeAgo(post.createdAt)}</p>
      </div>

      {/* Caption */}
      {post.text && (
        <p className="px-5 pb-3 text-sm text-dark leading-relaxed whitespace-pre-wrap">
          {post.text}
        </p>
      )}

      {/* Image */}
      {post.image && (
        <div className="px-5 pb-3">
          <img
            src={`${BASE}${post.image}`}
            alt="post"
            className="w-full rounded-xl object-cover max-h-96 border border-gray-100"
          />
        </div>
      )}

      {/* Reactions */}
      <div className="px-5 pb-4">
        <ReactionBar postId={post._id} initialReactions={post.reactions} />
      </div>
    </div>
  );
}
