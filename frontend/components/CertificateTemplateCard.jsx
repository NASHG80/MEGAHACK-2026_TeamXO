import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

/* ═══════════════════════════════════════════════
   5 CERTIFICATE BACKGROUND TEMPLATES
   Pure visual design — NO text at all.
   ═══════════════════════════════════════════════ */

/* ── Template 1: Minimal Royal Blue Border ── */
function TemplateBg1() {
  return (
    <div className="w-full h-full bg-white relative overflow-hidden">
      {/* Outer border */}
      <div className="absolute inset-3 border-2 border-[#1E3A8A] rounded-sm" />
      {/* Inner border */}
      <div className="absolute inset-5 border border-[#1E3A8A]/30 rounded-sm" />
      {/* Corner ornaments */}
      {[
        'top-3 left-3', 'top-3 right-3', 'bottom-3 left-3', 'bottom-3 right-3',
      ].map((pos, i) => (
        <div key={i} className={`absolute ${pos}`}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path d={
              i === 0 ? 'M0 0 L28 0 L28 6 L6 6 L6 28 L0 28 Z' :
              i === 1 ? 'M28 0 L0 0 L0 6 L22 6 L22 28 L28 28 Z' :
              i === 2 ? 'M0 28 L28 28 L28 22 L6 22 L6 0 L0 0 Z' :
              'M28 28 L0 28 L0 22 L22 22 L22 0 L28 0 Z'
            } fill="#1E3A8A" />
          </svg>
        </div>
      ))}
      {/* Subtle center line */}
      <div className="absolute top-1/2 left-12 right-12 h-px bg-[#1E3A8A]/10" />
    </div>
  );
}

