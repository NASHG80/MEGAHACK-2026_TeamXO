import { CheckCircle2, XCircle } from 'lucide-react';

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

/* ─────────────────────── RESULT SECTION ────────────────────
  Props:
    result: {
      selectionStatus: 'selected' | 'not_selected',
      rank: number | null
    }
─────────────────────────────────────────────────────────── */
export default function ResultSection({ result }) {
  const selected = result?.selectionStatus === 'selected';

  return (
    <SectionCard
      title="Screening Results"
      icon={selected ? CheckCircle2 : XCircle}
      iconBg={selected ? 'bg-emerald-50' : 'bg-red-50'}
      iconColor={selected ? 'text-emerald-600' : 'text-red-500'}
    >
      <div className={`p-6 rounded-xl text-center ${selected ? 'bg-emerald-50 border border-emerald-100' : 'bg-red-50 border border-red-100'}`}>
        {selected ? (
          <>
            <CheckCircle2 size={40} className="text-emerald-500 mx-auto mb-3" />
            <p className="text-lg font-extrabold text-emerald-800 mb-1">Congratulations! You're Shortlisted 🎉</p>
            <p className="text-sm text-emerald-700">
              Your team has been selected for the offline round.
              {result?.rank && <span className="font-bold"> Rank #{result.rank} in screening.</span>}
            </p>
            <p className="text-xs text-emerald-600 mt-3">
              Please check the Offline Event section below for workspace and schedule details.
            </p>
          </>
        ) : (
          <>
            <XCircle size={40} className="text-red-400 mx-auto mb-3" />
            <p className="text-lg font-extrabold text-red-700 mb-1">Not Selected</p>
            <p className="text-sm text-red-600">
              Your team was not shortlisted for the offline round. Better luck next time!
            </p>
          </>
        )}
      </div>
    </SectionCard>
  );
}
