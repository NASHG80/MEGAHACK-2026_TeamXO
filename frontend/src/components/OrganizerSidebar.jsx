import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, PlusCircle, ClipboardList, FileText,
  CalendarCheck, Award, ChevronRight, ChevronLeft, Zap, UserCircle, Users2, Menu, X,
} from 'lucide-react';

const NAV = [
  { label: 'Dashboard',         href: '/organizer-dashboard',    icon: LayoutDashboard },
  { label: 'Create Hackathon',  href: '/organizer/create',       icon: PlusCircle      },
  { label: 'Manage Hackathons', href: '/organizer/manage',       icon: ClipboardList   },
  { label: 'PPT Review',        href: '/organizer/ppt-review',   icon: FileText        },
  { label: 'Event Management',  href: '/organizer/events',       icon: CalendarCheck   },
  { label: 'CoCom Dashboard',   href: '/organizer/cocom',        icon: Users2          },
  { label: 'Certificates',      href: '/organizer/certificates', icon: Award           },
  { label: 'My Profile',        href: '/organizer/profile',      icon: UserCircle      },
];

function NavLinks({ showLabels, pathname }) {
  return (
    <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
      {NAV.map(({ label, href, icon: Icon }) => {
        const isEvent = label === 'Event Management';
        const isCoCom = label === 'CoCom Dashboard';
        const on =
          pathname === href ||
          (isEvent && pathname.startsWith('/organizer/event')) ||
          (isCoCom && pathname.startsWith('/organizer/cocom'));
        return (
          <Link
            key={label}
            to={href}
            title={!showLabels ? label : undefined}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
              ${on
                ? 'bg-royal text-white shadow-md shadow-royal/20'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
              }`}
          >
            <Icon size={17} className="shrink-0" />
            {showLabels && (
              <>
                <span className="whitespace-nowrap flex-1">{label}</span>
                {isEvent && (
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{
                      background: 'rgba(34,197,94,0.15)',
                      border: '1px solid rgba(34,197,94,0.3)',
                      color: on ? '#fff' : '#16a34a',
                      letterSpacing: '0.5px',
                    }}
                  >
                    LIVE
                  </span>
                )}
              </>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

/**
 * OrganizerSidebar
 *
 * Desktop (≥ lg):  Fixed collapsible side panel — full labels or icon-only.
 * Mobile  (< lg):  Hidden. A floating hamburger button (fixed top-left) opens
 *                  a slide-in drawer with a dimmed backdrop.
 */
export default function OrganizerSidebar({ open: openProp, onToggle: onToggleProp }) {
  const [internalOpen, setInternalOpen] = useState(true);
  const [mobileOpen, setMobileOpen]     = useState(false);

  const open     = openProp     !== undefined ? openProp     : internalOpen;
  const onToggle = onToggleProp !== undefined ? onToggleProp : () => setInternalOpen(o => !o);

  const { pathname } = useLocation();

  // Close mobile drawer on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  // Lock body scroll while drawer is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <>
      {/* ── Mobile: floating hamburger button ── */}
      <button
        className="lg:hidden fixed top-3.5 left-4 z-50 w-9 h-9 flex items-center justify-center
          bg-white border border-gray-200 rounded-xl shadow-md text-gray-600
          hover:text-royal hover:border-royal/30 transition-colors cursor-pointer"
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
      >
        <Menu size={18} />
      </button>

      {/* ── Mobile: backdrop ── */}
      <div
        onClick={() => setMobileOpen(false)}
        className={`lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300
          ${mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      />

      {/* ── Mobile: slide-in drawer ── */}
      <aside
        className={`lg:hidden fixed top-0 left-0 z-50 h-full w-72 bg-white border-r border-gray-100 shadow-2xl
          flex flex-col overflow-hidden transition-transform duration-300 ease-in-out
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between h-[60px] px-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-royal flex items-center justify-center shrink-0">
              <Zap size={14} className="text-white" />
            </div>
            <span className="text-base font-extrabold text-royal tracking-tight">
              Hack<span className="text-dark">Flow</span>
            </span>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-royal hover:bg-royal/5 transition-colors cursor-pointer"
            aria-label="Close menu"
          >
            <X size={17} />
          </button>
        </div>
        <NavLinks showLabels pathname={pathname} />
      </aside>

      {/* ── Desktop: collapsible sidebar ── */}
      <aside
        className={`hidden lg:flex fixed top-0 left-0 z-30 h-full bg-white border-r border-gray-100 shadow-sm
          flex-col overflow-hidden transition-all duration-300
          ${open ? 'w-60' : 'w-16'}`}
      >
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
          <button
            onClick={onToggle}
            className="p-1 rounded-lg text-gray-400 hover:text-royal hover:bg-royal/5 transition-colors cursor-pointer shrink-0"
            aria-label={open ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {open ? <ChevronLeft size={15} /> : <ChevronRight size={15} />}
          </button>
        </div>
        <NavLinks showLabels={open} pathname={pathname} />
      </aside>
    </>
  );
}
