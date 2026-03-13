import { Link } from 'react-router-dom';
import {
  MapPin, Users, Calendar, Clock, Share2, Bookmark, ExternalLink
} from 'lucide-react';
import { fmt } from '../../utils/dateUtils';

export default function HeroSection({ hackathon }) {
  return (
    <section className="w-full">
      {/* ── Banner ───────────────────────────────────────── */}
      <div className="relative w-full h-64 sm:h-80 lg:h-96 overflow-hidden bg-gradient-to-r from-primary-900 to-purple-800">
        {hackathon.bannerImage
          ? <img src={hackathon.bannerImage} alt={hackathon.title}
              className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
          : <div className="absolute inset-0 bg-gradient-to-br from-[#253f8e] via-primary-700 to-purple-600" />
        }
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/30 to-transparent" />

        {/* Action buttons top-right */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button className="glass border border-white/30 p-2 rounded-lg text-white hover:bg-white/20 transition">
            <Share2 className="w-4 h-4" />
          </button>
          <button className="glass border border-white/30 p-2 rounded-lg text-white hover:bg-white/20 transition">
            <Bookmark className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Info strip ───────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container-lg py-5">
          <div className="flex flex-col lg:flex-row lg:items-start gap-5">

            {/* Organizer logo (overlapping banner) */}
            <div className="flex-shrink-0 -mt-14 lg:-mt-16">
              <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-2xl border-4 border-white shadow-lg overflow-hidden bg-gradient-to-br from-primary-600 to-purple-600">
                {hackathon.organizerLogo
                  ? <img src={hackathon.organizerLogo} alt={hackathon.organizerName}
                      className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center">
                      <span className="text-white text-3xl font-bold">
                        {hackathon.organizerName?.charAt(0)}
                      </span>
                    </div>
                }
              </div>
            </div>

            {/* Title + meta */}
            <div className="flex-1 min-w-0">
              <p className="text-primary-600 text-sm font-semibold mb-1">
                {hackathon.organizerName}
              </p>
              <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight mb-3">
                {hackathon.title}
              </h1>

              {/* Tags row */}
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                <MetaChip icon={<MapPin className="w-3.5 h-3.5" />} label={hackathon.mode} />
                <MetaChip icon={<Users className="w-3.5 h-3.5" />}
                  label={`${hackathon.teamSizeMin}–${hackathon.teamSizeMax} Members`} />
                <MetaChip icon={<Calendar className="w-3.5 h-3.5" />}
                  label={`${fmt(hackathon.hackathonStartDate)} – ${fmt(hackathon.hackathonEndDate)}`} />
                <MetaChip icon={<Clock className="w-3.5 h-3.5 text-red-500" />}
                  label={`Deadline: ${fmt(hackathon.registrationDeadline)}`}
                  urgent />
              </div>
            </div>

            {/* CTA (desktop) */}
            <div className="hidden lg:flex flex-col items-end gap-3 flex-shrink-0 mt-1">
              <Link
                to={`/hackathon/${hackathon.slug}/register`}
                className="btn-primary px-7 py-2.5 text-[15px]"
              >
                Register Now
              </Link>
              <p className="text-xs text-gray-400">
                {hackathon.eligibility}
              </p>
            </div>
          </div>

          {/* CTA mobile */}
          <div className="lg:hidden mt-4">
            <Link
              to={`/hackathon/${hackathon.slug}/register`}
              className="btn-primary w-full py-3 text-[15px]"
            >
              Register Now
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function MetaChip({ icon, label, urgent }) {
  return (
    <span className={`flex items-center gap-1.5 ${urgent ? 'text-red-500 font-semibold' : ''}`}>
      {icon}
      <span>{label}</span>
    </span>
  );
}
