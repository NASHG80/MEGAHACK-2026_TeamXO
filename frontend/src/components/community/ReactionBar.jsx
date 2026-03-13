import { useState } from 'react';

const API = 'http://localhost:5000/api';

const REACTIONS = [
  { key: 'like',  emoji: '👍', label: 'Like' },
  { key: 'fire',  emoji: '🔥', label: 'Fire' },
  { key: 'laugh', emoji: '😂', label: 'Laugh' },
];

export default function ReactionBar({ postId, initialReactions }) {
  const [counts, setCounts] = useState({
    like:  initialReactions?.like  || 0,
    fire:  initialReactions?.fire  || 0,
    laugh: initialReactions?.laugh || 0,
  });
  const [loading, setLoading] = useState('');

  const react = async (reactionType) => {
    // Optimistic update
    setCounts(prev => ({ ...prev, [reactionType]: prev[reactionType] + 1 }));
    setLoading(reactionType);
    try {
      const token = localStorage.getItem('hf_token');
      const res = await fetch(`${API}/posts/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ postId, reactionType }),
      });
      const data = await res.json();
      if (data.success && data.reactions) setCounts(data.reactions);
    } catch {
      // rollback
      setCounts(prev => ({ ...prev, [reactionType]: prev[reactionType] - 1 }));
    } finally {
      setLoading('');
    }
  };

  return (
    <div className="flex items-center gap-2 pt-3 border-t border-gray-50">
      {REACTIONS.map(({ key, emoji, label }) => (
        <button
          key={key}
          onClick={() => react(key)}
          disabled={loading === key}
          title={label}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 hover:bg-royal/8 border border-transparent hover:border-royal/15 text-sm font-semibold text-gray-600 hover:text-royal transition-all cursor-pointer active:scale-110 select-none"
        >
          <span className="text-base leading-none">{emoji}</span>
          <span className="text-xs text-gray-500">{counts[key]}</span>
        </button>
      ))}
    </div>
  );
}
