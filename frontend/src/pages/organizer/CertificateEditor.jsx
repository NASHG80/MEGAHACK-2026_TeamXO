import { useState, useRef, useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Type, PenTool, ChevronLeft, Eye, Save, Send,
  ZoomIn, ZoomOut, RotateCcw, GripVertical, ToggleLeft, ToggleRight,
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight,
  Minus, Plus, Download, Move, ImagePlus, Trash2, X,
} from 'lucide-react';
import { CERTIFICATE_BACKGROUNDS } from '../../components/CertificateTemplateCard';

/* ─────────────── DEFAULT TEXT ELEMENTS ─────────────── */
const DEFAULT_ELEMENTS = [
  {
    id: 'title',
    type: 'text',
    content: 'CERTIFICATE OF PARTICIPATION',
    x: 150, y: 60,
    fontSize: 28, fontFamily: 'serif', fontWeight: 'bold',
    color: '#1E3A8A', textAlign: 'center', width: 500, locked: false,
  },
  {
    id: 'subtitle',
    type: 'text',
    content: 'This certificate is proudly awarded to',
    x: 150, y: 130,
    fontSize: 14, fontFamily: 'sans-serif', fontWeight: 'normal',
    color: '#6B7280', textAlign: 'center', width: 500, locked: false,
  },
  {
    id: 'name',
    type: 'placeholder',
    content: '{{name}}',
    displayText: 'Participant Name',
    x: 150, y: 170,
    fontSize: 32, fontFamily: 'serif', fontWeight: 'bold',
    color: '#111111', textAlign: 'center', width: 500, locked: false,
  },
  {
    id: 'body',
    type: 'text',
    content: 'for participating in',
    x: 150, y: 230,
    fontSize: 14, fontFamily: 'sans-serif', fontWeight: 'normal',
    color: '#6B7280', textAlign: 'center', width: 500, locked: false,
  },
  {
    id: 'eventName',
    type: 'placeholder',
    content: '{{hackathonName}}',
    displayText: 'Hackathon Name',
    x: 150, y: 265,
    fontSize: 22, fontFamily: 'sans-serif', fontWeight: 'bold',
    color: '#1E3A8A', textAlign: 'center', width: 500, locked: false,
  },
  {
    id: 'position',
    type: 'placeholder',
    content: '{{position}}',
    displayText: '1st Place',
    x: 150, y: 315,
    fontSize: 16, fontFamily: 'sans-serif', fontWeight: 'bold',
    color: '#D97706', textAlign: 'center', width: 500, locked: false,
  },
  {
    id: 'date',
    type: 'placeholder',
    content: '{{date}}',
    displayText: 'March 11, 2026',
    x: 150, y: 350,
    fontSize: 13, fontFamily: 'sans-serif', fontWeight: 'normal',
    color: '#9CA3AF', textAlign: 'center', width: 500, locked: false,
  },
];

const FONT_OPTIONS = [
  { label: 'Serif (Classic)', value: 'serif' },
  { label: 'Sans-serif (Modern)', value: 'sans-serif' },
  { label: 'Inter', value: '"Inter", sans-serif' },
  { label: 'Georgia', value: '"Georgia", serif' },
  { label: 'Courier', value: '"Courier New", monospace' },
  { label: 'Cursive', value: 'cursive' },
];

const COLORS = [
  '#1E3A8A', '#111111', '#FFFFFF', '#D97706', '#059669',
  '#7C3AED', '#DC2626', '#0891B2', '#BE185D', '#6B7280',
];

