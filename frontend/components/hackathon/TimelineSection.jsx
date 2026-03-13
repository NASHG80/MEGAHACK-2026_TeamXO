export default function TimelineSection({ timeline }) {
  if (!timeline?.length)
    return <p className="text-gray-400 text-sm">No timeline added yet.</p>;

  return (
    <div>
      <h2 className="section-head">Event Timeline</h2>
      <p className="section-sub">Key milestones and deadlines</p>

      <div className="relative pl-8">
        {/* Vertical track */}
        <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gray-200" />

        <div className="space-y-6">
          {timeline.map((item, i) => (
            <TimelineItem key={i} item={item} index={i} total={timeline.length} />
          ))}
        </div>
      </div>
    </div>
  );
}

function TimelineItem({ item, index, total }) {
  const isLast = index === total - 1;

  return (
    <div className="relative flex flex-col sm:flex-row sm:items-start gap-3 group">
      {/* Dot */}
      <div className="absolute -left-8 top-0 flex flex-col items-center" style={{ left: '-2rem' }}>
        <div className="tl-dot group-hover:bg-primary-700 transition-colors" />
      </div>

      {/* Card */}
      <div className="card flex-1 p-4 hover:shadow-hover transition-shadow">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-1">
          <h3 className="font-semibold text-gray-900 text-sm">{item.stage}</h3>
          <span className="badge bg-primary-50 text-primary-700 border border-primary-100 text-[11px]">
            📅 {item.date}
          </span>
        </div>
        {item.description && (
          <p className="text-xs text-gray-500 leading-relaxed mt-1">{item.description}</p>
        )}
      </div>
    </div>
  );
}
