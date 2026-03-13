import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { label: 'Home',               href: '/' },
  { label: 'Explore Hackathons', href: '#hackathons' },
  { label: 'Features',           href: '#features' },
  { label: 'For Organizers',     href: '#user-types' },
  { label: 'Contact',            href: '#footer' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-2xl font-extrabold text-royal tracking-tight">
              Hack<span className="text-dark">Flow</span>
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) =>
              link.href.startsWith('/') ? (
                <Link key={link.label} to={link.href} className="text-sm font-medium text-gray-600 hover:text-royal transition-colors duration-200">
                  {link.label}
                </Link>
              ) : (
                <a key={link.label} href={link.href} className="text-sm font-medium text-gray-600 hover:text-royal transition-colors duration-200">
                  {link.label}
                </a>
              )
            )}
          </div>

          {/* Desktop Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login" className="px-5 py-2 text-sm font-semibold text-royal border-2 border-royal rounded-lg hover:bg-royal hover:text-white transition-all duration-200">
              Login
            </Link>
            <Link to="/signup" className="px-5 py-2 text-sm font-semibold text-white bg-royal rounded-lg hover:bg-royal-light transition-all duration-200 shadow-md hover:shadow-lg">
              Register
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden p-2 text-dark cursor-pointer"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          mobileOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 pb-4 pt-2 space-y-2 bg-white border-t border-gray-100">
          {navLinks.map((link) =>
            link.href.startsWith('/') ? (
              <Link key={link.label} to={link.href} className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-royal hover:bg-royal/5 rounded-lg transition-colors" onClick={() => setMobileOpen(false)}>
                {link.label}
              </Link>
            ) : (
              <a key={link.label} href={link.href} className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-royal hover:bg-royal/5 rounded-lg transition-colors" onClick={() => setMobileOpen(false)}>
                {link.label}
              </a>
            )
          )}
          <div className="flex gap-3 pt-3 border-t border-gray-100">
            <Link to="/login" className="flex-1 text-center px-4 py-2 text-sm font-semibold text-royal border-2 border-royal rounded-lg hover:bg-royal hover:text-white transition-all" onClick={() => setMobileOpen(false)}>
              Login
            </Link>
            <Link to="/signup" className="flex-1 text-center px-4 py-2 text-sm font-semibold text-white bg-royal rounded-lg hover:bg-royal-light transition-all" onClick={() => setMobileOpen(false)}>
              Register
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
