import { useState } from 'react';
import { Image, Send, Loader2, X } from 'lucide-react';

const API = 'http://localhost:5000/api';

export default function PostCreator({ authorName, onPost }) {
  const [text, setText]         = useState('');
  const [file, setFile]         = useState(null);
  const [preview, setPreview]   = useState('');
  const [posting, setPosting]   = useState(false);
  const [error, setError]       = useState('');

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const removeImage = () => {
    setFile(null);
    setPreview('');
  };

  const handleSubmit = async () => {
    if (!text.trim() && !file) return;
    setPosting(true); setError('');
    try {
      const token = localStorage.getItem('hf_token');
      const fd = new FormData();
      fd.append('text', text);
      if (file) fd.append('image', file);
      const res = await fetch(`${API}/posts/create`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setText(''); setFile(null); setPreview('');
      onPost(data.data);
    } catch (err) {
      setError(err.message || 'Failed to post.');
    } finally {
      setPosting(false);
    }
  };

  const initials = (name = '') =>
    name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'ST';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-5 mb-5">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
          style={{ background: `hsl(${(authorName?.charCodeAt(0) || 0) * 47 % 360},55%,55%)` }}
        >
          {initials(authorName)}
        </div>
        <textarea
          rows={2}
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Share something with your fellow hackers… 💡"
          className="flex-1 resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-dark placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-royal/25 focus:border-royal/40 transition-all"
        />
      </div>

      {/* Image preview */}
      {preview && (
        <div className="relative mb-4 rounded-xl overflow-hidden border border-gray-100">
          <img src={preview} alt="preview" className="w-full max-h-72 object-cover" />
          <button
            onClick={removeImage}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors cursor-pointer"
          >
            <X size={13} />
          </button>
        </div>
      )}

      {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

      {/* Footer actions */}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-royal cursor-pointer transition-colors group">
          <div className="w-8 h-8 rounded-xl border border-gray-200 group-hover:border-royal/40 flex items-center justify-center transition-colors">
            <Image size={16} />
          </div>
          Add Image / Meme
          <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </label>
        <button
          onClick={handleSubmit}
          disabled={posting || (!text.trim() && !file)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-royal text-white text-sm font-bold hover:bg-royal/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {posting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          {posting ? 'Posting…' : 'Post'}
        </button>
      </div>
    </div>
  );
}
