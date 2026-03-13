import { useState } from 'react';
import QRCode from 'qrcode';
import { QrCode, Download, DoorOpen, Coffee, Utensils, Sparkles, CheckCircle2, Clock } from 'lucide-react';
import QRCodeSelector from './QRCodeSelector';

const QR_ACTIONS = ['entry', 'lunch', 'dinner'];

const ACTION_META = {
  entry:  { label: 'Entry QR',  icon: DoorOpen,  color: '#1E3A8A', emoji: '🚪' },
  lunch:  { label: 'Lunch QR',  icon: Coffee,    color: '#92400E', emoji: '🍽️' },
  dinner: { label: 'Dinner QR', icon: Utensils,  color: '#4C1D95', emoji: '🍛' },
};

/** Generates a UUID-like random token */
function randomToken() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
    (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
  );
}

/**
 * Generates a QR PNG with a white-padded label banner below the QR, then triggers download.
 * hackName and action label are printed on the banner.
 */
async function generateAndDownload(action, qrValue, hackName) {
  const meta = ACTION_META[action];
  const QR_SIZE = 300;
  const PADDING = 20;
  const BANNER  = 52;  // height of label area at bottom
  const W = QR_SIZE + PADDING * 2;
  const H = QR_SIZE + PADDING * 2 + BANNER;

  // 1. Get QR as data URL (with error correction H)
  const qrDataUrl = await QRCode.toDataURL(qrValue, {
    width: QR_SIZE,
    margin: 0,
    color: { dark: meta.color, light: '#ffffff' },
    errorCorrectionLevel: 'H',
  });

  // 2. Draw onto a canvas with white frame + label banner
  const canvas = document.createElement('canvas');
  canvas.width  = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  // White background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, H);

  // QR image
  const img = new Image();
  await new Promise(resolve => { img.onload = resolve; img.src = qrDataUrl; });
  ctx.drawImage(img, PADDING, PADDING, QR_SIZE, QR_SIZE);

  // Separator line
  ctx.strokeStyle = '#e5e7eb';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(PADDING, QR_SIZE + PADDING + 1);
  ctx.lineTo(W - PADDING, QR_SIZE + PADDING + 1);
  ctx.stroke();

  // Action label (large)
  ctx.fillStyle = meta.color;
  ctx.font = 'bold 16px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`${meta.emoji} ${meta.label}`, W / 2, QR_SIZE + PADDING + 24);

  // Hackathon name (small, grey)
  ctx.fillStyle = '#6b7280';
  ctx.font = '11px system-ui, sans-serif';
  ctx.fillText(hackName || 'Hackathon Event', W / 2, QR_SIZE + PADDING + 42);

  // 3. Trigger download
  const link = document.createElement('a');
  link.download = `${action}-qr-${(hackName || 'event').replace(/\s+/g, '-')}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

/**
 * GenerateQRCodeSection
 * Props: hackathonId, hackName
 */
export default function GenerateQRCodeSection({ hackathonId, hackName }) {
  const [selected,  setSelected]  = useState(new Set(['entry', 'lunch', 'dinner']));
  const [loading,   setLoading]   = useState(false);
  const [history,   setHistory]   = useState([]); // [{actions, token, at}]

  const handleGenerate = async () => {
    if (selected.size === 0 || loading) return;
    setLoading(true);

    const token = randomToken();
    const now   = new Date();
    const actions = QR_ACTIONS.filter(a => selected.has(a));

    // Fire all downloads (sequentially to avoid browser popup blocks)
    for (const action of actions) {
      const qrValue = `hackathonId:${hackathonId || 'HACK001'}|action:${action}|token:${token}`;
      await generateAndDownload(action, qrValue, hackName);
      // Small gap between browser download triggers
      await new Promise(r => setTimeout(r, 120));
    }

    // Append to history log
    setHistory(prev => [{ actions, token: token.slice(0, 8), at: now }, ...prev.slice(0, 4)]);
    setLoading(false);
  };

  const noneSelected = selected.size === 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_4px_rgba(0,0,0,0.04)] overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-royal to-blue-500 flex items-center justify-center">
            <QrCode size={16} className="text-white" />
          </div>
          <h3 className="text-base font-bold text-gray-800">Generate Event QR Codes</h3>
        </div>
        <p className="text-xs text-gray-400 ml-[42px]">
          Select the QR types you need, click <strong>Generate &amp; Download</strong> — the PNG files will be saved to your device immediately.
        </p>
      </div>

      <div className="p-6 grid lg:grid-cols-[320px_1fr] gap-6">

        {/* ── Left panel ── */}
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
              Select QR Types
            </p>
            <QRCodeSelector selected={selected} onChange={setSelected} />
          </div>

          {/* CTA button */}
          <button
            onClick={handleGenerate}
            disabled={noneSelected || loading}
            className={`flex items-center justify-center gap-2.5 w-full py-3.5 rounded-xl text-sm font-bold
              transition-all cursor-pointer shadow-sm select-none
              ${noneSelected || loading
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                : 'bg-gradient-to-r from-royal to-blue-500 text-white hover:shadow-lg hover:shadow-royal/25 hover:opacity-95 active:scale-[0.98]'
              }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin" width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
                Generating &amp; Downloading…
              </>
            ) : (
              <>
                <Download size={15} />
                Generate &amp; Download QR{selected.size > 1 ? 's' : ''}
              </>
            )}
          </button>

          {noneSelected && (
            <p className="text-[10px] text-amber-600 text-center font-medium">
              Select at least one QR type.
            </p>
          )}

          {/* Info note */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
            <p className="text-[11px] text-blue-700 font-semibold mb-1">ℹ️ How it works</p>
            <ul className="text-[10px] text-blue-600 space-y-0.5 list-disc list-inside leading-relaxed">
              <li>Each generation creates a unique token</li>
              <li>QR PNGs are saved directly to your device</li>
              <li>Print and place at the event station</li>
              <li>Participants scan to check-in automatically</li>
            </ul>
          </div>
        </div>

        {/* ── Right panel — download history ── */}
        <div className="flex flex-col gap-3">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Download History
          </p>

          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 min-h-[200px] border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/40 text-center px-6">
              <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-3">
                <QrCode size={20} className="text-gray-300" />
              </div>
              <p className="text-sm font-bold text-gray-400">No downloads yet</p>
              <p className="text-xs text-gray-300 mt-1 max-w-[180px]">
                Generated QR codes will be auto-downloaded and logged here.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {history.map((h, i) => (
                <div
                  key={h.token + i}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 border border-gray-100"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                    <CheckCircle2 size={16} className="text-emerald-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-700">
                      {h.actions.map(a => ACTION_META[a].emoji + ' ' + ACTION_META[a].label).join('  ·  ')}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
                      <Clock size={9} />
                      {h.at.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                      &nbsp;·&nbsp;token: <span className="font-mono">{h.token}…</span>
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full ring-1 ring-emerald-200 shrink-0">
                    Downloaded
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
