import { Link } from 'react-router-dom';
import {
  Calendar, Users, MapPin, Clock, Award, Globe, AlertCircle, ChevronRight
} from 'lucide-react';
import { fmt, daysUntil, isFuture } from '../../utils/dateUtils';

export default function EventInfoCard({ hackathon }) {
  const days = daysUntil(hackathon.registrationDeadline);
  const regOpen = isFuture(hackathon.registrationDeadline);

  return (
    <div className="card sticky top-20">
      {/* Registration countdown */}
      {regOpen && days !== null && (
        <div className="bg-red-50 border-b border-red-100 px-5 py-3 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-sm font-semibold text-red-600">
            {days === 0 ? 'Closes today!' : `${days} day${days !== 1 ? 's' : ''} left to register`}
          </p>
        </div>
      )}
      {!regOpen && (
        <div className="bg-gray-50 border-b border-gray-100 px-5 py-3">
          <p className="text-sm font-semibold text-gray-500">Registration Closed</p>
        </div>
      )}

      {/* Register CTA */}
      <div className="px-5 pt-4 pb-2">
        <Link
          to={`/hackathon/${hackathon.slug}/register`}
          className={`btn-register ${!regOpen ? 'opacity-60 cursor-not-allowed pointer-events-none' : ''}`}
        >
          {regOpen ? 'Register Now' : 'Registration Closed'}
        </Link>
        <p className="text-center text-xs text-gray-400 mt-2">{hackathon.eligibility}</p>
      </div>

      <hr className="border-gray-100 my-2" />

      {/* Detail rows */}
      <div className="px-5 pb-5 space-y-4">
        <DetailRow
          icon={<Globe className="w-4 h-4 text-primary-500" />}
          label="Mode"
          value={
            <span className={`badge ${
              hackathon.mode === 'Online'  ? 'bg-green-100 text-green-700' :
              hackathon.mode === 'Offline' ? 'bg-amber-100 text-amber-700' :
                                             'bg-blue-100 text-blue-700'
            }`}>{hackathon.mode}</span>
          }
        />
        <DetailRow
          icon={<MapPin className="w-4 h-4 text-primary-500" />}
          label="Location"
          value={hackathon.location || 'Online'}
        />
        <DetailRow
          icon={<Users className="w-4 h-4 text-primary-500" />}
          label="Team Size"
          value={`${hackathon.teamSizeMin} – ${hackathon.teamSizeMax} Members`}
        />
        <DetailRow
          icon={<Clock className="w-4 h-4 text-red-400" />}
          label="Reg. Deadline"
          value={<span className="text-red-500 font-semibold">{fmt(hackathon.registrationDeadline)}</span>}
        />
        <DetailRow
          icon={<Calendar className="w-4 h-4 text-primary-500" />}
          label="Event Starts"
          value={fmt(hackathon.hackathonStartDate)}
        />
        <DetailRow
          icon={<Calendar className="w-4 h-4 text-primary-500" />}
          label="Event Ends"
          value={fmt(hackathon.hackathonEndDate)}
        />
        <DetailRow
          icon={<Award className="w-4 h-4 text-primary-500" />}
          label="Eligibility"
          value={hackathon.eligibility || 'Open to all'}
        />
      </div>

      {/* Contact organizer */}
      <div className="px-5 pb-4">
        <a
          href={`mailto:${hackathon.contactEmail}`}
          className="flex items-center justify-between text-sm text-primary-600 hover:text-primary-700 font-medium group"
        >
          <span>Contact Organizer</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </a>
      </div>
    </div>
  );
}

function DetailRow({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex-shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide leading-none mb-0.5">{label}</p>
        <div className="text-sm font-semibold text-gray-800 leading-snug break-words">
          {value}
        </div>
      </div>
    </div>
  );
}
