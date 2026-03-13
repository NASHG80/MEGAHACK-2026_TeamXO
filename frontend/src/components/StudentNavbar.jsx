import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, User, Radio, LogOut, Zap } from 'lucide-react';

const BASE_LINKS = [
  { label: 'Dashboard',       to: '/student/dashboard' },
  { label: 'Community',       to: '/student/community' },
  { label: 'Virtual Office',  to: '/student/virtual-office' },
  { label: 'Certificates',    to: '/student/certificates' },
];

export default function StudentNavbar() {
  const [mobileOpen, setMobileOpen]     = useState(false);
  const [isShortlisted, setIsShortlisted] = useState(false);
  const [user, setUser] = useState({
    name:  localStorage.getItem('hf_name')  || '',
    email: localStorage.getItem('hf_email') || '',
  });

  const navigate  = useNavigate();
  const location  = useLocation();
  const token     = localStorage.getItem('hf_token');

  /* ── Fetch real user data ── */
  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const res = await fetch('http://localhost:5000/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          // API returns { success, user: { name, email, ... } }
          const u = data.user || data;
          setUser({ name: u.name || '', email: u.email || '' });
        }
      } catch { /* keep defaults */ }
    })();
  }, [token]);

  /* ── Fetch shortlisted status ── */
  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const res = await fetch('http://localhost:5000/api/live-event/shortlisted', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setIsShortlisted(data.isShortlisted);
        }
      } catch { /* keep false */ }
    })();
  }, [token]);

  const navLinks = isShortlisted
    ? [...BASE_LINKS, { label: 'Live Event', to: '/student/live-event', highlight: true }]
    : BASE_LINKS;

  /* ── Initials avatar from real name ── */
  const initials = user.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : (user.email ? user.email[0].toUpperCase() : 'ST');

  const avBg = (str = '') =>
    `hsl(${(str.charCodeAt(0) || 0) * 47 % 360},55%,55%)`;

  const signOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('hf_token');
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── Logo ── */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-xl bg-royal flex items-center justify-center shadow-sm shadow-royal/30 group-hover:scale-105 transition-transform">
              <Zap size={16} className="text-white fill-white" />
            </div>
            <span className="text-xl font-extrabold text-royal tracking-tight">
              Hack<span className="text-dark">Flow</span>
            </span>
          </Link>

          {/* ── Desktop Nav Links ── */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.label}
                  to={link.to}
                  className={`text-sm font-medium transition-colors duration-200 flex items-center gap-1.5
                    ${link.highlight
                      ? 'text-royal font-bold'
                      : isActive
                        ? 'text-royal'
                        : 'text-gray-600 hover:text-royal'
                    }`}
                >
                  {link.highlight && <Radio size={13} className="text-emerald-500 animate-pulse" />}
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* ── Profile Avatar + Sign Out ── */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => navigate('/student/profile')}
              title={user.name || user.email || 'Profile'}
              className="flex items-center justify-center w-9 h-9 rounded-full text-white font-bold text-sm overflow-hidden shadow-sm hover:opacity-90 transition-opacity cursor-pointer"
              style={{ background: avBg(user.name || user.email) }}
              aria-label="View profile"
            >
              {initials}
            </button>
            <span className="text-sm font-medium text-gray-700 hidden lg:block max-w-[140px] truncate">
              {user.name || user.email}
            </span>
            <button
              onClick={signOut}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-500 border border-red-100 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
              aria-label="Sign out"
            >
              <LogOut size={13} /> Sign Out
            </button>
          </div>

          {/* ── Mobile Hamburger ── */}
          <button
            className="md:hidden p-2 text-dark cursor-pointer"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* ── Mobile Menu ── */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          mobileOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 pb-4 pt-2 space-y-1 bg-white border-t border-gray-100">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className={`flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors
                ${link.highlight
                  ? 'text-royal font-bold bg-royal/5'
                  : 'text-gray-700 hover:text-royal hover:bg-royal/5'
                }`}
              onClick={() => setMobileOpen(false)}
            >
              {link.highlight && <Radio size={13} className="text-emerald-500 animate-pulse" />}
              {link.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-gray-100 space-y-1">
            <Link
              to="/student/profile"
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 hover:text-royal hover:bg-royal/5 rounded-lg transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              <div
                className="w-7 h-7 rounded-full text-white font-bold text-xs flex items-center justify-center shrink-0"
                style={{ background: avBg(user.name || user.email) }}
              >
                {initials}
              </div>
              {user.name || user.email || 'Profile'}
            </Link>
            <button
              onClick={() => { setMobileOpen(false); signOut(); }}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
