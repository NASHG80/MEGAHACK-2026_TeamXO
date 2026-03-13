import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Upload, PenTool, ChevronRight, Users, Send, Check,
  X, Loader2, Mail, AlertCircle, MousePointerClick,
  RotateCcw, Award, ArrowLeft, CheckCircle2, Clock,
  XCircle, RefreshCw, Eye, Search, Filter,
} from 'lucide-react';
import OrganizerSidebar from '../../components/OrganizerSidebar';

const API_BASE   = 'http://localhost:5000/api/certificates';
const TOKEN      = () => localStorage.getItem('hf_token') || '';
const HACKATHON  = () => localStorage.getItem('hf_active_hackathon') || '';

/* ── Auth header helper ────────────────────────────────── */
const authHeader = () => ({ Authorization: `Bearer ${TOKEN()}` });

/* ═══════════════════════════════════════════════════════════
   STATUS PILL
═══════════════════════════════════════════════════════════ */
const STATUSES = {
  idle:     { label: 'Not Sent',  Icon: Clock,        cls: 'bg-gray-100 text-gray-500' },
  sending:  { label: 'Sending…',  Icon: Loader2,      cls: 'bg-blue-50 text-blue-600' },
  sent:     { label: 'Sent ✓',    Icon: CheckCircle2, cls: 'bg-emerald-50 text-emerald-700' },
  failed:   { label: 'Failed',    Icon: XCircle,      cls: 'bg-red-50 text-red-600' },
};