/* ── Template 2: Gradient Blue with White Inner Area ── */
function TemplateBg2() {
  return (
    <div className="w-full h-full bg-gradient-to-br from-[#1E3A8A] via-[#2563EB] to-[#1E3A8A] relative overflow-hidden">
      {/* Abstract shapes */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/4" />
      <div className="absolute top-1/2 right-0 w-24 h-24 bg-white/5 rounded-full translate-x-1/2" />
      {/* White inner certificate area */}
      <div className="absolute inset-6 bg-white rounded-lg shadow-lg">
        {/* Inner subtle border */}
        <div className="absolute inset-3 border border-[#1E3A8A]/10 rounded" />
        {/* Top accent line */}
        <div className="absolute top-0 left-8 right-8 h-1 bg-gradient-to-r from-transparent via-[#1E3A8A]/20 to-transparent" />
        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-8 right-8 h-1 bg-gradient-to-r from-transparent via-[#1E3A8A]/20 to-transparent" />
      </div>
    </div>
  );
}

/* ── Template 3: Elegant Double Border with Geometric Corners ── */
function TemplateBg3() {
  return (
    <div className="w-full h-full bg-[#FAFBFF] relative overflow-hidden">
      {/* Outer thick border */}
      <div className="absolute inset-2 border-[3px] border-[#1E3A8A]" />
      {/* Gap */}
      {/* Inner thin border */}
      <div className="absolute inset-4 border border-[#1E3A8A]/40" />
      {/* Geometric corner decorations */}
      {['top-2 left-2', 'top-2 right-2', 'bottom-2 left-2', 'bottom-2 right-2'].map((pos, i) => (
        <div key={i} className={`absolute ${pos}`}>
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <rect x={i % 2 === 0 ? 0 : 12} y={i < 2 ? 0 : 12}
              width="36" height="36" fill="none" stroke="#1E3A8A" strokeWidth="1.5"
              transform={`rotate(${i * 90} 24 24)`} opacity="0.2"
            />
            <circle cx={i % 2 === 0 ? 0 : 48} cy={i < 2 ? 0 : 48} r="5" fill="#1E3A8A" />
          </svg>
        </div>
      ))}
      {/* Horizontal decorative lines */}
      <div className="absolute top-10 left-14 right-14 flex items-center gap-2">
        <div className="flex-1 h-px bg-[#1E3A8A]/15" />
        <svg width="12" height="12" viewBox="0 0 12 12"><rect x="2" y="2" width="8" height="8" fill="#1E3A8A" opacity="0.15" transform="rotate(45 6 6)" /></svg>
        <div className="flex-1 h-px bg-[#1E3A8A]/15" />
      </div>
      <div className="absolute bottom-10 left-14 right-14 flex items-center gap-2">
        <div className="flex-1 h-px bg-[#1E3A8A]/15" />
        <svg width="12" height="12" viewBox="0 0 12 12"><rect x="2" y="2" width="8" height="8" fill="#1E3A8A" opacity="0.15" transform="rotate(45 6 6)" /></svg>
        <div className="flex-1 h-px bg-[#1E3A8A]/15" />
      </div>
    </div>
  );
}

/* ── Template 4: Modern Tech / Hackathon Style ── */
function TemplateBg4() {
  return (
    <div className="w-full h-full bg-[#0A1628] relative overflow-hidden">
      {/* Grid lines */}
      <div className="absolute inset-0" style={{
        backgroundImage: 'linear-gradient(rgba(30,58,138,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(30,58,138,0.08) 1px, transparent 1px)',
        backgroundSize: '32px 32px',
      }} />
      {/* Gradient glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-40 bg-[#1E3A8A]/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-60 h-32 bg-[#2563EB]/15 rounded-full blur-3xl" />
      {/* Accent lines */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#2563EB] to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#2563EB] to-transparent" />
      {/* Angular corner cuts */}
      <svg className="absolute top-0 left-0" width="60" height="60" viewBox="0 0 60 60" fill="none">
        <path d="M0 0 L60 0 L0 60 Z" fill="#1E3A8A" opacity="0.15" />
        <path d="M0 0 L40 0 L0 40 Z" fill="#2563EB" opacity="0.1" />
      </svg>
      <svg className="absolute bottom-0 right-0 rotate-180" width="60" height="60" viewBox="0 0 60 60" fill="none">
        <path d="M0 0 L60 0 L0 60 Z" fill="#1E3A8A" opacity="0.15" />
        <path d="M0 0 L40 0 L0 40 Z" fill="#2563EB" opacity="0.1" />
      </svg>
      {/* White inner area */}
      <div className="absolute inset-5 bg-white/[0.97] rounded-lg border border-[#1E3A8A]/10">
        {/* Inner top accent */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#1E3A8A] via-[#2563EB] to-[#1E3A8A] rounded-t-lg" />
      </div>
    </div>
  );
}

/* ── Template 5: Premium Gold Accent ── */
function TemplateBg5() {
  return (
    <div className="w-full h-full bg-white relative overflow-hidden">
      {/* Outer gold border */}
      <div className="absolute inset-3 border-2 border-[#C5A55A]/60 rounded-sm" />
      {/* Inner royal blue border */}
      <div className="absolute inset-5 border border-[#1E3A8A]/25 rounded-sm" />
      {/* Gold corner rosettes */}
      {[
        { x: 'left-1', y: 'top-1' },
        { x: 'right-1', y: 'top-1' },
        { x: 'left-1', y: 'bottom-1' },
        { x: 'right-1', y: 'bottom-1' },
      ].map((pos, i) => (
        <div key={i} className={`absolute ${pos.x} ${pos.y}`}>
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <circle cx="20" cy="20" r="12" stroke="#C5A55A" strokeWidth="1" opacity="0.4" />
            <circle cx="20" cy="20" r="7" stroke="#C5A55A" strokeWidth="1" opacity="0.6" />
            <circle cx="20" cy="20" r="2.5" fill="#C5A55A" opacity="0.5" />
          </svg>
        </div>
      ))}
      {/* Top decorative band */}
      <div className="absolute top-8 left-10 right-10 h-px bg-gradient-to-r from-transparent via-[#C5A55A]/30 to-transparent" />
      <div className="absolute top-9 left-14 right-14 h-px bg-gradient-to-r from-transparent via-[#1E3A8A]/15 to-transparent" />
      {/* Bottom decorative band */}
      <div className="absolute bottom-8 left-10 right-10 h-px bg-gradient-to-r from-transparent via-[#C5A55A]/30 to-transparent" />
      <div className="absolute bottom-9 left-14 right-14 h-px bg-gradient-to-r from-transparent via-[#1E3A8A]/15 to-transparent" />
      {/* Seal placeholder area (bottom center) */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2">
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
          <circle cx="18" cy="18" r="16" stroke="#C5A55A" strokeWidth="0.8" opacity="0.25" />
          <circle cx="18" cy="18" r="11" stroke="#C5A55A" strokeWidth="0.5" opacity="0.2" />
        </svg>
      </div>
    </div>
  );
}

/* ═══════════ TEMPLATE REGISTRY ═══════════ */
export const CERTIFICATE_BACKGROUNDS = [
  {
    id: 'tpl-minimal-blue',
    name: 'Minimal Royal Blue',
    desc: 'Clean borders with elegant corner ornaments',
    Component: TemplateBg1,
    tags: ['participant', 'winner'],
  },
  {
    id: 'tpl-gradient-blue',
    name: 'Blue Gradient',
    desc: 'Royal blue gradient with white inner area',
    Component: TemplateBg2,
    tags: ['participant'],
  },
  {
    id: 'tpl-double-border',
    name: 'Elegant Double Border',
    desc: 'Classic double border with geometric corners',
    Component: TemplateBg3,
    tags: ['participant', 'winner'],
  },
  {
    id: 'tpl-tech-hackathon',
    name: 'Tech Hackathon',
    desc: 'Modern dark tech style with grid and glows',
    Component: TemplateBg4,
    tags: ['winner'],
  },
  {
    id: 'tpl-premium-gold',
    name: 'Premium Gold',
    desc: 'Elegant gold accents with rosette corners',
    Component: TemplateBg5,
    tags: ['winner'],
  },
];

/* ═══════════ TEMPLATE CARD ═══════════ */
export default function CertificateTemplateCard({ template, onSelect, index }) {
  const { Component, name, desc } = template;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.4, delay: index * 0.07, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ scale: 1.03 }}
      className="group relative bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl
                 border border-gray-100 transition-shadow duration-300 cursor-pointer"
      onClick={() => onSelect(template)}
    >
      {/* Template preview */}
      <div className="relative aspect-[1.414/1] overflow-hidden bg-gray-50">
        <Component />
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="opacity-0 group-hover:opacity-100 transition-all duration-300
                       px-5 py-2 bg-white text-dark font-semibold text-sm rounded-full
                       shadow-xl flex items-center gap-2"
            onClick={(e) => { e.stopPropagation(); onSelect(template); }}
          >
            <Sparkles size={14} />
            Use Template
          </motion.button>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-bold text-dark text-sm mb-1">{name}</h3>
        <p className="text-[11px] text-gray-400">{desc}</p>
      </div>
    </motion.div>
  );
}
