"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Trophy, TrendingUp, TrendingDown, CheckCircle2, ChevronRight, Activity, AlertCircle, Settings2 } from "lucide-react";
import { RankingTimeseriesChart } from "./RankingTimeseriesChart";
import { TweakWeightsModal } from "./TweakWeightsModal";
import { ScrollArea } from "../ui/scroll-area";

interface RankingDetailViewProps {
  session: any;
  onSessionUpdated?: (session: any) => void;
}

const BUSINESS_TERMS: Record<string, string> = {
  "emotional_resonance": "Emotional Response",
  "visual_engagement": "Visual Processing Intensity",
  "attention_capture": "Overall Engagement",
  "sustained_focus": "Sustained Attention",
  "novelty_salience": "Surprise & Novelty",
  "auditory_impact": "Auditory Processing",
  "memory_encoding": "Memory Encoding",
  "narrative_language": "Narrative Clarity",
};

export function RankingDetailView({ session, onSessionUpdated }: RankingDetailViewProps) {
  const sortedVideos = [...(session.videos || [])].sort((a, b) => (a.rank || 0) - (b.rank || 0));
  const [activeVideoId, setActiveVideoId] = useState<string | null>(sortedVideos[0]?.id || null);
  const [activeFeature, setActiveFeature] = useState<string>("global");
  const [isTweakModalOpen, setIsTweakModalOpen] = useState(false);

  const activeVideo = sortedVideos.find(v => v.id === activeVideoId);

  const featureTabs = [
    { id: "global", label: "Overall Engagement" },
    { id: "emotional", label: "Emotional Response" },
    { id: "visual", label: "Visual Processing" },
    { id: "dorsattn_net", label: "Sustained Attention" },
    { id: "salventattn_net", label: "Surprise & Novelty" },
    { id: "auditory", label: "Auditory Processing" },
    { id: "memory", label: "Memory Encoding" },
    { id: "language", label: "Narrative Clarity" },
  ];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      
      {/* Left Column: Leaderboard */}
      <ScrollArea className="h-[70vh] xl:col-span-1 space-y-4">

      <div className="">
        <div className="bg-glass-bg border border-glass-border rounded-xl p-5">
          <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-accent-emerald" />
            Leaderboard
          </h2>
          
          <div className="space-y-3">
            {sortedVideos.map((video, index) => {
              const isSelected = video.id === activeVideoId;
              const isFirst = index === 0;
              
              return (
                <button
                  key={video.id}
                  onClick={() => setActiveVideoId(video.id)}
                  className={`w-full text-left flex items-center gap-4 p-3 rounded-xl transition-all border ${
                    isSelected 
                      ? "bg-accent-blue/10 border-accent-blue shadow-[0_0_10px_rgba(var(--accent-blue-rgb),0.2)]" 
                      : "bg-white/5 border-transparent hover:bg-white/10"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                    isFirst ? "bg-accent-emerald text-bg-darker" : "bg-black/40 text-text-muted"
                  }`}>
                    {video.rank || index + 1}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-text-primary truncate" title={video.filename}>
                      {video.filename}
                    </div>
                    {isFirst && <div className="text-[10px] text-accent-emerald font-semibold uppercase tracking-wider mt-0.5">Top Performer</div>}
                  </div>
                  
                  <div className="text-right shrink-0">
                    <div className="text-lg font-bold text-white">
                      {video.overall_score?.toFixed(0)}<span className="text-[10px] text-text-muted">/100</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
      </ScrollArea>

      {/* Right Column: Details & Chart */}
      <ScrollArea className="h-[70vh] xl:col-span-2 space-y-6">

      <div className="">
        
        {/* Selected Video Breakdown */}
        {activeVideo && (
          <div className="bg-glass-bg border border-glass-border rounded-xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent-blue/5 blur-[80px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2" />
            
            <div className="mb-6">
              <h3 className="text-xl font-bold text-white mb-1">{activeVideo.filename}</h3>
              <div className="flex gap-4 text-xs text-text-muted">
                <span>Rank #{activeVideo.rank}</span>
                <span>Overall Score: {activeVideo.overall_score?.toFixed(1)}/100</span>
              </div>
            </div>

            {/* Strengths & Weaknesses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="bg-accent-emerald/5 border border-accent-emerald/20 rounded-xl p-4">
                <h4 className="text-xs font-bold text-accent-emerald uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4" /> Relative Strengths
                </h4>
                {activeVideo.strengths && activeVideo.strengths.length > 0 ? (
                  <ul className="space-y-2">
                    {activeVideo.strengths.map((str: string, i: number) => {
                      const dim = str.split(' (')[0];
                      const score = str.split(' (')[1];
                      return (
                        <li key={i} className="flex items-start gap-2 text-sm text-text-primary">
                          <CheckCircle2 className="w-4 h-4 text-accent-emerald shrink-0 mt-0.5" />
                          <span><span className="font-medium">{BUSINESS_TERMS[dim] || dim}</span> <span className="text-text-muted text-xs">({score}</span></span>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="text-sm text-text-muted">No distinct outlier strengths compared to the group.</p>
                )}
              </div>

              <div className="bg-accent-rose/5 border border-accent-rose/20 rounded-xl p-4">
                <h4 className="text-xs font-bold text-accent-rose uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <TrendingDown className="w-4 h-4" /> Relative Weaknesses
                </h4>
                {activeVideo.weaknesses && activeVideo.weaknesses.length > 0 ? (
                  <ul className="space-y-2">
                    {activeVideo.weaknesses.map((wk: string, i: number) => {
                      const dim = wk.split(' (')[0];
                      const score = wk.split(' (')[1];
                      return (
                        <li key={i} className="flex items-start gap-2 text-sm text-text-primary">
                          <AlertCircle className="w-4 h-4 text-accent-rose shrink-0 mt-0.5" />
                          <span><span className="font-medium">{BUSINESS_TERMS[dim] || dim}</span> <span className="text-text-muted text-xs">({score}</span></span>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="text-sm text-text-muted">No distinct outlier weaknesses compared to the group.</p>
                )}
              </div>
            </div>

            {/* Dimension Scores Grid */}
            <div className="flex items-center justify-between mb-4 mt-6">
              <h4 className="text-sm font-semibold text-text-secondary flex items-center gap-2">
                <Activity className="w-4 h-4" /> Neurological Dimension Breakdown
              </h4>
            </div>

            {session.result_summary?.effective_weights && (
              <div className="mb-4 bg-white/5 rounded-lg p-3 border border-white/5 flex items-start justify-between gap-4">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-text-muted mb-2 font-medium flex items-center gap-2">
                    Applied Weights ({session.preset})
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(session.result_summary.effective_weights)
                      .sort(([, a], [, b]) => (b as number) - (a as number))
                      .map(([dim, weight]) => (
                        <div key={dim} className="bg-black/40 border border-white/5 px-2 py-1 rounded text-[10px] flex items-center gap-1.5">
                          <span className="text-text-muted">{BUSINESS_TERMS[dim] || dim}</span>
                          <span className="text-accent-blue font-bold">{Math.round((weight as number) * 100)}%</span>
                        </div>
                      ))}
                  </div>
                </div>
                <button
                  onClick={() => setIsTweakModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-medium text-text-secondary hover:text-white transition-colors whitespace-nowrap"
                >
                  <Settings2 className="w-3.5 h-3.5" />
                  Tweak Weights
                </button>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
              {activeVideo.dimension_scores && Object.entries(activeVideo.dimension_scores).map(([dim, score]) => (
                <div key={dim} className="bg-white/5 border border-white/5 rounded-lg p-3">
                  <div className="text-[10px] text-text-muted uppercase tracking-wider mb-1 line-clamp-1" title={BUSINESS_TERMS[dim] || dim}>
                    {BUSINESS_TERMS[dim] || dim}
                  </div>
                  <div className="text-lg font-bold text-white">
                    {(score as number).toFixed(0)}<span className="text-[10px] text-text-muted font-normal ml-0.5">/100</span>
                  </div>
                  <div className="w-full bg-black/40 h-1 mt-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${(score as number) >= 75 ? 'bg-accent-emerald' : (score as number) <= 40 ? 'bg-accent-rose' : 'bg-accent-blue'}`}
                      style={{ width: `${Math.min(score as number, 100)}%` }} 
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Timeseries Section */}
            <div>
              <div className="flex flex-wrap gap-2 mb-4">
                {featureTabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveFeature(tab.id)}
                    className={`px-3 py-1.5 text-xs rounded-lg transition-all border ${
                      activeFeature === tab.id 
                        ? "bg-accent-blue/20 border-accent-blue/50 text-accent-blue font-medium shadow-[0_0_10px_rgba(var(--accent-blue-rgb),0.2)]" 
                        : "bg-white/5 border-transparent text-text-muted hover:bg-white/10 hover:text-text-secondary"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <RankingTimeseriesChart 
                videos={sortedVideos} 
                activeVideoId={activeVideoId} 
                activeFeature={activeFeature} 
              />
            </div>

          </div>
        )}

      </div>
      </ScrollArea>

      <TweakWeightsModal 
        isOpen={isTweakModalOpen} 
        onClose={() => setIsTweakModalOpen(false)} 
        session={session} 
        onSuccess={(updatedSession) => {
          if (onSessionUpdated) onSessionUpdated(updatedSession);
        }}
      />
    </div>
  );
}