function StatusPill({ status }) {
  const { label, Icon, cls } = STATUSES[status] || STATUSES.idle;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full ${cls}`}>
      <Icon size={10} className={status === 'sending' ? 'animate-spin' : ''} />
      {label}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════
   LANDING VIEW
═══════════════════════════════════════════════════════════ */
function LandingView({ onUpload, onCreate }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-8 px-4">
      <div className="text-center mb-2">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto mb-4 shadow-sm">
          <Award size={26} className="text-amber-500" />
        </div>
        <h1 className="text-2xl font-extrabold text-dark">Certificate Manager</h1>
        <p className="text-sm text-gray-500 mt-1.5 max-w-sm mx-auto">
          Choose how you'd like to create and distribute certificates for your participants.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-5 w-full max-w-2xl">
        {/* Upload card */}
        <button
          onClick={onUpload}
          className="group text-left bg-white rounded-2xl border-2 border-dashed border-royal/30 p-7
                     hover:border-royal hover:shadow-[0_4px_24px_rgba(30,100,255,0.12)] transition-all cursor-pointer"
        >
          <div className="w-12 h-12 rounded-xl bg-royal/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Upload size={22} className="text-royal" />
          </div>
          <h2 className="text-base font-extrabold text-dark mb-1.5">Upload Ready Template</h2>
          <p className="text-sm text-gray-500 leading-relaxed mb-4">
            Upload your pre-designed certificate image. Click to mark where each student's name should appear, then send to everyone in one click.
          </p>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-royal group-hover:gap-2.5 transition-all">
            Upload & Configure <ChevronRight size={14} />
          </span>
        </button>

        {/* Create card */}
        <button
          onClick={onCreate}
          className="group text-left bg-white rounded-2xl border-2 border-dashed border-violet-300 p-7
                     hover:border-violet-500 hover:shadow-[0_4px_24px_rgba(139,92,246,0.12)] transition-all cursor-pointer"
        >
          <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <PenTool size={22} className="text-violet-600" />
          </div>
          <h2 className="text-base font-extrabold text-dark mb-1.5">Create in Editor</h2>
          <p className="text-sm text-gray-500 leading-relaxed mb-4">
            Design your certificate from scratch using our drag-and-drop editor with text, images, and layout controls.
          </p>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-violet-600 group-hover:gap-2.5 transition-all">
            Open Editor <ChevronRight size={14} />
          </span>
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   UPLOAD + NAME POSITION VIEW
═══════════════════════════════════════════════════════════ */
function UploadPositionView({ onComplete, onBack }) {
  const [phase, setPhase]             = useState('upload');
  const [preview, setPreview]         = useState(null);
  const [templateName, setTemplateName] = useState('');
  const [namePos, setNamePos]         = useState({ x: 0.5, y: 0.45 });
  const [fontSize, setFontSize]       = useState(52);
  const [nameColor, setNameColor]     = useState('#1E3A8A');
  const [sampleName, setSampleName]   = useState('John Doe');
  const [dragging, setDragging]       = useState(false);
  const [error, setError]             = useState('');
  const imgRef = useRef(null);

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) { setError('Please upload a PNG or JPG image.'); return; }
    setError('');
    setTemplateName(file.name.replace(/\.[^.]+$/, '') || 'My Certificate');
    const reader = new FileReader();
    reader.onload = e => { setPreview(e.target.result); setPhase('position'); };
    reader.readAsDataURL(file);
  };

  const handleImgClick = (e) => {
    if (!imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    setNamePos({
      x: Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width)),
      y: Math.min(1, Math.max(0, (e.clientY - rect.top)  / rect.height)),
    });
  };

  const handleSave = async () => {
    const hackId = HACKATHON();
    if (!hackId) { setError('No active hackathon. Go to Dashboard and activate one first.'); return; }
    setPhase('saving');
    setError('');
    try {
      // Convert data-URI → Blob → FormData
      const blob = await (await fetch(preview)).blob();
      const fd   = new FormData();
      fd.append('hackathonId',    hackId);
      fd.append('name',           templateName || 'My Certificate');
      fd.append('templateType',   'upload');
      fd.append('backgroundImage', blob, 'certificate.jpg');

      const { data: d1 } = await axios.post(`${API_BASE}/templates`, fd, {
        headers: { ...authHeader(), 'Content-Type': 'multipart/form-data' },
      });
      const templateId = d1.template._id;

      // Save name position
      await axios.put(`${API_BASE}/template/${templateId}/name-position`, {
        nameX: namePos.x, nameY: namePos.y, fontSize, nameColor,
      }, { headers: authHeader() });

      onComplete({ templateId, backgroundImageUrl: preview, nameX: namePos.x, nameY: namePos.y, fontSize, nameColor, templateName });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to save template. Please try again.');
      setPhase('position');
    }
  };

  /* ── Upload Phase ── */
  if (phase === 'upload') return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-royal mb-6 cursor-pointer transition-colors">
        <ArrowLeft size={14} /> Back
      </button>
      <h2 className="text-xl font-extrabold text-dark mb-1">Upload Certificate Template</h2>
      <p className="text-sm text-gray-500 mb-6">PNG or JPG. Landscape orientation recommended (e.g. 1200×850 px).</p>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      <label
        htmlFor="cert-upload"
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
        className={`flex flex-col items-center justify-center gap-4 w-full h-64 rounded-2xl border-2 border-dashed cursor-pointer transition-all
          ${dragging ? 'border-royal bg-royal/5' : 'border-gray-200 bg-gray-50 hover:border-royal/40 hover:bg-royal/[0.02]'}`}
      >
        <div className="w-14 h-14 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center justify-center">
          <Upload size={24} className="text-royal" />
        </div>
        <div className="text-center">
          <p className="text-sm font-bold text-dark">Drop your certificate image here</p>
          <p className="text-xs text-gray-400 mt-1">or click to browse</p>
        </div>
        <input id="cert-upload" type="file" accept="image/png,image/jpeg,image/jpg,image/webp" className="hidden"
          onChange={e => handleFile(e.target.files[0])} />
      </label>
    </div>
  );

  /* ── Position Phase ── */
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <button onClick={() => setPhase('upload')} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-royal cursor-pointer">
          <ArrowLeft size={14} /> Back
        </button>
        <div className="flex items-center gap-2 bg-royal/5 border border-royal/10 px-3 py-1.5 rounded-lg">
          <MousePointerClick size={13} className="text-royal" />
          <span className="text-xs font-bold text-royal">Click on the certificate to place the name</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_290px] gap-6">
        {/* Certificate preview */}
        <div className="space-y-2">
          <div
            className="relative rounded-2xl overflow-hidden border-2 border-royal/20 shadow-lg cursor-crosshair select-none"
            onClick={handleImgClick}
          >
            <img ref={imgRef} src={preview} alt="certificate" className="w-full h-auto block" draggable={false} />
            {/* Marker */}
            <div
              className="absolute pointer-events-none"
              style={{ left: `${namePos.x * 100}%`, top: `${namePos.y * 100}%`, transform: 'translate(-50%,-50%)' }}
            >
              <div className="relative flex items-center justify-center">
                <div className="absolute w-10 h-px bg-royal/70" />
                <div className="absolute h-10 w-px bg-royal/70" />
                <div className="w-3 h-3 rounded-full bg-royal border-2 border-white shadow-md" />
              </div>
              <div style={{
                position: 'absolute', top: '50%', left: '50%',
                transform: 'translate(-50%, 14px)',
                fontSize: `${Math.max(9, fontSize * 0.22)}px`,
                color: nameColor, fontFamily: "Georgia,'Times New Roman',serif",
                fontWeight: 'bold', whiteSpace: 'nowrap',
                textShadow: '0 0 8px rgba(255,255,255,0.9)',
              }}>
                {sampleName}
              </div>
            </div>
          </div>
          <p className="text-xs text-center text-gray-400">Click anywhere to reposition. The marker shows where the name will be stamped.</p>
        </div>

        {/* Controls */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <h3 className="text-sm font-extrabold text-dark">Configuration</h3>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Template Name</label>
              <input value={templateName} onChange={e => setTemplateName(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-royal/20 focus:border-royal transition-all"
                placeholder="e.g. Participation Certificate" />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Preview Name</label>
              <input value={sampleName} onChange={e => setSampleName(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-royal/20 focus:border-royal transition-all"
                placeholder="e.g. John Doe" />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                Font Size — {fontSize}px
              </label>
              <input type="range" min={18} max={120} value={fontSize}
                onChange={e => setFontSize(Number(e.target.value))} className="w-full accent-royal" />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Name Colour</label>
              <div className="flex items-center gap-3">
                <input type="color" value={nameColor} onChange={e => setNameColor(e.target.value)}
                  className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5" />
                <span className="text-sm font-mono text-gray-600">{nameColor}</span>
                {/* Quick preset colours */}
                {['#1E3A8A','#111827','#7C3AED','#B45309','#DC2626'].map(c => (
                  <button key={c} onClick={() => setNameColor(c)}
                    className="w-6 h-6 rounded-full border-2 border-white shadow-sm hover:scale-110 transition-transform cursor-pointer"
                    style={{ background: c }} />
                ))}
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl px-3 py-2.5 text-xs text-gray-400 space-y-1">
              <p>📍 Position: ({Math.round(namePos.x * 100)}%, {Math.round(namePos.y * 100)}%)</p>
              <p>Click the certificate image to reposition.</p>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
              <AlertCircle size={12} className="mt-0.5 shrink-0" /> {error}
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={phase === 'saving'}
            className="w-full flex items-center justify-center gap-2 py-3 bg-royal text-white rounded-xl text-sm font-bold hover:bg-blue-700 disabled:opacity-60 transition-colors shadow-sm cursor-pointer"
          >
            {phase === 'saving'
              ? <><Loader2 size={15} className="animate-spin" /> Saving Template…</>
              : <><Check size={15} /> Confirm & View Students</>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   STUDENT ROSTER VIEW
   — Fetches all registrations from backend
   — Send All / individual send
   — Real-time status polling
═══════════════════════════════════════════════════════════ */
function StudentRosterView({ templateConfig, onBack }) {
  const { templateId, backgroundImageUrl, nameX, nameY, fontSize, nameColor, templateName } = templateConfig;

  const ORGS_API = 'http://localhost:5000/api/organizer/hackathons';

  /* ── Hackathon selector states ── */
  const [hackathons,    setHackathons]    = useState([]);
  const [activeSlug,    setActiveSlug]    = useState('');
  const [hackathon,     setHackathon]     = useState(null);

  /* ── Data states ── */
  const [recipients,    setRecipients]    = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [fetchError,    setFetchError]    = useState('');
  const [search,        setSearch]        = useState('');

  /* ── Send states ── */
  const [sendStatus,    setSendStatus]    = useState({});
  const [globalSending, setGlobalSending] = useState(false);
  const [sendError,     setSendError]     = useState('');
  const [progress,      setProgress]      = useState({ total: 0, sent: 0, failed: 0 });

  const pollRef = useRef(null);
  const stopPoll = () => { if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; } };
  useEffect(() => () => stopPoll(), []);

  /* ── Step 1: fetch organizer's hackathon list ── */
  useEffect(() => {
    setLoading(true);
    axios.get(ORGS_API, { headers: authHeader() })
      .then(res => {
        const list = res.data.data || [];
        setHackathons(list);
        if (list.length > 0) {
          // prefer the stored active hackathon, else pick first
          const storedId = localStorage.getItem('hf_active_hackathon') || '';
          const match    = list.find(h => h._id === storedId) || list[0];
          setActiveSlug(match.slug);
        } else {
          setFetchError('You have no hackathons. Create one first.');
          setLoading(false);
        }
      })
      .catch(err => {
        setFetchError(err.response?.data?.message || 'Could not load hackathons. Make sure you are logged in as an organizer.');
        setLoading(false);
      });
  }, []);

  /* ── Step 2: when activeSlug changes, fetch shortlisted recipients ── */
  useEffect(() => {
    if (!activeSlug) return;
    setLoading(true);
    setRecipients([]);
    setHackathon(null);
    setFetchError('');
    setSendStatus({});
    setGlobalSending(false);

    Promise.all([
      axios.get(`${ORGS_API}/${activeSlug}/shortlisted-recipients`, { headers: authHeader() }),
      axios.get(`${API_BASE}/status/${activeSlug}`, { headers: authHeader() }).catch(() => ({ data: { certs: [] } })),
    ])
      .then(([recipientsRes, statusRes]) => {
        const list  = recipientsRes.data.recipients || [];
        const certs = statusRes.data.certs          || [];

        setRecipients(list);
        setHackathon(recipientsRes.data.hackathon || null);

        const statusMap = {};
        list.forEach(r => { statusMap[r.email] = 'idle'; });

        const sorted = [...certs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        const seen = new Set();
        sorted.forEach(c => {
          if (!seen.has(c.recipientEmail)) {
            seen.add(c.recipientEmail);
            if (c.status === 'sent')                                         statusMap[c.recipientEmail] = 'sent';
            else if (c.status === 'failed')                                  statusMap[c.recipientEmail] = 'failed';
            else if (c.status === 'generated' || c.status === 'pending')     statusMap[c.recipientEmail] = 'sending';
          }
        });
        setSendStatus(statusMap);

        const stillPending = certs.some(c => c.status === 'pending' || c.status === 'generated');
        if (stillPending) { setGlobalSending(true); startPolling(); }
      })
      .catch(err => {
        console.error('Failed to fetch recipients:', err);
        setFetchError(err.response?.data?.message || 'Could not load shortlisted students. Make sure you have shortlisted teams in ManageHackathon first.');
      })
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSlug]);

  /* ── Poll generation status from backend ── */
  const startPolling = useCallback(() => {
    stopPoll();
    pollRef.current = setInterval(async () => {
      try {
        const { data } = await axios.get(`${API_BASE}/status/${activeSlug}`, { headers: authHeader() });
        const certs = data.certs || [];

        const newStatus = {};
        certs.forEach(c => {
          if (c.status === 'sent')        newStatus[c.recipientEmail] = 'sent';
          else if (c.status === 'failed') newStatus[c.recipientEmail] = 'failed';
          else                            newStatus[c.recipientEmail] = 'sending';
        });

        setSendStatus(prev => ({ ...prev, ...newStatus }));
        setProgress({ total: data.total, sent: data.sent, failed: data.failed });

        if (data.pending === 0 && data.total > 0) {
          stopPoll();
          setGlobalSending(false);
        }
      } catch { /* ignore transient errors */ }
    }, 1500);
  }, [activeSlug]);

  /* ── Send ALL ── */
  const sendAll = async () => {
    if (!activeSlug) { setSendError('No hackathon selected.'); return; }
    setSendError('');
    setGlobalSending(true);
    const sending = {};
    recipients.forEach(r => { sending[r.email] = 'sending'; });
    setSendStatus(sending);
    setProgress({ total: recipients.length, sent: 0, failed: 0 });
    try {
      await axios.post(
        `${API_BASE}/generate-personalized/${activeSlug}`,
        { templateId, sendToAll: true },
        { headers: authHeader() }
      );
      startPolling();
    } catch (err) {
      console.error('Send all failed:', err);
      setSendError(err.response?.data?.message || 'Failed to start certificate generation. Please try again.');
      setGlobalSending(false);
      const reset = {}; recipients.forEach(r => { reset[r.email] = 'idle'; }); setSendStatus(reset);
    }
  };

  /* ── Send ONE ── */
  const sendOne = async (recipient) => {
    if (!activeSlug) { setSendError('No hackathon selected.'); return; }
    setSendError('');
    setSendStatus(prev => ({ ...prev, [recipient.email]: 'sending' }));
    try {
      await axios.post(
        `${API_BASE}/generate-personalized/${activeSlug}`,
        { templateId, recipients: [{ name: recipient.name, email: recipient.email, type: recipient.type }] },
        { headers: authHeader() }
      );
      const individualPoll = setInterval(async () => {
        try {
          const { data } = await axios.get(`${API_BASE}/status/${activeSlug}`, { headers: authHeader() });
          const match = (data.certs || [])
            .filter(c => c.recipientEmail === recipient.email)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
          if (match && match.status !== 'pending') {
            setSendStatus(prev => ({ ...prev, [recipient.email]: match.status === 'sent' ? 'sent' : 'failed' }));
            clearInterval(individualPoll);
          }
        } catch { clearInterval(individualPoll); }
      }, 1200);
      setTimeout(() => {
        clearInterval(individualPoll);
        setSendStatus(prev => { if (prev[recipient.email] === 'sending') return { ...prev, [recipient.email]: 'failed' }; return prev; });
      }, 60000);
    } catch (err) {
      console.error('Send one failed:', err);
      setSendStatus(prev => ({ ...prev, [recipient.email]: 'failed' }));
    }
  };

  /* ── Filtered list ── */
  const filtered = search.trim()
    ? recipients.filter(r =>
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.email.toLowerCase().includes(search.toLowerCase())
      )
    : recipients;

  const sentCount   = Object.values(sendStatus).filter(s => s === 'sent').length;
  const failedCount = Object.values(sendStatus).filter(s => s === 'failed').length;
  const totalCount  = recipients.length;
  const pct         = totalCount > 0 ? Math.round(((sentCount + failedCount) / totalCount) * 100) : 0;

  /* ── LOADING ── */
  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40 gap-3">
      <Loader2 size={34} className="text-royal animate-spin" />
      <p className="text-sm text-gray-500 font-medium">Fetching registered students…</p>
    </div>
  );

  /* ── FETCH ERROR ── */
  if (fetchError) return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <AlertCircle size={40} className="text-red-400 mx-auto mb-4" />
      <h2 className="text-lg font-extrabold text-dark mb-2">Could Not Load Students</h2>
      <p className="text-sm text-gray-500 mb-6">{fetchError}</p>
      <button onClick={onBack} className="flex items-center gap-2 mx-auto px-5 py-2.5 bg-royal text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors cursor-pointer">
        <ArrowLeft size={14} /> Go Back
      </button>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">

      {/* ── Top bar ── */}
      <div className="flex items-center gap-4 mb-5 flex-wrap">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-royal cursor-pointer transition-colors">
          <ArrowLeft size={14} /> Change Template
        </button>
        <div className="flex-1" />
        {/* Hackathon selector */}
        {hackathons.length > 1 && (
          <div className="relative">
            <select
              value={activeSlug}
              onChange={e => setActiveSlug(e.target.value)}
              className="appearance-none text-xs font-bold text-dark bg-gray-100 border border-gray-200 rounded-lg pl-3 pr-8 py-1.5 focus:outline-none focus:ring-2 focus:ring-royal/20 cursor-pointer"
            >
              {hackathons.map(h => (
                <option key={h._id} value={h.slug}>{h.title}</option>
              ))}
            </select>
            <Filter size={11} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        )}
        {hackathon && (
          <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg">
            📌 {hackathon.name}
          </span>
        )}
      </div>

      {/* ── Error banner ── */}
      {sendError && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
          <AlertCircle size={14} className="shrink-0" /> {sendError}
          <button onClick={() => setSendError('')} className="ml-auto text-red-400 hover:text-red-600 cursor-pointer"><X size={14} /></button>
        </div>
      )}

      {/* ── Progress bar (shown while sending all) ── */}
      {globalSending && (
        <div className="bg-white rounded-2xl border border-royal/20 shadow-sm p-5 mb-5">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <Loader2 size={14} className="text-royal animate-spin" />
              <span className="text-sm font-bold text-dark">Generating & sending certificates…</span>
            </div>
            <span className="text-xs font-bold text-gray-500">{sentCount + failedCount} / {totalCount}</span>
          </div>
          <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-royal via-blue-500 to-emerald-400 rounded-full transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex gap-5 mt-2.5 text-xs font-semibold">
            <span className="text-emerald-600 flex items-center gap-1"><CheckCircle2 size={10} /> {sentCount} sent</span>
            {failedCount > 0 && <span className="text-red-500 flex items-center gap-1"><XCircle size={10} /> {failedCount} failed</span>}
            <span className="text-gray-400">{totalCount - sentCount - failedCount} remaining</span>
          </div>
        </div>
      )}

      {/* ── Stats + Send All row ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <div className="text-center">
              <p className="text-3xl font-extrabold text-dark">{totalCount}</p>
              <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wide mt-0.5">Students</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-extrabold text-emerald-600">{sentCount}</p>
              <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wide mt-0.5">Sent</p>
            </div>
            {failedCount > 0 && (
              <div className="text-center">
                <p className="text-3xl font-extrabold text-red-500">{failedCount}</p>
                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wide mt-0.5">Failed</p>
              </div>
            )}
            {sentCount > 0 && !globalSending && (
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl">
                <CheckCircle2 size={13} />
                {sentCount === totalCount ? 'All sent!' : `${sentCount} delivered`}
              </div>
            )}
          </div>

          <button
            onClick={sendAll}
            disabled={globalSending || totalCount === 0}
            className="flex items-center gap-2 px-6 py-3 bg-royal text-white rounded-xl text-sm font-bold
                       hover:bg-blue-700 disabled:opacity-50 transition-all shadow-sm shadow-royal/20 cursor-pointer"
          >
            {globalSending
              ? <><Loader2 size={15} className="animate-spin" /> Sending…</>
              : <><Send size={15} /> Send to All {totalCount > 0 && `(${totalCount})`}</>
            }
          </button>
        </div>
      </div>

      {/* ── Search bar ── */}
      <div className="relative mb-4">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-royal/20 focus:border-royal transition-all"
        />
      </div>

      {/* ── Student table ── */}
      {recipients.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center shadow-sm">
          <Users size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-base font-bold text-dark mb-1">No registrations found</p>
          <p className="text-sm text-gray-400">Students who register for this hackathon will appear here.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_1fr_auto_auto] gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100">
            <span className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider">Student</span>
            <span className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider">Email</span>
            <span className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider">Status</span>
            <span className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider">Action</span>
          </div>

          {filtered.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-400">No students match your search.</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filtered.map((rec, i) => {
                const status = sendStatus[rec.email] || 'idle';
                return (
                  <div
                    key={rec.id || `${rec.email}-${i}`}
                    className="grid grid-cols-[1fr_1fr_auto_auto] gap-4 items-center px-5 py-3.5 hover:bg-gray-50/50 transition-colors"
                  >
                    {/* Name */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-royal/10 text-royal text-sm font-extrabold flex items-center justify-center uppercase shrink-0">
                        {rec.name?.[0] || '?'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-dark truncate">{rec.name}</p>
                        <p className="text-[10px] text-gray-400 font-medium">
                          {rec.type === 'winner' ? '🏆 Winner' : 'Participant'}
                        </p>
                      </div>
                    </div>

                    {/* Email */}
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Mail size={12} className="text-gray-300 shrink-0" />
                      <span className="text-sm text-gray-500 truncate">{rec.email}</span>
                    </div>

                    {/* Status */}
                    <StatusPill status={status} />

                    {/* Action */}
                    <div>
                      {status === 'sent' ? (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-bold">
                          <Check size={12} /> Delivered
                        </span>
                      ) : (
                        <button
                          onClick={() => sendOne(rec)}
                          disabled={status === 'sending' || globalSending}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-royal bg-royal/5 hover:bg-royal/10
                                     border border-royal/15 px-3 py-1.5 rounded-lg disabled:opacity-40 transition-all cursor-pointer whitespace-nowrap"
                        >
                          {status === 'sending'
                            ? <><Loader2 size={11} className="animate-spin" /> Sending</>
                            : status === 'failed'
                            ? <><RefreshCw size={11} /> Retry</>
                            : <><Send size={11} /> Send</>
                          }
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {filtered.length > 0 && (
            <div className="px-5 py-3 border-t border-gray-50 text-xs text-gray-400 font-medium">
              Showing {filtered.length} of {totalCount} students
            </div>
          )}
        </div>
      )}

      {/* ── Certificate preview ── */}
      <div className="mt-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-3">
          <Eye size={13} className="text-gray-400" />
          <span className="text-xs font-extrabold text-gray-400 uppercase tracking-wider">Template Preview — {templateName}</span>
        </div>
        <div className="max-w-xs mx-auto relative">
          <img src={backgroundImageUrl} alt="template" className="w-full rounded-xl border border-gray-100 shadow-sm" />
          <div
            className="absolute pointer-events-none"
            style={{
              left: `${nameX * 100}%`, top: `${nameY * 100}%`,
              transform: 'translate(-50%, -50%)',
              fontSize: `${Math.max(8, fontSize * 0.16)}px`,
              color: nameColor, fontFamily: "Georgia,'Times New Roman',serif",
              fontWeight: 'bold', whiteSpace: 'nowrap',
              textShadow: '0 0 6px rgba(255,255,255,0.85)',
            }}
          >
            ✦ Student Name Here ✦
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════ */
export default function CertificateTemplatesPage() {
  const navigate = useNavigate();
  const [view,           setView]     = useState('landing');
  const [templateConfig, setTemplate] = useState(null);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Auto-detect existing upload template
  useEffect(() => {
    const hackId = HACKATHON();
    if (!hackId) {
      setLoadingInitial(false);
      return;
    }
    axios.get(`${API_BASE}/templates/${hackId}`, { headers: authHeader() })
      .then(res => {
        const templates = res.data.templates || [];
        const uploaded = templates.find(t => t.templateType === 'upload');
        if (uploaded) {
          setTemplate({
            templateId: uploaded._id,
            backgroundImageUrl: uploaded.backgroundImageUrl,
            nameX: uploaded.nameX ?? 0.5,
            nameY: uploaded.nameY ?? 0.5,
            fontSize: uploaded.fontSize ?? 52,
            nameColor: uploaded.nameColor ?? '#1E3A8A',
            templateName: uploaded.name,
          });
          setView('students');
        }
      })
      .catch(err => console.error('Failed to fetch templates:', err))
      .finally(() => setLoadingInitial(false));
  }, []);

  if (loadingInitial) {
    return (
      <div className="min-h-screen bg-[#F5F7FB] font-sans flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={34} className="text-royal animate-spin" />
          <p className="text-sm text-gray-500 font-medium">Checking certificates…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FB] font-sans">
      <OrganizerSidebar />

      <div className="transition-all duration-300 lg:pl-60">
        {/* Navbar */}
        <div className="sticky top-0 z-20 h-[60px] bg-white/90 backdrop-blur border-b border-gray-100 flex items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <Award size={16} className="text-amber-500" />
            <span className="font-bold text-dark text-sm">Certificates</span>
            {view !== 'landing' && (
              <>
                <ChevronRight size={13} className="text-gray-300" />
                <span className="text-sm text-gray-500 font-medium">
                  {view === 'upload' ? 'Upload & Configure' : 'Send to Students'}
                </span>
              </>
            )}
          </div>

          {view !== 'landing' && (
            <button
              onClick={() => setView('landing')}
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-royal transition-colors cursor-pointer"
            >
              <RotateCcw size={12} /> Start Over
            </button>
          )}
        </div>

        <main>
          {view === 'landing' && (
            <LandingView
              onUpload={() => setView('upload')}
              onCreate={() => navigate('/organizer/certificates/editor')}
            />
          )}

          {view === 'upload' && (
            <UploadPositionView
              onComplete={(config) => { setTemplate(config); setView('students'); }}
              onBack={() => setView('landing')}
            />
          )}

          {view === 'students' && templateConfig && (
            <StudentRosterView
              templateConfig={templateConfig}
              onBack={() => setView('upload')}
            />
          )}
        </main>
      </div>
    </div>
  );
}
