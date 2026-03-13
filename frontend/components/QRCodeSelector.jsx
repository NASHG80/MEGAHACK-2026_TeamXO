import { DoorOpen, Coffee, Utensils, CheckSquare, Square } from 'lucide-react';

const QR_TYPES = [
  {
    key: 'entry',
    label: 'Entry QR',
    description: 'For gate check-in at venue entrance',
    icon: DoorOpen,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    checkedBorder: 'border-blue-500',
    checkedBg: 'bg-blue-50',
  },
  {
    key: 'lunch',
    label: 'Lunch QR',
    description: 'For lunch distribution at food counter',
    icon: Coffee,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    checkedBorder: 'border-amber-500',
    checkedBg: 'bg-amber-50',
  },
  {
    key: 'dinner',
    label: 'Dinner QR',
    description: 'For dinner distribution at food counter',
    icon: Utensils,
    color: 'text-violet-600',
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    checkedBorder: 'border-violet-500',
    checkedBg: 'bg-violet-50',
  },
];

/**
 * QRCodeSelector — checkbox UI to choose which QR types to generate.
 * Props:
 *   selected   — Set<string> of selected keys ('entry','lunch','dinner')
 *   onChange   — (newSet) => void
 */
export default function QRCodeSelector({ selected, onChange }) {
  const allSelected = QR_TYPES.every(t => selected.has(t.key));
  const someSelected = QR_TYPES.some(t => selected.has(t.key));

  const toggleAll = () => {
    if (allSelected) {
      onChange(new Set());
    } else {
      onChange(new Set(QR_TYPES.map(t => t.key)));
    }
  };

  const toggle = (key) => {
    const next = new Set(selected);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    onChange(next);
  };

  return (
    <div className="space-y-3">
      {/* Select All row */}
      <button
        type="button"
        onClick={toggleAll}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200
                   bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group text-left"
      >
        <span className={`shrink-0 transition-colors ${allSelected ? 'text-royal' : someSelected ? 'text-royal/60' : 'text-gray-300'}`}>
          {allSelected ? <CheckSquare size={18} /> : <Square size={18} />}
        </span>
        <span className="text-sm font-bold text-gray-700">Select All</span>
        <span className="ml-auto text-xs text-gray-400 font-medium">
          {selected.size}/{QR_TYPES.length} selected
        </span>
      </button>

      {/* Individual QR types */}
      {QR_TYPES.map(({ key, label, description, icon: Icon, color, bg, border, checkedBorder }) => {
        const checked = selected.has(key);
        return (
          <button
            key={key}
            type="button"
            onClick={() => toggle(key)}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition-all cursor-pointer text-left
              ${checked
                ? `${checkedBorder} ${bg} shadow-sm`
                : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50'
              }`}
          >
            {/* Checkbox visual */}
            <span className={`shrink-0 transition-colors ${checked ? 'text-royal' : 'text-gray-300'}`}>
              {checked ? <CheckSquare size={18} /> : <Square size={18} />}
            </span>

            {/* Icon */}
            <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
              <Icon size={16} className={color} />
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-bold ${checked ? 'text-gray-800' : 'text-gray-600'}`}>
                {label}
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5">{description}</p>
            </div>

            {/* Checked indicator pill */}
            {checked && (
              <span className="shrink-0 text-[10px] font-bold text-white bg-royal px-2 py-0.5 rounded-full">
                ✓
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