/* ─────────────── DRAGGABLE TEXT ELEMENT ─────────────── */
function DraggableText({ element, isSelected, onSelect, onDrag, canvasRef }) {
  const [dragging, setDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  const handleMouseDown = useCallback((e) => {
    e.stopPropagation();
    onSelect(element.id);
    if (element.locked) return;
    setDragging(true);
    const rect = canvasRef.current.getBoundingClientRect();
    dragOffset.current = {
      x: e.clientX - rect.left - element.x,
      y: e.clientY - rect.top - element.y,
    };
  }, [element, onSelect, canvasRef]);

  useEffect(() => {
    if (!dragging) return;
    const handleMove = (e) => {
      const rect = canvasRef.current.getBoundingClientRect();
      onDrag(element.id, {
        x: Math.max(0, Math.min(e.clientX - rect.left - dragOffset.current.x, 760)),
        y: Math.max(0, Math.min(e.clientY - rect.top - dragOffset.current.y, 530)),
      });
    };
    const handleUp = () => setDragging(false);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [dragging, element.id, onDrag, canvasRef]);

  const display = element.type === 'placeholder' ? element.displayText : element.content;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`absolute select-none
        ${dragging ? 'cursor-grabbing z-20' : element.locked ? 'cursor-default opacity-40' : 'cursor-grab'}
        ${isSelected ? 'ring-2 ring-royal ring-offset-1 rounded' : ''}
      `}
      style={{ left: element.x, top: element.y, width: element.width }}
      onMouseDown={handleMouseDown}
    >
      <p style={{
        fontSize: element.fontSize,
        fontFamily: element.fontFamily,
        fontWeight: element.fontWeight,
        color: element.color,
        textAlign: element.textAlign,
        lineHeight: 1.3,
        margin: 0,
        fontStyle: element.fontStyle || 'normal',
        textDecoration: element.textDecoration || 'none',
      }}>
        {display}
      </p>
      {isSelected && !element.locked && (
        <div className="absolute -top-3 -left-3 w-5 h-5 bg-royal rounded-full flex items-center justify-center shadow">
          <Move size={10} className="text-white" />
        </div>
      )}
    </motion.div>
  );
}

/* ─────────────── DRAGGABLE IMAGE ELEMENT ─────────────── */
function DraggableImage({ image, isSelected, onSelect, onDrag, onResize, onDelete, canvasRef }) {
  const [dragging, setDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  const handleMouseDown = useCallback((e) => {
    e.stopPropagation();
    onSelect(image.id);
    setDragging(true);
    const rect = canvasRef.current.getBoundingClientRect();
    dragOffset.current = {
      x: e.clientX - rect.left - image.x,
      y: e.clientY - rect.top - image.y,
    };
  }, [image, onSelect, canvasRef]);

  useEffect(() => {
    if (!dragging) return;
    const handleMove = (e) => {
      const rect = canvasRef.current.getBoundingClientRect();
      onDrag(image.id, {
        x: Math.max(0, Math.min(e.clientX - rect.left - dragOffset.current.x, 800 - image.width)),
        y: Math.max(0, Math.min(e.clientY - rect.top - dragOffset.current.y, 566 - image.height)),
      });
    };
    const handleUp = () => setDragging(false);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [dragging, image, onDrag, canvasRef]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`absolute select-none
        ${dragging ? 'cursor-grabbing z-20' : 'cursor-grab'}
        ${isSelected ? 'ring-2 ring-royal ring-offset-2 rounded-lg' : ''}
      `}
      style={{ left: image.x, top: image.y, width: image.width, height: image.height }}
      onMouseDown={handleMouseDown}
    >
      <img
        src={image.src}
        alt={image.label}
        className="w-full h-full object-contain rounded"
        draggable={false}
      />
      {isSelected && (
        <>
          <button
            onMouseDown={e => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); onDelete(image.id); }}
            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center shadow cursor-pointer"
          >
            <X size={10} className="text-white" />
          </button>
          <div className="absolute -top-3 -left-3 w-5 h-5 bg-royal rounded-full flex items-center justify-center shadow">
            <Move size={10} className="text-white" />
          </div>
        </>
      )}
    </motion.div>
  );
}

