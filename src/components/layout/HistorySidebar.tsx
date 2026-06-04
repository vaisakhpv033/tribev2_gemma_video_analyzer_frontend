"use client";

function formatDate(isoStr: string) {
  if (!isoStr) return "";
  const d = new Date(isoStr);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + ' ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

export function HistorySidebar({ analyses, activeAnalysisId, onSelectAnalysis }: any) {
  const safeAnalyses = Array.isArray(analyses) ? analyses : [];

  if (safeAnalyses.length === 0) {
    return (
      <div className="text-center p-8 text-text-muted text-sm">
        No analysis history yet.
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
      {safeAnalyses.map((item: any) => {
        const isActive = activeAnalysisId === item.id;
        return (
          <div
            key={item.id}
            onClick={() => onSelectAnalysis(item.id)}
            className={`p-4 rounded-xl cursor-pointer transition-all border ${
              isActive
                ? "bg-accent-cyan/10 border-accent-cyan shadow-[0_4px_20px_rgba(6,182,212,0.05)]"
                : "bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10 hover:translate-x-1"
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="font-medium text-sm text-text-primary truncate max-w-[150px]" title={item.original_name}>
                {item.original_name}
              </div>
              {item.status === "COMPLETED" ? (
                <span className="bg-[image:var(--background-image-grad-primary)] text-white px-2 py-0.5 rounded text-xs font-bold">
                  {item.creative_score?.toFixed(1) || "0.0"}
                </span>
              ) : (
                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase border ${
                  item.status === 'PROCESSING' ? 'bg-accent-blue/15 text-accent-blue border-accent-blue/30' :
                  item.status === 'FAILED' ? 'bg-accent-rose/15 text-accent-rose border-accent-rose/30' :
                  'bg-accent-amber/15 text-accent-amber border-accent-amber/30'
                }`}>
                  {item.status}
                </span>
              )}
            </div>
            <div className="flex justify-between items-center text-xs text-text-secondary">
              <span className="capitalize">{item.mode.replace(/_/g, " ")}</span>
              <span>{formatDate(item.created_at)}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
