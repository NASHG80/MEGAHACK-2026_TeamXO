import { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getHackathonBySlug } from '../../api/hackathonApi';

import StudentNavbar      from '../../components/StudentNavbar';
import HeroSection        from '../../components/hackathon/HeroSection';
import EventInfoCard      from '../../components/hackathon/EventInfoCard';
import OverviewSection    from '../../components/hackathon/OverviewSection';
import TracksSection      from '../../components/hackathon/TracksSection';
import TimelineSection    from '../../components/hackathon/TimelineSection';
import BenefitsSection    from '../../components/hackathon/BenefitsSection';
import PrizesSection      from '../../components/hackathon/PrizesSection';
import RulesSection       from '../../components/hackathon/RulesSection';
import ContactSection     from '../../components/hackathon/ContactSection';

import { Loader2, AlertCircle, ArrowLeft, ChevronRight, Home } from 'lucide-react';

const TABS = [
  { id: 'overview',  label: 'Overview'  },
  { id: 'tracks',    label: 'Tracks'    },
  { id: 'timeline',  label: 'Timeline'  },
  { id: 'prizes',    label: 'Prizes'    },
  { id: 'benefits',  label: 'Benefits'  },
  { id: 'rules',     label: 'Rules'     },
  { id: 'contact',   label: 'Contact'   },
];

export default function HackathonPublicPage() {
  const { slug }    = useParams();
  const navigate    = useNavigate();
  const [hackathon, setHackathon] = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    window.scrollTo(0, 0);
    getHackathonBySlug(slug)
      .then(r  => setHackathon(r.data.data))
      .catch(e => setError(e.response?.data?.message || 'Hackathon not found'))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <div className="min-h-screen bg-light-gray">
      <StudentNavbar />
      <div className="flex-1 flex flex-col items-center justify-center gap-4 py-40">
        <Loader2 className="w-10 h-10 text-royal animate-spin" />
        <p className="text-gray-500 font-medium">Loading hackathon…</p>
      </div>
    </div>
  );

  if (error || !hackathon) return (
    <div className="min-h-screen bg-light-gray">
      <StudentNavbar />
      <div className="flex flex-col items-center justify-center gap-5 text-center py-40 px-4">
        <AlertCircle className="w-14 h-14 text-red-300" />
        <div>
          <h2 className="text-2xl font-extrabold text-dark mb-2">Hackathon Not Found</h2>
          <p className="text-gray-500 text-sm mb-6">{error}</p>
          <button onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-6 py-3 bg-royal text-white rounded-xl text-sm font-semibold hover:bg-royal-light transition-all">
            <ArrowLeft className="w-4 h-4" /> Go Back
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f4f6fb]">
      <StudentNavbar />

      <div className="pt-16">
        {/* Hero */}
        <HeroSection hackathon={hackathon} />

        {/* Breadcrumb */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-[1180px] mx-auto px-4 sm:px-6 py-2.5 flex items-center gap-1.5 text-xs text-gray-500">
            <button onClick={() => navigate('/student/dashboard')}
              className="flex items-center gap-1 hover:text-royal transition-colors">
              <Home className="w-3.5 h-3.5" /> Dashboard
            </button>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-800 font-medium truncate max-w-[200px]">{hackathon.title}</span>
          </div>
        </div>

        {/* Main two-column layout */}
        <div className="max-w-[1180px] mx-auto px-4 sm:px-6 py-7">
          <div className="flex flex-col lg:flex-row gap-7">

            {/* Left — tabbed content */}
            <div className="flex-1 min-w-0">
              {/* Tab bar */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm mb-5
                              flex gap-1 p-1.5 overflow-x-auto">
                {TABS.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 text-sm font-semibold rounded-lg whitespace-nowrap transition-all
                      ${activeTab === tab.id
                        ? 'bg-royal text-white shadow-sm'
                        : 'text-gray-500 hover:text-royal hover:bg-blue-50'}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div key={activeTab}>
                {activeTab === 'overview'  && <OverviewSection  description={hackathon.description} />}
                {activeTab === 'tracks'    && <TracksSection    tracks={hackathon.tracks} />}
                {activeTab === 'timeline'  && <TimelineSection  timeline={hackathon.timeline} />}
                {activeTab === 'prizes'    && <PrizesSection    prizes={hackathon.prizes} />}
                {activeTab === 'benefits'  && <BenefitsSection  benefits={hackathon.benefits} />}
                {activeTab === 'rules'     && <RulesSection     rules={hackathon.rules} />}
                {activeTab === 'contact'   && (
                  <ContactSection contactEmail={hackathon.contactEmail} contactPhone={hackathon.contactPhone} />
                )}
              </div>
            </div>

            {/* Right — info sidebar */}
            <div className="w-full lg:w-80 xl:w-[320px] flex-shrink-0">
              <EventInfoCard hackathon={hackathon} />
            </div>
          </div>
        </div>

        {/* CTA strip */}
        <div className="bg-gradient-to-r from-royal to-purple-700">
          <div className="max-w-[1180px] mx-auto px-4 sm:px-6 py-14 text-center">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
              Ready to build something amazing?
            </h2>
            <p className="text-blue-200 text-sm mb-7">
              Join thousands of innovators — register your team before the deadline!
            </p>
            <Link
              to={`/hackathon/${slug}/register`}
              className="inline-flex items-center gap-2 px-9 py-3.5 bg-white text-royal
                         font-bold text-base rounded-xl hover:bg-blue-50 transition-all shadow-lg"
            >
              Register Now →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
