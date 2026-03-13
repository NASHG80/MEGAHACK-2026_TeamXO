import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, PlusCircle, ClipboardList, FileText,
  CalendarCheck, Award, ChevronRight, ChevronLeft, Zap, UserCircle, Users2, Menu, X,
} from 'lucide-react';

const NAV = [
  { label: 'Dashboard',         href: '/organizer-dashboard',   icon: LayoutDashboard },
  { label: 'Create Hackathon',  href: '/organizer/create',      icon: PlusCircle      },
  { label: 'Manage Hackathons', href: '/organizer/manage',      icon: ClipboardList   },
  { label: 'PPT Review',        href: '/organizer/ppt-review',  icon: FileText        },
  { label: 'Event Management',  href: '/organizer/events',      icon: CalendarCheck   },
  { label: 'CoCom Dashboard',   href: '/organizer/cocom',       icon: Users2          },
  { label: 'Certificates',      href: '/organizer/certificates', icon: Award          },
  { label: 'MyProfile',         href: '/organizer/profile',     icon: UserCircle      },
];

/* ── detect mobile ── */
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768);
  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);
  return isMobile;
}

/**
 * OrganizerSidebar
 * ─ Desktop : collapsible icon-rail (w-16) ↔ full (w-60)
 * ─ Mobile  : hidden drawer that slides in from left as an overlay.
 *             A fixed top-bar with hamburger is rendered automatically
 *             on mobile so ALL pages get it without any extra code.
 */
