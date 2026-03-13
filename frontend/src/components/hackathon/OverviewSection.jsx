export default function OverviewSection({ description }) {
  return (
    <div>
      <h2 className="section-head">About this Hackathon</h2>
      <p className="section-sub">Read the full details before registering</p>
      <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap
                      bg-white rounded-xl border border-gray-100 shadow-card p-6">
        {description || 'No description provided.'}
      </div>
    </div>
  );
}
