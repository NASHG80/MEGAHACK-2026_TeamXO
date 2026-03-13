import { Mail, Phone } from 'lucide-react';

export default function ContactSection({ contactEmail, contactPhone }) {
  return (
    <div>
      <h2 className="section-head">Contact Organizer</h2>
      <p className="section-sub">Reach out for queries or support</p>

      <div className="flex flex-col sm:flex-row gap-4 max-w-lg">
        {contactEmail && (
          <a
            href={`mailto:${contactEmail}`}
            className="card card-hover flex-1 flex items-center gap-4 px-5 py-4 group"
          >
            <div className="w-11 h-11 bg-primary-100 rounded-xl flex items-center justify-center
                            group-hover:bg-primary-200 transition-colors">
              <Mail className="w-5 h-5 text-primary-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Email</p>
              <p className="text-sm font-semibold text-gray-900 group-hover:text-primary-600 truncate transition-colors">
                {contactEmail}
              </p>
            </div>
          </a>
        )}

        {contactPhone && (
          <a
            href={`tel:${contactPhone}`}
            className="card card-hover flex-1 flex items-center gap-4 px-5 py-4 group"
          >
            <div className="w-11 h-11 bg-green-100 rounded-xl flex items-center justify-center
                            group-hover:bg-green-200 transition-colors">
              <Phone className="w-5 h-5 text-green-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Phone</p>
              <p className="text-sm font-semibold text-gray-900 group-hover:text-green-600 truncate transition-colors">
                {contactPhone}
              </p>
            </div>
          </a>
        )}
      </div>
    </div>
  );
}
