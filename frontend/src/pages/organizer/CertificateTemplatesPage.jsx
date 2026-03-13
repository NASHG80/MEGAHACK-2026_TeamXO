import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Search, Users, Trophy, Layers, Plus } from 'lucide-react';
import OrganizerSidebar from '../../components/OrganizerSidebar';
import CertificateTemplateCard, { CERTIFICATE_BACKGROUNDS } from '../../components/CertificateTemplateCard';

/* ──────────────── FILTER CONFIG ──────────────── */
const FILTERS = [
  { key: 'all',          label: 'All Templates',  icon: Layers },
  { key: 'participant',  label: 'Participants',   icon: Users  },
  { key: 'winner',       label: 'Winners',        icon: Trophy },
];

/* ─────────────── MAIN PAGE ─────────────── */
export default function CertificateTemplatesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery]   = useState('');
  const navigate = useNavigate();

  const filtered = CERTIFICATE_BACKGROUNDS.filter(t => {
    const matchFilter = activeFilter === 'all' || t.tags.includes(activeFilter);
    const matchSearch = !searchQuery || t.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchFilter && matchSearch;
  });

  const handleSelect = (template) => {
    navigate('/organizer/certificates/editor', {
      state: {
        templateId: template.id,
        name: template.name,
      },
    });
  };

  const handleCreateBlank = () => {
    navigate('/organizer/certificates/editor', {
      state: {
        templateId: 'blank',
        name: 'Custom Certificate',
      },
    });
  };

  return (
    <div className="min-h-screen bg-light-gray font-sans">
      <OrganizerSidebar open={sidebarOpen} onToggle={() => setSidebarOpen(o => !o)} />

      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:pl-60' : 'lg:pl-16'}`}>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* ── Page Header ── */}
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }} className="mb-10"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-royal/10 flex items-center justify-center">
                <Award size={20} className="text-royal" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-dark tracking-tight">
                Certificate Generator
              </h1>
            </div>
            <p className="text-sm text-gray-500 ml-[52px]">
              Create and send professional certificates to hackathon participants and winners.
            </p>
            <div className="ml-[52px] mt-3 w-16 h-1 rounded-full bg-royal" />
          </motion.div>

          {/* ── Search + Filters ── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8"
          >
            <div className="relative flex-1 max-w-md">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text" value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search templates..."
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-200
                           bg-white focus:outline-none focus:ring-2 focus:ring-royal/30
                           focus:border-royal/40 transition-all placeholder:text-gray-400"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap relative">
              {FILTERS.map(({ key, label, icon: FIcon }) => (
                <button key={key} onClick={() => setActiveFilter(key)}
                  className={`relative z-10 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer
                    ${activeFilter === key ? 'text-white' : 'text-gray-600 hover:bg-gray-100 bg-white border border-gray-200'}`}
                >
                  {activeFilter === key && (
                    <motion.div layoutId="filter-active-pill"
                      className="absolute inset-0 bg-royal rounded-full shadow-md shadow-royal/25"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5"><FIcon size={13} />{label}</span>
                </button>
              ))}
            </div>
          </motion.div>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
            className="text-xs text-gray-400 mb-5 font-medium">
            Showing {filtered.length} template{filtered.length !== 1 ? 's' : ''}
          </motion.p>

          {/* ── Template Grid ── */}
          <AnimatePresence mode="popLayout">
            {filtered.length > 0 ? (
              <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Create blank template card */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                  whileHover={{ scale: 1.03 }}
                  onClick={handleCreateBlank}
                  className="group relative bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl
                             border-2 border-dashed border-gray-200 hover:border-royal/40 transition-all duration-300 cursor-pointer"
                >
                  <div className="aspect-[1.414/1] flex flex-col items-center justify-center gap-3 bg-gray-50/50 group-hover:bg-royal/5 transition-colors">
                    <div className="w-14 h-14 rounded-2xl bg-royal/10 group-hover:bg-royal/20 flex items-center justify-center transition-colors">
                      <Plus size={24} className="text-royal" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-dark">Create Template</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">Start with a blank canvas</p>
                    </div>
                  </div>
                </motion.div>

                {filtered.map((tpl, i) => (
                  <CertificateTemplateCard key={tpl.id} template={tpl} onSelect={handleSelect} index={i + 1} />
                ))}
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                  <Search size={24} className="text-gray-400" />
                </div>
                <h3 className="font-bold text-dark text-lg mb-1">No templates found</h3>
                <p className="text-sm text-gray-500 max-w-xs">
                  Try adjusting your search or filter to find what you're looking for.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

        </main>
      </div>
    </div>
  );
}
