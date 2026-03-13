import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Plus, Trash2, Upload,
  Trophy, Calendar, Users, Tag, Building2,
  AlertCircle, Mail, MessageSquare, FileText, Save,
  Eye, X, Download, ExternalLink, Loader2, ChevronDown
} from 'lucide-react';
import axios from 'axios';
import OrganizerSidebar from '../../components/OrganizerSidebar';

/* ─────────────── HELPERS ─────────────── */

const TAG_SUGGESTIONS = [
  'Software Development', 'AI/ML', 'FinTech', 'HealthTech',
  'UI/UX Design', 'Sustainability', 'Web3', 'Cybersecurity',
  'IoT', 'Smart City', 'EdTech', 'Innovation',
];

const PRIZE_EMOJIS = [
  { label: '🥇 Gold',    value: '🥇' },
  { label: '🥈 Silver',  value: '🥈' },
  { label: '🥉 Bronze',  value: '🥉' },
  { label: '⭐ Special', value: '⭐' },
  { label: '💡 Idea',    value: '💡' },
  { label: '🏙️ City',  value: '🏙️' },
  { label: '🎖️ Merit', value: '🎖️' },
];

/* ─────────────── SECTION WRAPPER ─────────────── */
function FormSection({ icon: Icon, title, subtitle, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden">
      <div className="flex items-start gap-3 px-6 py-5 border-b border-gray-100 bg-gray-50/60">
        <div className="w-8 h-8 rounded-xl bg-royal/10 flex items-center justify-center shrink-0 mt-0.5">
          <Icon size={15} className="text-royal" />
        </div>
        <div>
          <h2 className="text-sm font-extrabold text-dark">{title}</h2>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="px-6 py-6">{children}</div>
    </div>
  );
}

/* ─────────────── LABEL + INPUT ─────────────── */
function Field({ label, required, hint, children }) {
  return (
    <div>
      <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1.5">
        {label}{required && <span className="text-rose-400 ml-0.5">*</span>}
      </label>
      {hint && <p className="text-[11px] text-gray-400 mb-2">{hint}</p>}
      {children}
    </div>
  );
}

const inputCls =
  'w-full text-sm text-dark bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-royal/30 focus:border-royal transition-all';

const textareaCls = `${inputCls} resize-none`;

