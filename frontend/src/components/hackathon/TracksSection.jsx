import { ChevronRight, Tag, FileText, Download } from 'lucide-react';

const PALETTES = [
  { border: 'border-blue-400',   bg: 'bg-blue-50',   badge: 'bg-blue-100 text-blue-700',   dot: 'bg-blue-500'   },
  { border: 'border-purple-400', bg: 'bg-purple-50', badge: 'bg-purple-100 text-purple-700',dot: 'bg-purple-500' },
  { border: 'border-emerald-400',bg: 'bg-emerald-50',badge: 'bg-emerald-100 text-emerald-700',dot:'bg-emerald-500'},
  { border: 'border-orange-400', bg: 'bg-orange-50', badge: 'bg-orange-100 text-orange-700',dot: 'bg-orange-500' },
  { border: 'border-pink-400',   bg: 'bg-pink-50',   badge: 'bg-pink-100 text-pink-700',    dot: 'bg-pink-500'   },
  { border: 'border-teal-400',   bg: 'bg-teal-50',   badge: 'bg-teal-100 text-teal-700',    dot: 'bg-teal-500'   },
];

export default function TracksSection({ tracks }) {
  if (!tracks?.length)
    return <EmptyState msg="No tracks defined yet." />;

  return (
    <div>
      <h2 className="section-head">Competition Tracks</h2>
      <p className="section-sub">Pick a track and build your solution</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {tracks.map((track, i) => {
          const pal = PALETTES[i % PALETTES.length];
          return (
            <div
              key={i}
              className={`card card-hover border-l-4 ${pal.border} flex flex-col`}
            >
              <div className={`${pal.bg} px-5 pt-5 pb-4`}>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="font-heading font-bold text-gray-900 text-base leading-snug">
                    {track.title}
                  </h3>
                  <span className={`badge flex-shrink-0 ${pal.badge}`}>
                    <Tag className="w-3 h-3" /> Track {i + 1}
                  </span>
                </div>
                {track.description && (
                  <p className="text-sm text-gray-600 leading-relaxed">{track.description}</p>
                )}
              </div>

              {/* ── Problem Statements — PDF preferred, text as fallback ── */}
              {track.problemStatementPdf ? (
                <div className="px-5 py-4">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                    Problem Statement
                  </p>
                  <a
                    href={track.problemStatementPdf}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
                                border transition-all hover:shadow-sm group ${pal.badge} border-current/20`}
                  >
                    <FileText className="w-4 h-4 flex-shrink-0" />
                    View Problem Statement PDF
                    <Download className="w-3.5 h-3.5 ml-auto opacity-60 group-hover:opacity-100 transition-opacity" />
                  </a>
                </div>
              ) : track.problemStatements?.length > 0 && (
                <div className="px-5 py-4 flex-1">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                    Problem Statements
                  </p>
                  <ul className="space-y-2">
                    {track.problemStatements.filter(Boolean).map((ps, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${pal.dot}`} />
                        {ps}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}

      </div>
    </div>
  );
}

function EmptyState({ msg }) {
  return <p className="text-gray-400 text-sm">{msg}</p>;
}
