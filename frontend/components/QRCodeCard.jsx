import { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Download, DoorOpen, Coffee, Utensils, Clock } from 'lucide-react';

/* ── per-action visual config ── */
const ACTION_META = {
  entry: {
    label: 'Entry QR',
    description: 'Scan at venue entrance',
    icon: DoorOpen,
    gradient: 'from-blue-500 to-royal',
    ring: 'ring-blue-200',
    badge: 'bg-blue-50 text-blue-700 ring-blue-200',
    qrFg: '#1E3A8A',
    emoji: '🚪',
  },
  lunch: {
    label: 'Lunch QR',
    description: 'Scan at lunch counter',
    icon: Coffee,
    gradient: 'from-amber-400 to-orange-500',
    ring: 'ring-amber-200',
    badge: 'bg-amber-50 text-amber-700 ring-amber-200',
    qrFg: '#92400E',
    emoji: '🍽️',
  },
  dinner: {
    label: 'Dinner QR',
    description: 'Scan at dinner counter',
    icon: Utensils,
    gradient: 'from-violet-500 to-purple-600',
    ring: 'ring-violet-200',
    badge: 'bg-violet-50 text-violet-700 ring-violet-200',
    qrFg: '#4C1D95',
    emoji: '🍛',
  },
};

/**
 * QRCodeCard — displays one generated QR code with metadata + download.
 * Props:
 *   action    — 'entry' | 'lunch' | 'dinner'
 *   value     — full QR string e.g. "hackathonId:HACK501|action:entry|token:abc"
 *   hackName  — human-readable hackathon name
 *   generatedAt — Date object
 */
export default function QRCodeCard({ action, value, hackName, generatedAt }) {
  const canvasRef = useRef(null);
  const meta = ACTION_META[action] || ACTION_META.entry;
  const Icon = meta.icon;

  const timeStr = generatedAt
    ? generatedAt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
    : '';
  const dateStr = generatedAt
    ? generatedAt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : '';

  /* Download the canvas as PNG */
  const handleDownload = () => {
    const canvas = canvasRef.current?.querySelector('canvas');
    if (!canvas) return;

    // Draw with white padding onto a temp canvas for a clean print
    const pad = 24;
    const tmp = document.createElement('canvas');
    tmp.width  = canvas.width  + pad * 2;
    tmp.height = canvas.height + pad * 2;
    const ctx = tmp.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, tmp.width, tmp.height);
    ctx.drawImage(canvas, pad, pad);

    const link = document.createElement('a');
    link.download = `${action}-qr-${hackName?.replace(/\s+/g, '-') || 'event'}.png`;
    link.href = tmp.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex flex-col">
      {/* Gradient header strip */}
      <div className={`h-1.5 bg-gradient-to-r ${meta.gradient}`} />

      <div className="p-5 flex flex-col items-center gap-4 flex-1">
        {/* Label row */}
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${meta.gradient} flex items-center justify-center shrink-0`}>
              <Icon size={15} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">{meta.label}</p>
              <p className="text-[10px] text-gray-400">{meta.description}</p>
            </div>
          </div>
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ring-1 ${meta.badge}`}>
            {meta.emoji}
          </span>
        </div>

        {/* QR Code — centred with subtle shadow */}
        <div
          ref={canvasRef}
          className={`p-3 rounded-2xl bg-white ring-2 ${meta.ring} shadow-sm`}
        >
          <QRCodeCanvas
            value={value}
            size={180}
            fgColor={meta.qrFg}
            bgColor="#ffffff"
            level="H"
            includeMargin={false}
          />
        </div>

        {/* Hackathon name */}
        <p className="text-xs font-semibold text-gray-600 text-center truncate w-full px-1">
          {hackName || 'Hackathon Event'}
        </p>

        {/* Timestamp */}
        <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
          <Clock size={10} />
          <span>Generated at {timeStr} · {dateStr}</span>
        </div>

        {/* Download button */}
        <button
          onClick={handleDownload}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold
            bg-gradient-to-r ${meta.gradient} text-white shadow-sm
            hover:shadow-md hover:opacity-90 transition-all cursor-pointer`}
        >
          <Download size={13} />
          Download QR
        </button>
      </div>
    </div>
  );
}
