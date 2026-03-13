import { CheckCircle2 } from 'lucide-react';

export default function RulesSection({ rules }) {
  if (!rules?.filter(Boolean).length)
    return <p className="text-gray-400 text-sm">No rules added.</p>;

  return (
    <div>
      <h2 className="section-head">Rules & Guidelines</h2>
      <p className="section-sub">Please read before registering</p>

      <div className="card p-5">
        <ul className="divide-y divide-gray-50">
          {rules.filter(Boolean).map((rule, i) => (
            <li key={i} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0 group">
              <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0 group-hover:text-green-600 transition-colors" />
              <span className="text-sm text-gray-700 leading-relaxed">{rule}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
