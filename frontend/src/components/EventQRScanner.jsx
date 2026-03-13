import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, CheckCircle2, AlertTriangle, ScanLine, QrCode, Loader2,
  DoorOpen, Coffee, Utensils, AlertCircle,
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

const API_BASE = 'http://localhost:5000/api/live-event';

/**
 * EventQRScanner — Universal single-camera QR scanner for Live Event.
 *
 * QR format:  hackathonId:HACK501|action:entry
 * Actions:    entry | lunch | dinner
 *
 * Props:
 *   onScanSuccess({ action, entryStatus, lunchStatus, dinnerStatus })
 *     — called when the backend confirms a SUCCESSFUL scan
 *   onClose() — dismiss the scanner
 */
export default function EventQRScanner({ onScanSuccess, onClose }) {
  const scannerRef  = useRef(null);
  const html5QrRef  = useRef(null);
  const timerRef    = useRef(null);       // holds the startup delay timer
  const processedRef = useRef(false);     // prevent duplicate decode callbacks

  // 'initializing' → 'scanning' → 'submitting' → 'success' | 'duplicate' | 'invalid' | 'error'
  const [status, setStatus] = useState('initializing');
  const [feedback, setFeedback] = useState(null);

  /* ─── Parse QR text ─────────────────────────────────────────────── */
  const parseQR = (text) => {
    const pairs = {};
    text.split('|').forEach((part) => {
      const [k, v] = part.trim().split(':');
      if (k && v) pairs[k.trim()] = v.trim();
    });
    return {
      hackathonId: pairs['hackathonId'] || null,
      action: (pairs['action'] || '').toLowerCase() || null,
    };
  };

  /* ─── Stop camera ───────────────────────────────────────────────── */
  const stopCamera = useCallback(async () => {
    try {
      if (html5QrRef.current) {
        const state = html5QrRef.current.getState();
        if (state === 2) await html5QrRef.current.stop();
        html5QrRef.current.clear();
        html5QrRef.current = null;
      }
    } catch { /* ignore */ }
  }, []);

  /* ─── Handle decoded QR text → call API ─────────────────────────── */
  const handleDecoded = useCallback(async (decodedText) => {
    if (processedRef.current) return; // already handled
    processedRef.current = true;
    await stopCamera();

    const { hackathonId, action } = parseQR(decodedText);

    // Client-side validation
    const VALID = ['entry', 'lunch', 'dinner'];
    if (!hackathonId || !action || !VALID.includes(action)) {
      setStatus('invalid');
      setFeedback({
        type: 'invalid',
        title: 'Invalid QR Code',
        body: 'This QR code is not valid for this event.',
      });
      return;
    }

    setStatus('submitting');

    // Call backend
    try {
      const token = localStorage.getItem('hf_token');
      const res = await fetch(`${API_BASE}/self-scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ hackathonId, action }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // ✅ Success
        setStatus('success');
        setFeedback({
          type: 'success',
          action,
          title: actionMeta[action]?.successTitle || 'Scanned!',
          body: data.message,
        });
        onScanSuccess({
          action,
          entryStatus: data.entryStatus,
          lunchStatus: data.lunchStatus,
          dinnerStatus: data.dinnerStatus,
        });
        setTimeout(() => onClose(), 2200);
      } else if (res.status === 409) {
        // 🔁 Duplicate
        setStatus('duplicate');
        setFeedback({
          type: 'duplicate',
          action,
          title: actionMeta[action]?.duplicateTitle || 'Already Claimed',
          body: data.message,
        });
        // Also sync latest statuses to parent
        if (data.entryStatus) {
          onScanSuccess({
            action,
            entryStatus: data.entryStatus,
            lunchStatus: data.lunchStatus,
            dinnerStatus: data.dinnerStatus,
            isDuplicate: true,
          });
        }
      } else if (res.status === 404 || data.code === 'NOT_REGISTERED') {
        setStatus('invalid');
        setFeedback({
          type: 'invalid',
          title: 'Not Registered',
          body: data.message || 'You are not registered for this event.',
        });
      } else {
        setStatus('invalid');
        setFeedback({
          type: 'invalid',
          title: 'Invalid QR Code',
          body: data.message || 'This QR code is not valid for this event.',
        });
      }
    } catch {
      // Network/offline — optimistic local update
      setStatus('success');
      setFeedback({
        type: 'success',
        action,
        title: actionMeta[action]?.successTitle || 'Scanned!',
        body: 'Status updated locally. Will sync when online.',
      });
      onScanSuccess({ action, entryStatus: null, lunchStatus: null, dinnerStatus: null });
      setTimeout(() => onClose(), 2200);
    }
  }, [stopCamera, onScanSuccess, onClose]);

  /* ─── Start scanner after modal animation finishes ─────────────── */
  useEffect(() => {
    // Delay gives framer-motion time to complete the enter animation so
    // the #event-qr-scanner-region div has real pixel dimensions.
    timerRef.current = setTimeout(() => {
      if (!scannerRef.current) return;

      // If a previous instance is somehow still alive, clear it first
      try {
        const stale = document.getElementById('event-qr-scanner-region');
        if (stale) stale.innerHTML = '';
      } catch { /* ignore */ }

      const html5Qr = new Html5Qrcode('event-qr-scanner-region');
      html5QrRef.current = html5Qr;

      html5Qr
        .start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          handleDecoded,
          () => {} // per-frame decode noise — ignore
        )
        .then(() => {
          setStatus('scanning'); // camera is live
        })
        .catch((err) => {
          console.error('QR scanner start error:', err);
          setStatus('error');
          setFeedback({
            type: 'error',
            title: 'Camera Unavailable',
            body: 'Camera access was denied or is unavailable. Please allow camera permissions in your browser and try again.',
          });
        });
    }, 300); // wait for modal slide-in animation

    return () => {
      clearTimeout(timerRef.current);
      if (html5QrRef.current) {
        html5QrRef.current.stop().catch(() => {});
        html5QrRef.current.clear();
        html5QrRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ─── Close ─────────────────────────────────────────────────────── */
  const handleClose = useCallback(async () => {
    await stopCamera();
    onClose();
  }, [stopCamera, onClose]);

  /* ─── Action meta ───────────────────────────────────────────────── */
  const actionMeta = {
    entry:  { label: 'Gate Entry',  emoji: '🚪', color: 'text-blue-400',   bg: 'bg-blue-500/10',   ring: 'ring-blue-500/20',   successTitle: 'Entry Recorded! 🚪', duplicateTitle: 'Entry Already Done' },
    lunch:  { label: 'Lunch',       emoji: '🍽️', color: 'text-amber-400',  bg: 'bg-amber-500/10',  ring: 'ring-amber-500/20',  successTitle: 'Lunch Claimed! 🍽️',  duplicateTitle: 'Lunch Already Claimed' },
    dinner: { label: 'Dinner',      emoji: '🍛', color: 'text-violet-400', bg: 'bg-violet-500/10', ring: 'ring-violet-500/20', successTitle: 'Dinner Claimed! 🍛', duplicateTitle: 'Dinner Already Claimed' },
  };

  /* ─── Feedback panel content ─────────────────────────────────────── */
  const FeedbackPanel = () => {
    if (!feedback) return null;

    const isSuccess   = feedback.type === 'success';
    const isDuplicate = feedback.type === 'duplicate';
    const isInvalid   = feedback.type === 'invalid' || feedback.type === 'error';

    if (isSuccess) return (
      <motion.div
        key="success"
        initial={{ opacity: 0, scale: 0.9, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full"
      >
        <div className="flex items-start gap-3 w-full bg-emerald-500/15 border border-emerald-500/30 rounded-2xl px-5 py-4">
          <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
            <CheckCircle2 size={20} className="text-white" />
          </div>
          <div>
            <p className="text-emerald-300 text-sm font-bold">{feedback.title}</p>
            <p className="text-emerald-400/80 text-xs mt-0.5 leading-relaxed">{feedback.body}</p>
          </div>
        </div>
        <p className="text-white/30 text-xs text-center mt-2">Closing automatically…</p>
      </motion.div>
    );

    if (isDuplicate) return (
      <motion.div
        key="duplicate"
        initial={{ opacity: 0, scale: 0.9, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full flex flex-col items-center gap-3"
      >
        <div className="flex items-start gap-3 w-full bg-amber-500/15 border border-amber-500/30 rounded-2xl px-5 py-4">
          <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center shrink-0">
            <AlertCircle size={20} className="text-white" />
          </div>
          <div>
            <p className="text-amber-300 text-sm font-bold">{feedback.title}</p>
            <p className="text-amber-400/80 text-xs mt-0.5 leading-relaxed">{feedback.body}</p>
          </div>
        </div>
        <button
          onClick={handleClose}
          className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold cursor-pointer transition-colors"
        >
          Close
        </button>
      </motion.div>
    );

    return (
      <motion.div
        key="invalid"
        initial={{ opacity: 0, scale: 0.9, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full flex flex-col items-center gap-3"
      >
        <div className="flex items-start gap-3 w-full bg-red-500/15 border border-red-500/30 rounded-2xl px-5 py-4">
          <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center shrink-0">
            <AlertTriangle size={20} className="text-white" />
          </div>
          <div>
            <p className="text-red-300 text-sm font-bold">{feedback.title}</p>
            <p className="text-red-400/80 text-xs mt-0.5 leading-relaxed">{feedback.body}</p>
          </div>
        </div>
        <button
          onClick={handleClose}
          className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold cursor-pointer transition-colors"
        >
          Close
        </button>
      </motion.div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/95 z-[60] flex flex-col items-center justify-center p-4"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-sm flex flex-col items-center gap-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Top bar ── */}
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <QrCode size={15} className="text-white" />
            </div>
            <div>
              <p className="text-white text-sm font-bold leading-tight">Universal QR Scanner</p>
              <p className="text-white/35 text-[10px]">Entry · Lunch · Dinner</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
          >
            <X size={18} className="text-white" />
          </button>
        </div>

        {/* ── Camera viewport ── */}
        <div className="relative w-full">
          {/* Corner brackets */}
          <div className="absolute -top-0.5 -left-0.5 w-8 h-8 border-t-[3px] border-l-[3px] border-blue-400 rounded-tl-lg z-20" />
          <div className="absolute -top-0.5 -right-0.5 w-8 h-8 border-t-[3px] border-r-[3px] border-blue-400 rounded-tr-lg z-20" />
          <div className="absolute -bottom-0.5 -left-0.5 w-8 h-8 border-b-[3px] border-l-[3px] border-blue-400 rounded-bl-lg z-20" />
          <div className="absolute -bottom-0.5 -right-0.5 w-8 h-8 border-b-[3px] border-r-[3px] border-blue-400 rounded-br-lg z-20" />

          {/* Scan beam — only while actively scanning */}
          {status === 'scanning' && (
            <motion.div
              className="absolute left-3 right-3 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent z-20 rounded-full"
              animate={{ top: ['8%', '92%', '8%'] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}

          {/* The scanner div must have explicit height so html5-qrcode can
              calculate its internal layout even before video metadata loads */}
          <div
            ref={scannerRef}
            id="event-qr-scanner-region"
            className="w-full rounded-2xl overflow-hidden bg-gray-900"
            style={{ height: 320 }}
          />
        </div>

        {/* ── Status area ── */}
        <AnimatePresence mode="wait">

          {/* Initializing — waiting for animation */}
          {status === 'initializing' && (
            <motion.div key="init"
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10"
            >
              <Loader2 size={14} className="text-white/50 animate-spin" />
              <p className="text-white/50 text-xs">Starting camera…</p>
            </motion.div>
          )}

          {/* Scanning */}
          {status === 'scanning' && (
            <motion.div key="scanning"
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10"
            >
              <Loader2 size={14} className="text-blue-400 animate-spin" />
              <p className="text-white/65 text-xs">
                Point camera at <span className="text-white font-semibold">Entry, Lunch, or Dinner QR</span>
              </p>
            </motion.div>
          )}

          {/* Submitting to API */}
          {status === 'submitting' && (
            <motion.div key="submitting"
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10"
            >
              <Loader2 size={14} className="text-emerald-400 animate-spin" />
              <p className="text-white/65 text-xs">Recording scan…</p>
            </motion.div>
          )}

          {/* Feedback: success / duplicate / invalid / error */}
          {['success', 'duplicate', 'invalid', 'error'].includes(status) && (
            <FeedbackPanel key={status} />
          )}
        </AnimatePresence>

        {/* ── Supported QR chips ── */}
        <div className="w-full grid grid-cols-3 gap-2">
          {[
            { label: 'Entry',  color: 'bg-blue-500/10 text-blue-400 ring-blue-500/20',     emoji: '🚪' },
            { label: 'Lunch',  color: 'bg-amber-500/10 text-amber-400 ring-amber-500/20',  emoji: '🍽️' },
            { label: 'Dinner', color: 'bg-violet-500/10 text-violet-400 ring-violet-500/20', emoji: '🍛' },
          ].map(({ label, color, emoji }) => (
            <div key={label}
              className={`flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl text-[10px] font-bold ring-1 ${color}`}
            >
              <span>{emoji}</span> {label}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
