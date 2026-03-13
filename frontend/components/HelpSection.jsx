import { useState } from 'react';
import { MessageSquare, Phone, Send } from 'lucide-react';

/* ─── Shared SectionCard ─── */
function SectionCard({ title, icon: Icon, iconBg = 'bg-royal/5', iconColor = 'text-royal', children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
      <div className="flex items-center gap-3 px-7 py-5 border-b border-gray-100">
        <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center`}>
          <Icon size={18} className={iconColor} />
        </div>
        <h2 className="text-base font-extrabold text-dark">{title}</h2>
      </div>
      <div className="px-7 py-6">{children}</div>
    </div>
  );
}

/* ─────────────────────── HELP SECTION ──────────────────────
  Props:
    queries: [{ requestId, message, status }]
    organizerContact: string
─────────────────────────────────────────────────────────── */
export default function HelpSection({ queries: initialQueries = [], organizerContact = '' }) {
  const [message, setMessage] = useState('');
  const [queries, setQueries] = useState(initialQueries);

  const sendQuery = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    setQueries((prev) => [
      ...prev,
      { requestId: `req_${Date.now()}`, message: message.trim(), status: 'Pending' },
    ]);
    setMessage('');
  };

  return (
    <SectionCard title="Help / Query" icon={MessageSquare} iconBg="bg-amber-50" iconColor="text-amber-500">

      {/* Organizer Contact */}
      <div className="flex items-center gap-3 mb-6 p-3.5 rounded-xl bg-light-gray">
        <Phone size={15} className="text-gray-400" />
        <span className="text-sm font-medium text-gray-600">
          Organizer: <span className="font-semibold text-dark">{organizerContact || '—'}</span>
        </span>
      </div>

      {/* Past Queries */}
      {queries.length > 0 && (
        <div className="space-y-3 mb-6">
          {queries.map((q) => (
            <div key={q.requestId} className="p-4 rounded-xl bg-light-gray border border-gray-100">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm text-dark font-medium">{q.message}</p>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ${
                  q.status === 'Resolved'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-amber-50 text-amber-700'
                }`}>
                  {q.status}
                </span>
              </div>
              <p className="text-[11px] text-gray-400 mt-1">ID: {q.requestId}</p>
            </div>
          ))}
        </div>
      )}

      {/* New Query Form */}
      <form onSubmit={sendQuery} className="flex gap-3">
        <textarea
          rows={3}
          placeholder="Describe your issue or question..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm text-dark placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-royal/20 focus:border-royal transition-all resize-none"
        />
        <button
          type="submit"
          disabled={!message.trim()}
          className={`self-end flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all shadow-md ${
            message.trim()
              ? 'bg-royal text-white hover:bg-royal-light cursor-pointer'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          <Send size={14} /> Send
        </button>
      </form>
    </SectionCard>
  );
}
