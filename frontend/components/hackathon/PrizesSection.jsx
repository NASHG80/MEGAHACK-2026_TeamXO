import { Trophy, Medal, Award } from 'lucide-react';

const RANK = [
  {
    label: '1st Place',
    emoji: '🥇',
    icon: Trophy,
    ring: 'ring-2 ring-yellow-300',
    header: 'bg-gradient-to-r from-yellow-400 to-amber-500',
    iconBg: 'bg-yellow-100 text-yellow-600',
    amt: 'text-yellow-600',
    scale: 'scale-105 z-10',
  },
  {
    label: '2nd Place',
    emoji: '🥈',
    icon: Medal,
    ring: 'ring-2 ring-gray-300',
    header: 'bg-gradient-to-r from-gray-300 to-slate-400',
    iconBg: 'bg-gray-100 text-gray-600',
    amt: 'text-gray-600',
    scale: '',
  },
  {
    label: '3rd Place',
    emoji: '🥉',
    icon: Award,
    ring: 'ring-2 ring-orange-300',
    header: 'bg-gradient-to-r from-orange-300 to-amber-400',
    iconBg: 'bg-orange-100 text-orange-600',
    amt: 'text-orange-600',
    scale: '',
  },
];

export default function PrizesSection({ prizes }) {
  if (!prizes?.length)
    return <p className="text-gray-400 text-sm">No prizes defined yet.</p>;

  return (
    <div>
      <h2 className="section-head">Prizes & Rewards</h2>
      <p className="section-sub">Win big and make your mark</p>

      {/* Top 3 in podium style */}
      <div className="flex flex-col sm:flex-row gap-5 justify-center items-stretch mb-6">
        {prizes.slice(0, 3).map((prize, i) => {
          const meta = RANK[i] || RANK[2];
          const Icon = meta.icon;
          return (
            <div
              key={i}
              className={`bg-white rounded-2xl border border-gray-100 shadow-card
                          overflow-hidden flex flex-col flex-1 max-w-xs mx-auto sm:mx-0
                          ${meta.ring} ${meta.scale} transition-transform duration-200`}
            >
              {/* Coloured header */}
              <div className={`${meta.header} h-2`} />
              <div className="p-6 text-center flex flex-col flex-1">
                <div className={`w-14 h-14 ${meta.iconBg} rounded-2xl mx-auto mb-4
                                 flex items-center justify-center`}>
                  <Icon className="w-7 h-7" />
                </div>
                <span className="text-xl mb-1">{meta.emoji}</span>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                  {meta.label}
                </p>
                <h3 className="font-heading font-bold text-gray-900 text-lg mb-1">{prize.title}</h3>
                <p className={`text-2xl font-extrabold mb-3 ${meta.amt}`}>{prize.amount}</p>
                {prize.description && (
                  <p className="text-xs text-gray-500 leading-relaxed mt-auto">{prize.description}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Additional prizes (4+) in compact rows */}
      {prizes.length > 3 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
          {prizes.slice(3).map((prize, i) => (
            <div key={i} className="card p-4 flex items-center gap-4">
              <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Award className="w-5 h-5 text-primary-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm">{prize.title}</p>
                <p className="text-primary-600 font-bold text-sm">{prize.amount}</p>
                {prize.description && (
                  <p className="text-xs text-gray-500 mt-0.5 truncate">{prize.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
