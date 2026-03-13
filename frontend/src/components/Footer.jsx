import { Zap } from 'lucide-react';

const columns = [
  {
    title: 'Product',
    links: ['Features', 'Pricing', 'Integrations', 'Changelog'],
  },
  {
    title: 'Students',
    links: ['Find Hackathons', 'Build Teams', 'Submit Projects', 'Get Certificates'],
  },
  {
    title: 'Organizers',
    links: ['Create Hackathon', 'Manage Participants', 'Evaluate Submissions', 'Analytics'],
  },
  {
    title: 'Support',
    links: ['Help Center', 'Documentation', 'API Reference', 'Contact Us'],
  },
];

export default function Footer() {
  return (
    <footer id="footer" className="bg-dark text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="text-royal-light" size={22} />
              <span className="text-xl font-extrabold tracking-tight">
                Hack<span className="text-royal-light">Flow</span>
              </span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              The unified platform for seamless hackathon management — from registration to certificates.
            </p>
          </div>

          {/* Link Columns */}
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                {col.title}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-gray-400 hover:text-royal-light transition-colors duration-200"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} HackFlow. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-sm text-gray-500 hover:text-royal-light transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-sm text-gray-500 hover:text-royal-light transition-colors">
                Terms of Service
              </a>
              <a href="mailto:support@hackflow.io" className="text-sm text-gray-500 hover:text-royal-light transition-colors">
                support@hackflow.io
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