/* ─────────────── MAIN EDITOR ─────────────── */
export default function CertificateEditor() {
  const location = useLocation();
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const templateState = location.state || {};
  const templateId = templateState.templateId || 'tpl-minimal-blue';
  const templateName = templateState.name || 'Certificate';

  // Find matching template background component
  const templateBg = CERTIFICATE_BACKGROUNDS.find(t => t.id === templateId);
  const BgComponent = templateBg?.Component || null;

  const [elements, setElements] = useState(DEFAULT_ELEMENTS);
  const [images, setImages] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedType, setSelectedType] = useState(null); // 'text' | 'image'
  const [zoom, setZoom] = useState(100);
  const [showPreview, setShowPreview] = useState(false);
  const [bgColor, setBgColor] = useState('#FFFFFF');

  const selected = selectedType === 'text' ? elements.find(e => e.id === selectedId) : null;
  const selectedImage = selectedType === 'image' ? images.find(i => i.id === selectedId) : null;

  /* ── Text helpers ── */
  const updateElement = (id, updates) => {
    setElements(prev => prev.map(el => el.id === id ? { ...el, ...updates } : el));
  };
  const handleTextDrag = useCallback((id, pos) => {
    setElements(prev => prev.map(el => el.id === id ? { ...el, ...pos } : el));
  }, []);
  const toggleElement = (id) => {
    setElements(prev => prev.map(el => el.id === id ? { ...el, locked: !el.locked } : el));
  };
  const selectText = (id) => { setSelectedId(id); setSelectedType('text'); };

  /* ── Image helpers ── */
  const handleImageDrag = useCallback((id, pos) => {
    setImages(prev => prev.map(img => img.id === id ? { ...img, ...pos } : img));
  }, []);
  const selectImage = (id) => { setSelectedId(id); setSelectedType('image'); };
  const deleteImage = (id) => {
    setImages(prev => prev.filter(img => img.id !== id));
    if (selectedId === id) { setSelectedId(null); setSelectedType(null); }
  };
  const handleImageResize = (id, newW, newH) => {
    setImages(prev => prev.map(img => img.id === id ? { ...img, width: newW, height: newH } : img));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new window.Image();
      img.onload = () => {
        const maxW = 200;
        const aspect = img.height / img.width;
        const newImg = {
          id: `img-${Date.now()}`,
          src: ev.target.result,
          label: file.name,
          x: 300,
          y: 400,
          width: maxW,
          height: Math.round(maxW * aspect),
        };
        setImages(prev => [...prev, newImg]);
        selectImage(newImg.id);
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const clearSelection = () => { setSelectedId(null); setSelectedType(null); };

  const BG_COLORS = ['#FFFFFF', '#FFF8F0', '#F0F4FF', '#F0FFF4', '#FFF5F5', '#FFFBEB', '#F5F3FF'];

  return (
    <div className="h-screen flex flex-col bg-gray-50 font-sans overflow-hidden">
      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />

      {/* ════════════ TOP ACTION BAR ════════════ */}
      <motion.header
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 shrink-0 z-30"
      >
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/organizer/certificates')}
            className="p-2 rounded-lg text-gray-500 hover:text-royal hover:bg-royal/5 transition-colors cursor-pointer"
          >
            <ChevronLeft size={18} />
          </motion.button>
          <div>
            <h1 className="text-sm font-bold text-dark leading-none">{templateName}</h1>
            <p className="text-[10px] text-gray-400 mt-0.5">Certificate Editor</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => setShowPreview(p => !p)}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer
              ${showPreview ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            <Eye size={14} />
            {showPreview ? 'Editing' : 'Preview'}
          </motion.button>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
          >
            <Save size={14} /> Save Template
          </motion.button>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/organizer/certificates/generate')}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-royal to-blue-500 rounded-lg shadow-md shadow-royal/25 hover:shadow-lg transition-all cursor-pointer"
          >
            <Send size={13} /> Generate Certificates
          </motion.button>
        </div>
      </motion.header>

      {/* ════════════ 3-COLUMN BODY ════════════ */}
      <div className="flex-1 flex overflow-hidden">

        {/* ──── LEFT PANEL: TOOLS ──── */}
        <motion.aside
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
          className="w-64 bg-white border-r border-gray-200 flex flex-col overflow-y-auto shrink-0"
        >
          {/* Tool buttons */}
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Design Tools</h2>
            <div className="space-y-1.5">
              {[
                { icon: Type, label: 'Edit Text', desc: 'Select text on canvas' },
                { icon: ImagePlus, label: 'Add Image', desc: 'Upload logo, signature, etc.', action: () => fileInputRef.current?.click() },
                { icon: Download, label: 'Export PDF', desc: 'Download as PDF' },
              ].map(({ icon: Icon, label, desc, action }) => (
                <motion.button
                  key={label}
                  whileHover={{ scale: 1.02, x: 2 }} whileTap={{ scale: 0.98 }}
                  onClick={action}
                  className="w-full flex items-center gap-3 p-3 rounded-xl text-left hover:bg-royal/5 transition-colors group cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-lg bg-gray-50 group-hover:bg-royal/10 flex items-center justify-center transition-colors shrink-0">
                    <Icon size={16} className="text-gray-500 group-hover:text-royal transition-colors" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-dark leading-none">{label}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{desc}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Current template */}
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Template</h2>
            <div className="flex items-center gap-3">
              <div className="w-16 h-11 rounded-lg overflow-hidden border border-gray-200 shadow-sm shrink-0">
                {BgComponent ? <BgComponent /> : <div className="w-full h-full" style={{ backgroundColor: bgColor }} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-dark truncate">{templateName}</p>
                <button
                  onClick={() => navigate('/organizer/certificates')}
                  className="text-[10px] text-royal font-semibold hover:underline cursor-pointer mt-0.5"
                >
                  Change Template
                </button>
              </div>
            </div>
          </div>

          {/* Images list */}
          {images.length > 0 && (
            <div className="p-4 border-b border-gray-100">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Images ({images.length})</h2>
              <div className="space-y-2">
                {images.map(img => (
                  <div
                    key={img.id}
                    onClick={() => selectImage(img.id)}
                    className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all
                      ${selectedId === img.id && selectedType === 'image' ? 'bg-royal/5 ring-1 ring-royal/20' : 'hover:bg-gray-50'}`}
                  >
                    <img src={img.src} alt={img.label} className="w-10 h-10 rounded object-cover border border-gray-200" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold text-dark truncate">{img.label}</p>
                      <p className="text-[9px] text-gray-400">{img.width}×{img.height}px</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteImage(img.id); }}
                      className="p-1 rounded text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Selected image size controls */}
          {selectedImage && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 border-b border-gray-100 space-y-3">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Image Size</h2>
              <div className="flex items-center gap-3">
                <div>
                  <label className="text-[10px] font-semibold text-gray-400 block mb-0.5">Width</label>
                  <input type="number" value={selectedImage.width}
                    onChange={e => handleImageResize(selectedImage.id, +e.target.value, Math.round(+e.target.value * (selectedImage.height / selectedImage.width)))}
                    className="w-16 px-2 py-1 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal/20"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-gray-400 block mb-0.5">Height</label>
                  <input type="number" value={selectedImage.height}
                    onChange={e => handleImageResize(selectedImage.id, Math.round(+e.target.value * (selectedImage.width / selectedImage.height)), +e.target.value)}
                    className="w-16 px-2 py-1 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal/20"
                  />
                </div>
              </div>
              <div className="flex gap-1.5">
                {[80, 120, 160, 200].map(sz => (
                  <button key={sz}
                    onClick={() => handleImageResize(selectedImage.id, sz, Math.round(sz * (selectedImage.height / selectedImage.width)))}
                    className={`px-2 py-1 text-[10px] font-semibold rounded-md cursor-pointer transition-colors
                      ${selectedImage.width === sz ? 'bg-royal text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                  >
                    {sz}px
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Selected text element controls */}
          {selected && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 space-y-4 border-b border-gray-100">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Text Properties</h2>

              {selected.type === 'text' && (
                <div>
                  <label className="text-[11px] font-semibold text-gray-500 mb-1 block">Content</label>
                  <textarea
                    value={selected.content}
                    onChange={e => updateElement(selected.id, { content: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-royal/20"
                    rows={2}
                  />
                </div>
              )}

              <div>
                <label className="text-[11px] font-semibold text-gray-500 mb-1 block">Font</label>
                <select
                  value={selected.fontFamily}
                  onChange={e => updateElement(selected.id, { fontFamily: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal/20 cursor-pointer"
                >
                  {FONT_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-500 mb-1 block">Size</label>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateElement(selected.id, { fontSize: Math.max(8, selected.fontSize - 1) })}
                    className="w-8 h-8 rounded-lg bg-gray-50 hover:bg-gray-100 flex items-center justify-center cursor-pointer"><Minus size={12} /></button>
                  <span className="text-sm font-semibold text-dark w-10 text-center">{selected.fontSize}</span>
                  <button onClick={() => updateElement(selected.id, { fontSize: Math.min(72, selected.fontSize + 1) })}
                    className="w-8 h-8 rounded-lg bg-gray-50 hover:bg-gray-100 flex items-center justify-center cursor-pointer"><Plus size={12} /></button>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-500 mb-1 block">Style</label>
                <div className="flex gap-1">
                  {[
                    { icon: Bold, prop: 'fontWeight', on: 'bold', off: 'normal' },
                    { icon: Italic, prop: 'fontStyle', on: 'italic', off: 'normal' },
                    { icon: Underline, prop: 'textDecoration', on: 'underline', off: 'none' },
                  ].map(({ icon: SIcon, prop, on, off }) => (
                    <button key={prop}
                      onClick={() => updateElement(selected.id, { [prop]: selected[prop] === on ? off : on })}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-colors
                        ${(selected[prop] || off) === on ? 'bg-royal text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                    ><SIcon size={13} /></button>
                  ))}
                  <div className="w-px bg-gray-200 mx-1" />
                  {[
                    { icon: AlignLeft, val: 'left' },
                    { icon: AlignCenter, val: 'center' },
                    { icon: AlignRight, val: 'right' },
                  ].map(({ icon: AIcon, val }) => (
                    <button key={val}
                      onClick={() => updateElement(selected.id, { textAlign: val })}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-colors
                        ${selected.textAlign === val ? 'bg-royal text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                    ><AIcon size={13} /></button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-500 mb-1 block">Color</label>
                <div className="flex flex-wrap gap-1.5">
                  {COLORS.map(c => (
                    <button key={c}
                      onClick={() => updateElement(selected.id, { color: c })}
                      className={`w-7 h-7 rounded-lg border-2 transition-all cursor-pointer
                        ${selected.color === c ? 'border-royal scale-110 shadow-md' : 'border-gray-200 hover:border-gray-300'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </motion.aside>

        {/* ──── CENTER PANEL: CANVAS ──── */}
        <div className="flex-1 flex flex-col items-center justify-center bg-gray-100 overflow-auto p-6 relative">

          {/* Zoom controls */}
          <div className="absolute top-4 right-4 flex items-center gap-1 bg-white rounded-lg shadow-sm border border-gray-200 p-1 z-10">
            <button onClick={() => setZoom(z => Math.max(50, z - 10))} className="p-1.5 rounded hover:bg-gray-100 cursor-pointer">
              <ZoomOut size={14} className="text-gray-500" />
            </button>
            <span className="text-xs font-semibold text-gray-600 w-10 text-center">{zoom}%</span>
            <button onClick={() => setZoom(z => Math.min(150, z + 10))} className="p-1.5 rounded hover:bg-gray-100 cursor-pointer">
              <ZoomIn size={14} className="text-gray-500" />
            </button>
            <div className="w-px h-4 bg-gray-200" />
            <button onClick={() => setZoom(100)} className="p-1.5 rounded hover:bg-gray-100 cursor-pointer">
              <RotateCcw size={14} className="text-gray-500" />
            </button>
          </div>

          {/* Certificate canvas */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'center' }}
          >
            <div
              ref={canvasRef}
              className="relative rounded-xl shadow-2xl overflow-hidden border border-gray-200"
              style={{ width: 800, height: 566, backgroundColor: BgComponent ? 'transparent' : bgColor }}
              onClick={clearSelection}
            >
              {/* Template background layer */}
              {BgComponent && (
                <div className="absolute inset-0 pointer-events-none z-0">
                  <BgComponent />
                </div>
              )}
              {/* Images on canvas */}
              {images.map(img => (
                <DraggableImage
                  key={img.id}
                  image={img}
                  isSelected={selectedId === img.id && selectedType === 'image'}
                  onSelect={selectImage}
                  onDrag={handleImageDrag}
                  onResize={handleImageResize}
                  onDelete={deleteImage}
                  canvasRef={canvasRef}
                />
              ))}

              {/* Text elements on canvas */}
              {elements.filter(el => !el.locked).map(el => (
                <DraggableText
                  key={el.id}
                  element={el}
                  isSelected={selectedId === el.id && selectedType === 'text'}
                  onSelect={selectText}
                  onDrag={handleTextDrag}
                  canvasRef={canvasRef}
                />
              ))}

              {/* Empty state hint */}
              {showPreview && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
                    <span className="text-[9px] font-semibold text-gray-300 bg-white/80 px-2 py-0.5 rounded-full">Preview Mode</span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Mode indicator */}
          <div className="mt-4 flex items-center gap-2">
            <button
              onClick={() => setShowPreview(p => !p)}
              className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full transition-all cursor-pointer
                ${showPreview
                  ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200 hover:bg-emerald-100'
                  : 'bg-royal/5 text-royal ring-1 ring-royal/20 hover:bg-royal/10'}`}
            >
              {showPreview ? '● Preview — Click to Edit' : '● Edit Mode'}
            </button>
            <span className="text-[10px] text-gray-400">
              {showPreview ? 'Viewing final certificate' : 'Click elements to edit · Drag to reposition · Add images from left panel'}
            </span>
          </div>
        </div>

        {/* ──── RIGHT PANEL: FIELDS ──── */}
        <motion.aside
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
          className="w-72 bg-white border-l border-gray-200 flex flex-col overflow-y-auto shrink-0"
        >
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Certificate Fields</h2>
            <p className="text-[10px] text-gray-400">Toggle fields on/off and edit content.</p>
          </div>

          <div className="p-4 space-y-3 flex-1">
            {elements.map(el => (
              <motion.div
                key={el.id}
                whileHover={{ x: -2 }}
                className={`p-3 rounded-xl border transition-all cursor-pointer
                  ${selectedId === el.id && selectedType === 'text'
                    ? 'border-royal/30 bg-royal/5 shadow-sm'
                    : el.locked ? 'border-gray-100 opacity-50' : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                  }`}
                onClick={() => selectText(el.id)}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <GripVertical size={12} className="text-gray-300" />
                    <span className="text-xs font-bold text-dark capitalize">
                      {el.id.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleElement(el.id); }}
                    className="cursor-pointer"
                  >
                    {el.locked
                      ? <ToggleLeft size={20} className="text-gray-300" />
                      : <ToggleRight size={20} className="text-royal" />
                    }
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  {el.type === 'placeholder' ? (
                    <span className="inline-flex items-center text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 ring-1 ring-amber-200">
                      {el.content}
                    </span>
                  ) : (
                    <p className="text-[11px] text-gray-500 truncate flex-1">{el.content}</p>
                  )}
                </div>
                {el.type === 'placeholder' && selectedId === el.id && selectedType === 'text' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                    className="mt-2 pt-2 border-t border-gray-100">
                    <label className="text-[10px] font-semibold text-gray-400 mb-1 block">Preview Text</label>
                    <input type="text" value={el.displayText}
                      onChange={e => updateElement(el.id, { displayText: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-royal/20"
                    />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Counts */}
          <div className="p-4 border-t border-gray-100 bg-gray-50">
            <p className="text-[10px] text-gray-400">
              {elements.filter(e => !e.locked).length} text fields · {images.length} images
            </p>
          </div>
        </motion.aside>
      </div>
    </div>
  );
}
