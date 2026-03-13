import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, PlusCircle, ClipboardList, FileText,
  CalendarCheck, Award, Settings, ChevronRight, ChevronLeft, Zap, UserCircle, ShieldCheck,
} from 'lucide-react';

const NAV = [
  { label: 'Dashboard',         href: '/organizer-dashboard',      icon: LayoutDashboard },
  { label: 'Create Hackathon',  href: '/organizer/create',         icon: PlusCircle      },
  { label: 'Manage Hackathons', href: '/organizer/manage',         icon: ClipboardList   },
  { label: 'PPT Review',        href: '/organizer/ppt-review',     icon: FileText        },
  { label: 'Event Management',  href: '/organizer/events',         icon: CalendarCheck   },
  { label: 'Certificates',      href: '/organizer/certificates',   icon: Award           },
  { label: 'MyProfile',         href: '/organizer/profile',        icon: UserCircle      },
];

/**
 * OrganizerSidebar — shared collapsible sidebar for all organizer pages.
 *
 * Usage (self-managed open state):
 *   <OrganizerSidebar />
 *
 * Usage (controlled from parent):
 *   const [open, setOpen] = useState(true);
 *   <OrganizerSidebar open={open} onToggle={() => setOpen(o => !o)} />
 *
 * The component returns { open } as second value when used via the hook:
 *   const [sidebarOpen, setSidebarOpen] = useState(true);
 */
export default function OrganizerSidebar({ open: openProp, onToggle: onToggleProp }) {
  const [internalOpen, setInternalOpen] = useState(true);
  const open     = openProp     !== undefined ? openProp     : internalOpen;
  const onToggle = onToggleProp !== undefined ? onToggleProp : () => setInternalOpen(o => !o);

  const { pathname } = useLocation();

  return (
    <aside
      className={`fixed top-0 left-0 z-30 h-full bg-white border-r border-gray-100 shadow-sm
        transition-all duration-300 flex flex-col overflow-hidden
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

      {/* Nav links */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {NAV.map(({ label, href, icon: Icon }) => {
          const isEvent = label === 'Event Management';
          const on = pathname === href || (isEvent && pathname.startsWith('/organizer/event'));
          return (
            <Link
              key={label}
              to={href}
              title={!open ? label : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                transition-all duration-150
                ${on
                  ? 'bg-royal text-white shadow-md shadow-royal/20'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                }`}
            >
              <Icon size={17} className="shrink-0" />
              {open && (
                <>
                  <span className="whitespace-nowrap flex-1">{label}</span>
                  {isEvent && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{
                        background: 'rgba(34,197,94,0.15)',
                        border: '1px solid rgba(34,197,94,0.3)',
                        color: on ? '#fff' : '#16a34a',
                        letterSpacing: '0.5px',
                      }}>
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
