import {
  Lightbulb, Users, BookOpen, Briefcase, Cpu, Globe, Award, Star,
  Rocket, Coffee, Shield, Zap
} from 'lucide-react';

const ICONS = [Lightbulb, Users, BookOpen, Briefcase, Cpu, Globe, Award, Star, Rocket, Coffee, Shield, Zap];

export default function BenefitsSection({ benefits }) {
  if (!benefits?.filter(Boolean).length)
    return <p className="text-gray-400 text-sm">No benefits listed.</p>;

  return (
    <div>
      <h2 className="section-head">Perks & Benefits</h2>
      <p className="section-sub">What you gain by participating</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {benefits.filter(Boolean).map((b, i) => {
          const Icon = ICONS[i % ICONS.length];
          const colors = [
            ['bg-blue-50', 'text-blue-600', 'bg-blue-100'],
            ['bg-purple-50', 'text-purple-600', 'bg-purple-100'],
            ['bg-emerald-50', 'text-emerald-600', 'bg-emerald-100'],
            ['bg-amber-50', 'text-amber-600', 'bg-amber-100'],
            ['bg-pink-50', 'text-pink-600', 'bg-pink-100'],
            ['bg-teal-50', 'text-teal-600', 'bg-teal-100'],
          ];
          const [bg, text, iconBg] = colors[i % colors.length];
          return (
            <div
              key={i}
              className={`${bg} rounded-xl p-4 flex flex-col items-center text-center gap-3
                          hover:shadow-hover transition-all duration-200 hover:-translate-y-0.5 cursor-default`}
            >
              <div className={`w-11 h-11 ${iconBg} rounded-xl flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${text}`} />
              </div>
              <p className="text-sm font-semibold text-gray-800 leading-snug">{b}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