export default function OrganizerSidebar({ open: openProp, onToggle: onToggleProp }) {
  const [internalOpen, setInternalOpen] = useState(true);
  const [mobileOpen, setMobileOpen]     = useState(false);

  const open     = openProp     !== undefined ? openProp     : internalOpen;
  const onToggle = onToggleProp !== undefined ? onToggleProp : () => setInternalOpen(o => !o);

  const isMobile = useIsMobile();
  const { pathname } = useLocation();

  // Close mobile drawer on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  // Lock body scroll while drawer is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  /* Close drawer on route change (mobile) */
  useEffect(() => {
    if (isMobile && open) onToggle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  /* Current page label for mobile top-bar */
  const currentLabel = NAV.find(n =>
    pathname === n.href ||
    (n.label === 'Event Management' && pathname.startsWith('/organizer/event')) ||
    (n.label === 'CoCom Dashboard'  && pathname.startsWith('/organizer/cocom'))
  )?.label ?? 'Organizer';

  /* ─────────────────────── DESKTOP ─────────────────────── */
  if (!isMobile) {
    return (
      <aside className={`fixed top-0 left-0 z-30 h-full bg-white border-r border-gray-100 shadow-sm
        transition-all duration-300 flex flex-col overflow-hidden
        ${open ? 'w-60' : 'w-16'}`}>

        {/* Logo row */}
        <div className={`flex items-center h-[60px] px-4 border-b border-gray-100 shrink-0 ${open ? 'gap-3' : 'justify-center'}`}>
          <div className="w-7 h-7 rounded-lg bg-royal flex items-center justify-center shrink-0">
            <Zap size={14} className="text-white" />
          </div>
          {open && (
            <span className="flex-1 text-base font-extrabold text-royal tracking-tight whitespace-nowrap">
              Hack<span className="text-dark">Flow</span>
            </span>
          )}
          <button onClick={onToggle}
            className="p-1 rounded-lg text-gray-400 hover:text-royal hover:bg-royal/5 transition-colors cursor-pointer shrink-0"
            aria-label={open ? 'Collapse sidebar' : 'Expand sidebar'}>
            {open ? <ChevronLeft size={15} /> : <ChevronRight size={15} />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
          {NAV.map(({ label, href, icon: Icon }) => {
            const isEvent = label === 'Event Management';
            const isCoCom = label === 'CoCom Dashboard';
            const on = pathname === href
              || (isEvent && pathname.startsWith('/organizer/event'))
              || (isCoCom && pathname.startsWith('/organizer/cocom'));
            return (
              <Link key={label} to={href} title={!open ? label : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                  transition-all duration-150
                  ${on ? 'bg-royal text-white shadow-md shadow-royal/20' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'}`}>
                <Icon size={17} className="shrink-0" />
                {open && (
                  <>
                    <span className="whitespace-nowrap flex-1">{label}</span>
                    {isEvent && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                        style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', color: on ? '#fff' : '#16a34a', letterSpacing: '0.5px' }}>
                        LIVE
                      </span>
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>
    );
  }

  /* ─────────────────────── MOBILE ─────────────────────── */
  return (
    <>
      {/*
        Global style — only injected once on mobile.
        Pushes every page's content below the fixed top-bar.
        Important: this is scoped to [data-page-content] or simply
        adds body padding-top so ALL pages benefit automatically.
      */}
      <style>{`
        @media (max-width: 768px) {
          body { padding-top: 56px !important; }
        }
        @keyframes _sbFadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes _sbSlideIn { from { transform: translateX(-100%) } to { transform: translateX(0) } }
      `}</style>

      {/* ── Fixed top-bar (hamburger + logo + page title) ── */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 35,
        height: '56px', background: '#fff',
        borderBottom: '1px solid #e2e8f0',
        boxShadow: '0 1px 6px rgba(0,0,0,0.07)',
        display: 'flex', alignItems: 'center',
        padding: '0 16px', gap: '12px',
      }}>
        {/* Hamburger */}
        <button onClick={onToggle}
          style={{ padding: '8px', borderRadius: '10px', background: '#f1f5f9', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Menu size={20} color="#1E64FF" />
        </button>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '26px', height: '26px', borderRadius: '7px', background: '#1E64FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={13} color="#fff" />
          </div>
          <span style={{ fontSize: '15px', fontWeight: 800, color: '#1E64FF', letterSpacing: '-0.3px' }}>
            Hack<span style={{ color: '#0A1628' }}>Flow</span>
          </span>
        </div>

        {/* Current page label */}
        <span style={{ marginLeft: 'auto', fontSize: '13px', fontWeight: 700, color: '#475569', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>
          {currentLabel}
        </span>
      </div>

      {/* ── Backdrop ── */}
      {open && (
        <div onClick={onToggle} style={{
          position: 'fixed', inset: 0, zIndex: 40,
          background: 'rgba(10,22,40,0.45)',
          backdropFilter: 'blur(2px)',
          animation: '_sbFadeIn .2s ease',
        }} />
      )}

      {/* ── Drawer ── */}
      <aside style={{
        position: 'fixed', top: 0, left: 0, zIndex: 50,
        height: '100%', width: '260px',
        background: '#fff',
        borderRight: '1px solid #f1f5f9',
        boxShadow: '4px 0 24px rgba(0,0,0,0.12)',
        display: 'flex', flexDirection: 'column',
        transform: open ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
        overflow: 'hidden',
      }}>
        {/* Drawer header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', height: '60px', padding: '0 16px', borderBottom: '1px solid #f1f5f9', flexShrink: 0 }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#1E64FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Zap size={14} color="#fff" />
          </div>
          <span style={{ flex: 1, fontSize: '15px', fontWeight: 800, color: '#1E64FF', letterSpacing: '-0.3px' }}>
            Hack<span style={{ color: '#0A1628' }}>Flow</span>
          </span>
          <button onClick={onToggle}
            style={{ padding: '6px', borderRadius: '8px', background: '#f1f5f9', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={16} color="#64748b" />
          </button>
        </div>

        {/* Drawer nav */}
        <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {NAV.map(({ label, href, icon: Icon }) => {
            const isEvent = label === 'Event Management';
            const isCoCom = label === 'CoCom Dashboard';
            const on = pathname === href
              || (isEvent && pathname.startsWith('/organizer/event'))
              || (isCoCom && pathname.startsWith('/organizer/cocom'));
            return (
              <Link key={label} to={href} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '11px 14px', borderRadius: '12px',
                textDecoration: 'none', fontSize: '14px', fontWeight: 600,
                color: on ? '#fff' : '#64748b',
                background: on ? '#1E64FF' : 'transparent',
                transition: 'all .15s',
              }}>
                <Icon size={17} style={{ flexShrink: 0 }} />
                <span style={{ flex: 1, whiteSpace: 'nowrap' }}>{label}</span>
                {isEvent && (
                  <span style={{
                    fontSize: '9px', fontWeight: 800,
                    padding: '2px 7px', borderRadius: '20px',
                    background: on ? 'rgba(255,255,255,0.2)' : 'rgba(34,197,94,0.15)',
                    border: `1px solid ${on ? 'rgba(255,255,255,0.3)' : 'rgba(34,197,94,0.3)'}`,
                    color: on ? '#fff' : '#16a34a',
                    letterSpacing: '0.5px',
                  }}>LIVE</span>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