/* ─────────────── PREVIEW MODAL ─────────────── */
function FullPreviewModal({ form, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-10">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal Container */}
      <div className="bg-light-gray w-full max-w-5xl max-h-full rounded-3xl shadow-2xl relative border border-gray-200 flex flex-col z-10 overflow-hidden">
        
        {/* Fixed Header */}
        <div className="flex-none flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100 shadow-sm z-20">
          <div className="flex items-center gap-2">
            <Eye size={18} className="text-royal" />
            <h2 className="text-sm font-extrabold text-dark tracking-wide">STUDENT PREVIEW</h2>
          </div>
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 hover:text-dark transition-all cursor-pointer"
          >
            <X size={16} /> Close Preview
          </button>
        </div>

        {/* Scrollable Content (Mimics HackathonDetails.jsx) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 relative">
          
          {/* ── Banner + Hero Info Card ── */}
          <div className="mb-7 rounded-2xl border border-gray-100 shadow-[0_2px_16px_rgba(0,0,0,0.06)] overflow-hidden bg-white">
            {/* Banner */}
            <div className="w-full h-56 bg-gray-100 flex items-center justify-center overflow-hidden relative">
              {form.bannerPreview
                ? <img src={form.bannerPreview} alt="banner" className="w-full h-full object-cover" />
                : <span className="text-gray-200 text-[120px] font-black select-none">{form.title?.[0] || 'H'}</span>
              }
            </div>

            {/* Info row */}
            <div className="px-6 py-5 flex flex-col sm:flex-row gap-5 items-start border-t border-gray-100">
              {/* Logo */}
              <div className="w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-2xl shrink-0 shadow-lg -mt-5 border-4 border-white overflow-hidden bg-gray-100 flex items-center justify-center">
                {form.logoPreview
                  ? <img src={form.logoPreview} alt="logo" className="w-full h-full object-cover" />
                  : <span className="text-gray-400 font-black text-xl">{form.organizerName?.[0] || form.title?.[0] || '?'}</span>
                }
              </div>

              {/* Middle */}
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-[1.75rem] font-black text-dark tracking-tight leading-tight mb-0.5">
                  {form.title || 'Hackathon Name'}
                </h1>
                <p className="flex items-center gap-1.5 text-sm text-gray-500 font-semibold mb-3">
                  <Building2 size={13} className="text-gray-400" />
                  {form.organizerName || 'Organizer Name'}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {(form.tags || []).map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-royal/8 text-royal border border-royal/15"
                    >
                      <Tag size={10} />
                      {tag}
                    </span>
                  ))}
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                    {form.mode === 'Offline' ? '📍' : '🌐'} {form.mode}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-[11px] font-bold text-gray-500 bg-gray-50 border border-gray-100 px-3 py-2 rounded-xl w-fit">
                  <span className="flex items-center gap-1.5"><Users size={12} className="text-royal" /> {form.teamSizeMin}–{form.teamSizeMax} members</span>
                  {form.registrationDeadline && (
                    <>
                      <div className="w-1 h-1 rounded-full bg-gray-300" />
                      <span className="flex items-center gap-1.5">
                        <Calendar size={12} className="text-royal" />
                        Deadline: {new Date(form.registrationDeadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Prize */}
              <div className="flex flex-col items-center bg-amber-50 border border-amber-200 rounded-2xl px-6 py-4 text-center shrink-0 w-full sm:w-auto shadow-sm shadow-amber-500/5">
                <span className="text-3xl mb-1 drop-shadow-sm">🏆</span>
                <p className="text-[10px] font-extrabold text-amber-500 uppercase tracking-widest mb-0.5">Prize Pool</p>
                <p className="text-xl font-black text-dark">{form.prizePool || '—'}</p>
              </div>
            </div>
          </div>

          {/* ── Tabs (Static mock) ── */}
          <div className="flex items-center gap-6 border-b border-gray-200 mb-6">
            <button className="pb-3 text-sm font-bold text-royal border-b-2 border-royal">Overview</button>
            <button className="pb-3 text-sm font-semibold text-gray-400 pointer-events-none">Timeline</button>
            <button className="pb-3 text-sm font-semibold text-gray-400 pointer-events-none">Application</button>
          </div>

          {/* ── OVERVIEW TAB CONTENT ── */}
          <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] px-7 py-6">
              
              {/* About */}
              <div className="mb-8 last:mb-0">
                <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-4">About</h3>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {form.description || 'Description will appear here...'}
                </p>
              </div>

              {/* Stages */}
              {form.stages.length > 0 && form.stages[0].name !== '' && (
                <div className="mb-8 last:mb-0">
                  <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-4">Stages & Timeline</h3>
                  <div className="relative">
                    <div className="absolute left-[19px] top-6 bottom-6 w-0.5 bg-gray-100 z-0" />
                    <div className="space-y-4">
                      {form.stages.map((stage, i) => (
                        <div key={i} className="flex gap-4 relative">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 border-2 border-gray-200 bg-white text-xs font-extrabold text-gray-500">
                            {i + 1}
                          </div>
                          <div className="flex-1 rounded-2xl border border-gray-100 bg-gray-50/60 px-5 py-4">
                            <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">{stage.round}</span>
                            <h4 className="text-sm font-bold text-dark mt-0.5 mb-1">{stage.name}</h4>
                            <p className="text-xs text-gray-500 leading-relaxed mb-2">{stage.description}</p>
                            {stage.date && (
                              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-400">
                                <Calendar size={11} />
                                {stage.date}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Problem Statement */}
              {form.problemStatementName && (
                <div className="mb-8 last:mb-0">
                  <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-4">Problem Statement</h3>
                  <div className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 bg-gray-50/60 transition-all group">
                    <div className="w-11 h-11 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
                      <FileText size={20} className="text-red-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-dark">{form.problemStatementName}</p>
                      <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                        {form.problemStatementFile?.name || 'document.pdf'} &bull; {form.problemStatementFile ? (form.problemStatementFile.size / 1024 / 1024).toFixed(2) + ' MB' : '0.0 MB'}
                      </p>
                    </div>
                    <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-gray-200 text-xs font-bold text-gray-300 pointer-events-none shadow-sm shrink-0">
                      <Download size={13} />
                      Download
                    </button>
                  </div>
                </div>
              )}

              {/* Prizes */}
              {form.prizes.length > 0 && form.prizes[0].amount !== '' && (
                <div className="mb-8 last:mb-0">
                  <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-4">Prizes &amp; Rewards</h3>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {form.prizes.slice(0, 3).map((prize, i) => (
                      <div key={i} className="flex flex-col items-center rounded-2xl border py-5 px-3 text-center border-gray-200 bg-gray-50">
                        <span className="text-3xl mb-2">{prize.emoji}</span>
                        <span className="text-[10px] font-extrabold uppercase tracking-widest mb-1 text-gray-400">{prize.rank}</span>
                        <span className="text-base font-black text-dark">{prize.amount}</span>
                        <span className="text-[11px] text-gray-500 font-medium mt-0.5">{prize.label}</span>
                      </div>
                    ))}
                  </div>
                  {form.prizes.length > 3 && (
                    <div className="space-y-2">
                      {form.prizes.slice(3).map((prize, i) => (
                        <div key={i} className="flex items-center gap-4 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50">
                          <span className="text-xl">{prize.emoji}</span>
                          <div className="flex-1">
                            <p className="text-xs font-extrabold uppercase tracking-wide text-gray-400">{prize.rank}</p>
                            <p className="text-sm font-bold text-dark">{prize.label}</p>
                          </div>
                          <span className="text-sm font-black text-dark">{prize.amount}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Rules */}
              {form.rules[0] !== '' && (
                <div className="mb-8 last:mb-0">
                  <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-4">Rules & Regulations</h3>
                  <ul className="space-y-2.5">
                    {form.rules.map((rule, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <AlertCircle size={14} className="text-amber-400 shrink-0 mt-0.5" />
                        {rule}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Contact */}
              {form.organizerContact && (
                <div className="mb-8 last:mb-0">
                  <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-4">Organizer Contact</h3>
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-100 text-sm font-semibold text-dark">
                      <Mail size={14} /> {form.organizerContact}
                    </div>
                    {form.whatsappLink && (
                      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-semibold shadow-sm">
                        <MessageSquare size={14} /> WhatsApp Group <ExternalLink size={12} />
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function CreateHackathon() {
  const navigate = useNavigate();
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);

  /* ── form state ── */
  const [form, setForm] = useState({
    // Hero card
    title: '',
    organizerName: '',
    bannerImage: null,
    bannerPreview: null,
    logoImage: null,
    logoPreview: null,
    mode: 'Offline',
    teamSizeMin: 2,
    teamSizeMax: 4,
    registrationDeadline: '',
    prizePool: '',
    tags: [],

    // About
    description: '',

    // Stages
    stages: [
      { round: 'Round 1', name: '', description: '', date: '' },
    ],

    // Problem Statement PDF
    problemStatementFile: null,
    problemStatementName: 'Problem Statement',

    // Prizes
    prizes: [
      { rank: '1st Place', label: 'Winner',     amount: '', emoji: '🥇' },
      { rank: '2nd Place', label: 'Runner Up',   amount: '', emoji: '🥈' },
      { rank: '3rd Place', label: '2nd Runner Up', amount: '', emoji: '🥉' },
    ],

    // Rules
    rules: [''],

    // Contact
    organizerContact: '',
    whatsappLink: '',
  });

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }));

  /* ── image upload helpers ── */
  const handleImageUpload = (fileKey, previewKey) => (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setForm(f => ({ ...f, [fileKey]: file, [previewKey]: url }));
  };
  const clearImage = (fileKey, previewKey) => () => {
    setForm(f => {
      if (f[previewKey]) URL.revokeObjectURL(f[previewKey]);
      return { ...f, [fileKey]: null, [previewKey]: null };
    });
  };

  /* ── tag helpers ── */
  const toggleTag = (tag) => {
    set('tags', form.tags.includes(tag)
      ? form.tags.filter(t => t !== tag)
      : [...form.tags, tag]);
  };

  /* ── stages helpers ── */
  const addStage = () =>
    set('stages', [...form.stages, { round: `Round ${form.stages.length + 1}`, name: '', description: '', date: '' }]);
  const removeStage = (i) =>
    set('stages', form.stages.filter((_, idx) => idx !== i));
  const updateStage = (i, field, value) =>
    set('stages', form.stages.map((s, idx) => idx === i ? { ...s, [field]: value } : s));

  /* ── prizes helpers ── */
  const addPrize = () =>
    set('prizes', [...form.prizes, { rank: 'Special Prize', label: '', amount: '', emoji: '⭐' }]);
  const removePrize = (i) =>
    set('prizes', form.prizes.filter((_, idx) => idx !== i));
  const updatePrize = (i, field, value) =>
    set('prizes', form.prizes.map((p, idx) => idx === i ? { ...p, [field]: value } : p));

  /* ── rules helpers ── */
  const addRule = () => set('rules', [...form.rules, '']);
  const removeRule = (i) => set('rules', form.rules.filter((_, idx) => idx !== i));
  const updateRule = (i, value) =>
    set('rules', form.rules.map((r, idx) => idx === i ? value : r));

  /* ── submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      data.append('title', form.title);
      data.append('organizerName', form.organizerName);
      data.append('mode', form.mode);
      data.append('teamSizeMin', form.teamSizeMin);
      data.append('teamSizeMax', form.teamSizeMax);
      data.append('registrationDeadline', form.registrationDeadline);
      data.append('prizePool', form.prizePool);
      data.append('description', form.description);
      data.append('problemStatementName', form.problemStatementName);
      data.append('organizerContact', form.organizerContact);
      data.append('whatsappLink', form.whatsappLink);

      // Arrays (need to be stringified for FormData to preserve structure)
      data.append('tags', JSON.stringify(form.tags));
      data.append('stages', JSON.stringify(form.stages));
      data.append('prizes', JSON.stringify(form.prizes));
      data.append('rules', JSON.stringify(form.rules));

      // Files
      if (form.bannerImage) data.append('bannerImage', form.bannerImage);
      if (form.logoImage) data.append('logoImage', form.logoImage);
      if (form.problemStatementFile) data.append('problemStatementFile', form.problemStatementFile);

      await axios.post('http://localhost:5000/api/hackathons', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      alert('Hackathon created successfully!');
      navigate('/organizer-dashboard');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to create hackathon');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-light-gray">
      <OrganizerSidebar />

      <div className="transition-all duration-300 lg:pl-60">
        <main className="max-w-4xl mx-auto px-4 sm:px-8 py-8">

          {/* Header */}
          <div className="flex items-center gap-3 mb-7">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-royal transition-colors cursor-pointer"
            >
              <ArrowLeft size={15} /> Back
            </button>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-extrabold text-dark tracking-tight">Create Hackathon</h1>
            <p className="text-sm text-gray-500 mt-1">Fill in all details — they will appear exactly as shown on the student hackathon page.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* ════════════════════════════════════════
                1. HERO HEADER CARD DETAILS
                (Banner color, Logo, Title, Organizer, Tags, Mode, Team Size, Deadline, Prize Pool)
            ════════════════════════════════════════ */}
            <FormSection
              icon={Trophy}
              title="Hero Header Card"
              subtitle="These details appear at the very top of your hackathon page — like Unstop's header"
            >
              <div className="space-y-5">

                {/* Banner Image Upload */}
                <Field label="Banner Image" required hint="Recommended: 1200×300px. This wide image appears at the top of your hackathon page">
                  {form.bannerPreview ? (
                    <div className="relative rounded-2xl overflow-hidden border border-gray-200">
                      <img src={form.bannerPreview} alt="Banner preview" className="w-full h-36 object-cover" />
                      <button
                        type="button"
                        onClick={clearImage('bannerImage', 'bannerPreview')}
                        className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-lg p-1.5 transition-all cursor-pointer"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-200 rounded-2xl py-8 px-6 cursor-pointer hover:border-royal/40 hover:bg-royal/[0.02] transition-all group">
                      <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Upload size={20} className="text-gray-400" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-semibold text-gray-500">Click to upload banner image</p>
                        <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP · Max 5 MB · Best at 1200×300</p>
                      </div>
                      <input type="file" accept="image/*" className="sr-only" onChange={handleImageUpload('bannerImage', 'bannerPreview')} />
                    </label>
                  )}
                </Field>

                {/* Logo Image Upload */}
                <Field label="Organizer Logo" required hint="Square image recommended — shown as the logo bubble on the hackathon card">
                  <div className="flex items-start gap-5">
                    {/* Preview circle */}
                    <div className="w-20 h-20 rounded-2xl border-2 border-gray-200 bg-gray-50 shrink-0 overflow-hidden flex items-center justify-center">
                      {form.logoPreview
                        ? <img src={form.logoPreview} alt="Logo" className="w-full h-full object-cover" />
                        : <span className="text-gray-300 text-3xl font-black">{form.title?.[0] || '?'}</span>
                      }
                    </div>
                    <div className="flex-1">
                      {form.logoPreview ? (
                        <div className="flex flex-col gap-2">
                          <p className="text-sm font-semibold text-dark">{form.logoImage?.name}</p>
                          <p className="text-xs text-gray-400">{form.logoImage ? (form.logoImage.size / 1024).toFixed(0) + ' KB' : ''}</p>
                          <button
                            type="button"
                            onClick={clearImage('logoImage', 'logoPreview')}
                            className="flex items-center gap-1.5 text-xs font-bold text-red-400 hover:text-red-600 transition-colors cursor-pointer w-fit"
                          >
                            <Trash2 size={12} /> Remove
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-start gap-2 cursor-pointer">
                          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 hover:border-royal hover:bg-royal/5 transition-all text-sm font-bold text-gray-600 hover:text-royal">
                            <Upload size={14} /> Upload Logo
                          </div>
                          <p className="text-[11px] text-gray-400">PNG, JPG, SVG · Square preferred</p>
                          <input type="file" accept="image/*" className="sr-only" onChange={handleImageUpload('logoImage', 'logoPreview')} />
                        </label>
                      )}
                    </div>
                  </div>
                </Field>

                {/* Title */}
                <Field label="Hackathon Name" required>
                  <input
                    type="text"
                    value={form.title}
                    onChange={e => set('title', e.target.value)}
                    placeholder="e.g. CodeStorm 2026"
                    className={inputCls}
                  />
                </Field>

                {/* Organizer */}
                <Field label="Organizer / Institute Name" required>
                  <input
                    type="text"
                    value={form.organizerName}
                    onChange={e => set('organizerName', e.target.value)}
                    placeholder="e.g. IIT Bombay"
                    className={inputCls}
                  />
                </Field>

                {/* Tags */}
                <Field label="Category Tags" hint="Select all that apply — shown as pills on the header card">
                  <div className="flex flex-wrap gap-2 mt-1">
                    {TAG_SUGGESTIONS.map(tag => (
                      <button
                        type="button"
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                          form.tags.includes(tag)
                            ? 'bg-royal text-white border-royal'
                            : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-royal hover:text-royal'
                        }`}
                      >
                        <Tag size={10} />{tag}
                      </button>
                    ))}
                  </div>
                </Field>

                {/* Mode + Team Size + Deadline */}
                <div className="grid sm:grid-cols-3 gap-4">
                  <Field label="Mode" required>
                    <div className="relative">
                      <select
                        value={form.mode}
                        onChange={e => set('mode', e.target.value)}
                        className={`${inputCls} pr-8 appearance-none cursor-pointer`}
                      >
                        <option>Offline</option>
                        <option>Online</option>
                        <option>Hybrid</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </Field>
                  <Field label="Team Size (Min)" required>
                    <input
                      type="number"
                      min={1}
                      value={form.teamSizeMin}
                      onChange={e => set('teamSizeMin', +e.target.value)}
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Team Size (Max)" required>
                    <input
                      type="number"
                      min={1}
                      value={form.teamSizeMax}
                      onChange={e => set('teamSizeMax', +e.target.value)}
                      className={inputCls}
                    />
                  </Field>
                </div>

                {/* Registration Deadline + Prize Pool */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Registration Deadline" required>
                    <input
                      type="date"
                      value={form.registrationDeadline}
                      onChange={e => set('registrationDeadline', e.target.value)}
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Total Prize Pool" required hint="e.g. ₹5,00,000">
                    <input
                      type="text"
                      value={form.prizePool}
                      onChange={e => set('prizePool', e.target.value)}
                      placeholder="₹5,00,000"
                      className={inputCls}
                    />
                  </Field>
                </div>

              </div>
            </FormSection>

            {/* ════════════════════════════════════════
                2. ABOUT
            ════════════════════════════════════════ */}
            <FormSection
              icon={FileText}
              title="About the Hackathon"
              subtitle="Shown in the About section of the Overview tab"
            >
              <Field label="Description" required hint="Explain what your hackathon is about, its theme, and goals">
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={e => set('description', e.target.value)}
                  placeholder="CodeStorm 2026 is the flagship hackathon organized by..."
                  className={textareaCls}
                />
              </Field>
            </FormSection>

            {/* ════════════════════════════════════════
                3. STAGES & TIMELINE
            ════════════════════════════════════════ */}
            <FormSection
              icon={Calendar}
              title="Stages & Timeline"
              subtitle="Each stage appears as a numbered card on the Overview tab"
            >
              <div className="space-y-4">
                {form.stages.map((stage, i) => (
                  <div
                    key={i}
                    className="border border-gray-100 rounded-2xl p-5 bg-gray-50/60 relative"
                  >
                    {/* Stage number label */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">
                        Stage {i + 1}
                      </span>
                      {form.stages.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeStage(i)}
                          className="text-red-400 hover:text-red-600 transition-colors cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4 mb-4">
                      <Field label="Round Label">
                        <input
                          type="text"
                          value={stage.round}
                          onChange={e => updateStage(i, 'round', e.target.value)}
                          placeholder="e.g. Round 1, Grand Finale"
                          className={inputCls}
                        />
                      </Field>
                      <Field label="Stage Name">
                        <input
                          type="text"
                          value={stage.name}
                          onChange={e => updateStage(i, 'name', e.target.value)}
                          placeholder="e.g. Registration & Idea Submission"
                          className={inputCls}
                        />
                      </Field>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <Field label="Description">
                        <textarea
                          rows={2}
                          value={stage.description}
                          onChange={e => updateStage(i, 'description', e.target.value)}
                          placeholder="What happens in this stage..."
                          className={textareaCls}
                        />
                      </Field>
                      <Field label="Date / Date Range">
                        <input
                          type="text"
                          value={stage.date}
                          onChange={e => updateStage(i, 'date', e.target.value)}
                          placeholder="e.g. March 15 – 25, 2026"
                          className={inputCls}
                        />
                      </Field>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addStage}
                  className="flex items-center gap-2 text-sm font-bold text-royal hover:text-royal-light transition-colors cursor-pointer"
                >
                  <Plus size={15} /> Add Stage
                </button>
              </div>
            </FormSection>

            {/* ════════════════════════════════════════
                4. PROBLEM STATEMENT PDF
            ════════════════════════════════════════ */}
            <FormSection
              icon={FileText}
              title="Problem Statement"
              subtitle="Upload a single PDF — students can download it from the Overview tab"
            >
              <div className="space-y-4">
                <Field label="PDF Title" hint="Shown as the file name on the student page">
                  <input
                    type="text"
                    value={form.problemStatementName}
                    onChange={e => set('problemStatementName', e.target.value)}
                    placeholder="Problem Statement"
                    className={inputCls}
                  />
                </Field>

                <Field label="Upload PDF File">
                  <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-200 rounded-2xl py-8 px-6 cursor-pointer hover:border-royal/40 hover:bg-royal/[0.02] transition-all group">
                    <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <FileText size={22} className="text-red-400" />
                    </div>
                    {form.problemStatementFile ? (
                      <div className="text-center">
                        <p className="text-sm font-bold text-dark">{form.problemStatementFile.name}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {(form.problemStatementFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <p className="text-sm font-semibold text-gray-500">Click to upload PDF</p>
                        <p className="text-xs text-gray-400 mt-1">Max 10 MB · PDF only</p>
                      </div>
                    )}
                    <input
                      type="file"
                      accept=".pdf"
                      className="sr-only"
                      onChange={e => set('problemStatementFile', e.target.files[0] || null)}
                    />
                  </label>
                </Field>
              </div>
            </FormSection>

            {/* ════════════════════════════════════════
                5. PRIZES & REWARDS
            ════════════════════════════════════════ */}
            <FormSection
              icon={Trophy}
              title="Prizes & Rewards"
              subtitle="First 3 shown as a podium; additional entries shown as special prizes below"
            >
              <div className="space-y-3">
                {form.prizes.map((prize, i) => (
                  <div
                    key={i}
                    className="flex gap-3 items-start border border-gray-100 rounded-2xl p-4 bg-gray-50/60"
                  >
                    {/* Emoji picker */}
                    <div className="relative shrink-0">
                      <select
                        value={prize.emoji}
                        onChange={e => updatePrize(i, 'emoji', e.target.value)}
                        className="w-14 h-10 rounded-xl border border-gray-200 bg-white text-center text-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-royal/30"
                      >
                        {PRIZE_EMOJIS.map(e => (
                          <option key={e.value} value={e.value}>{e.value}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-3 gap-3 flex-1">
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Rank</p>
                        <input
                          type="text"
                          value={prize.rank}
                          onChange={e => updatePrize(i, 'rank', e.target.value)}
                          placeholder="1st Place"
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Label</p>
                        <input
                          type="text"
                          value={prize.label}
                          onChange={e => updatePrize(i, 'label', e.target.value)}
                          placeholder="Winner"
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Amount</p>
                        <input
                          type="text"
                          value={prize.amount}
                          onChange={e => updatePrize(i, 'amount', e.target.value)}
                          placeholder="₹2,00,000"
                          className={inputCls}
                        />
                      </div>
                    </div>

                    {form.prizes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePrize(i)}
                        className="text-red-400 hover:text-red-600 transition-colors cursor-pointer shrink-0 mt-6"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addPrize}
                  className="flex items-center gap-2 text-sm font-bold text-royal hover:text-royal-light transition-colors cursor-pointer"
                >
                  <Plus size={15} /> Add Prize
                </button>
              </div>
            </FormSection>

            {/* ════════════════════════════════════════
                6. RULES & REGULATIONS
            ════════════════════════════════════════ */}
            <FormSection
              icon={AlertCircle}
              title="Rules & Regulations"
              subtitle="Each rule is shown as a bullet point on the Overview tab"
            >
              <div className="space-y-3">
                {form.rules.map((rule, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0 text-xs font-bold text-amber-500">
                      {i + 1}
                    </span>
                    <input
                      type="text"
                      value={rule}
                      onChange={e => updateRule(i, e.target.value)}
                      placeholder={`Rule ${i + 1}...`}
                      className={inputCls}
                    />
                    {form.rules.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRule(i)}
                        className="text-red-400 hover:text-red-600 transition-colors cursor-pointer shrink-0"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addRule}
                  className="flex items-center gap-2 text-sm font-bold text-royal hover:text-royal-light transition-colors cursor-pointer mt-1"
                >
                  <Plus size={15} /> Add Rule
                </button>
              </div>
            </FormSection>

            {/* ════════════════════════════════════════
                7. ORGANIZER CONTACT
            ════════════════════════════════════════ */}
            <FormSection
              icon={Mail}
              title="Organizer Contact"
              subtitle="Shown at the bottom of the Overview tab so students can reach out"
            >
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Contact Email" required>
                  <input
                    type="email"
                    value={form.organizerContact}
                    onChange={e => set('organizerContact', e.target.value)}
                    placeholder="hackathon@institute.edu"
                    className={inputCls}
                  />
                </Field>
                <Field label="WhatsApp Group Link">
                  <input
                    type="url"
                    value={form.whatsappLink}
                    onChange={e => set('whatsappLink', e.target.value)}
                    placeholder="https://chat.whatsapp.com/..."
                    className={inputCls}
                  />
                </Field>
              </div>
            </FormSection>

            {/* ════════════════════════════════════════
                ACTIONS
            ════════════════════════════════════════ */}
            <div className="flex justify-end gap-3 pb-8 pt-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-3 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setShowPreview(true)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-200 bg-white text-sm font-bold text-gray-700 hover:border-royal hover:text-royal transition-all cursor-pointer shadow-sm"
              >
                <Eye size={16} /> Preview Page
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-8 py-3 rounded-xl bg-royal text-white text-sm font-extrabold hover:bg-royal-light transition-all shadow-md shadow-royal/20 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer disabled:opacity-70 disabled:pointer-events-none"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {loading ? 'Publishing...' : 'Publish Hackathon'}
              </button>
            </div>

          </form>
        </main>
      </div>

      {/* Full Screen Preview Modal */}
      {showPreview && (
        <FullPreviewModal form={form} onClose={() => setShowPreview(false)} />
      )}
    </div>
  );
}
