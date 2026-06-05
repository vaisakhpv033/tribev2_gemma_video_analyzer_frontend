"use client";

import { useRef } from "react";
import { PlaySquare, Lightbulb, CheckCircle2, XCircle, RotateCcw } from "lucide-react";
import { RadialGauge } from "./RadialGauge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BrainAnalysisPanel } from "./BrainAnalysisPanel";

function parseTimestampToSeconds(timeStr: string) {
  if (!timeStr) return 0;
  let str = timeStr.toString().trim();
  if (str.includes('-')) {
    str = str.split('-')[0].trim();
  }
  const cleanMatch = str.match(/[\d:]+/);
  if (!cleanMatch) return 0;
  str = cleanMatch[0];

  const parts = str.split(':').map(Number);
  let seconds = 0;
  if (parts.length === 3) seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
  else if (parts.length === 2) seconds = parts[0] * 60 + parts[1];
  else if (parts.length === 1) seconds = parts[0];
  
  console.log(`Parsed timestamp "${timeStr}" to ${seconds} seconds`);
  return seconds;
}

export function AnalysisDashboard({ data, onReanalyze, onRefresh }: { data: any, onReanalyze: (id: string) => void, onRefresh: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const reports = data.raw_analysis || {};
  const timeline = reports.timeline || [];
  const trope = reports.trope_analysis || {};
  const hook = reports.hook || {};
  const audit = reports.audit || {};
  const score = reports.creative_score || data.creative_score || 0;
  const hookScore = hook.scroll_stopper_rating || data.hook_rating || 0;

  const handleTimelineClick = (timestamp: string) => {
    const seconds = parseTimestampToSeconds(timestamp);
    const video = videoRef.current;
    
    if (video) {
      console.log(`Seeking video to ${seconds} seconds...`);
      
      const playVideo = () => {
        video.currentTime = seconds;
        video.play().catch(error => {
          console.warn("Autoplay prevented, trying muted playback:", error);
          video.muted = true;
          video.play().catch(e => console.error("Video play failed completely:", e));
        });
      };

      // If video metadata isn't loaded yet, wait for it
      if (video.readyState >= 1) { // HAVE_METADATA or better
        playVideo();
      } else {
        video.addEventListener('loadedmetadata', playVideo, { once: true });
        video.load(); // Force load if it hasn't started
      }
    } else {
      console.error("Video ref is null");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[35%_65%] gap-6 animate-fade-in h-full px-4 mb-4">
      {/* Left Column: Player & Timeline */}
      <ScrollArea className="h-[85vh]">

      <div className="flex flex-col gap-4">
        <div className="bg-glass-bg border border-glass-border rounded-2xl p-2 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] relative">
          <video
            key={data.video_url}
            ref={videoRef}
            src={data.video_url}
            controls
            preload="auto"
            className="w-full rounded-xl bg-black block aspect-[9/16] max-h-[400px] object-contain mx-auto"
          />
          <div className="flex justify-between items-center mt-4 px-2">
            <div className="font-semibold text-lg truncate max-w-[200px]" title={data.original_name}>
              {data.original_name}
            </div>
            <button
              onClick={() => onReanalyze(data.id)}
              className="flex items-center gap-2 text-text-secondary border border-glass-border px-3 py-1.5 rounded-lg text-sm hover:border-accent-rose hover:text-accent-rose hover:bg-accent-rose/5 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              Re-run Analysis
            </button>
          </div>
        </div>

        <div className="bg-glass-bg border border-glass-border rounded-2xl p-6 flex-1">
          <h3 className="text-lg font-semibold mb-4 text-text-secondary">Chronological Video Timeline</h3>
          <div className="text-xs text-text-muted mb-4 flex gap-1 items-center">
            <Lightbulb className="w-4 h-4 text-accent-amber" />
            Click on any timeline card below to jump to that moment in the video.
          </div>

          <ScrollArea className="h-[450px] pr-4">
            <div className="flex flex-col gap-3">
              {timeline.map((seg: any, idx: number) => (
                <div
                  key={idx}
                  onClick={() => handleTimelineClick(seg.timestamp_start)}
                  className="bg-white/5 border border-glass-border rounded-xl p-4 cursor-pointer hover:bg-white/10 hover:border-brand-primary hover:-translate-y-0.5 transition-all focus:border-brand-primary"
                >
                  <div className="flex justify-between mb-2">
                    <span className="text-brand-primary font-bold text-sm bg-brand-primary/10 px-2 py-0.5 rounded">
                      ⏱ {seg.timestamp_start} - {seg.timestamp_end}
                    </span>
                    <span className="text-xs text-text-secondary bg-white/5 px-2 py-0.5 rounded font-medium">
                      {seg.pacing_and_emotion}
                    </span>
                  </div>
                  <div className="text-sm leading-relaxed mb-2">
                    <strong className="text-text-primary">Visuals:</strong> <span className="text-text-secondary">{seg.visuals}</span>
                  </div>
                  <div className="text-xs text-text-secondary flex gap-2 items-start border-t border-white/5 pt-2">
                    <PlaySquare className="w-4 h-4 shrink-0 text-text-muted mt-0.5" />
                    <div><strong className="text-text-primary">Audio:</strong> {seg.audio}</div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
      </ScrollArea>

      {/* Right Column: Reports */}
      <ScrollArea className="h-[85vh]">
        <div className="flex flex-col gap-8 pr-2 pb-12">
          
          <BrainAnalysisPanel data={data} onUpdate={onRefresh} />

          {/* Scores */}
          <div className="grid grid-cols-2 gap-6">
            <RadialGauge
              value={score}
              maxVal={10}
              title="Gemma4 Creative Score"
              desc="Estimated conversion power (1.0 - 10.0)"
              type="score"
            />
            <RadialGauge
              value={hookScore}
              maxVal={10}
              isInt={true}
              title="Hook Stopper Rating"
              desc="First 3s retention potential (1 - 10)"
              type="hook"
            />
          </div>

          {/* Trope Analysis */}
          <div className="bg-glass-bg border border-glass-border rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span>🎯</span> Game Ad Trope Profile
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/5 rounded-xl p-4">
                <div className="text-xs text-text-muted mb-1 uppercase tracking-wider">Ad Format Type</div>
                <div className="font-semibold text-[0.95rem]">{trope.ad_format_type || 'N/A'}</div>
              </div>
              <div className="bg-white/5 border border-white/5 rounded-xl p-4">
                <div className="text-xs text-text-muted mb-1 uppercase tracking-wider">Gameplay Mechanics</div>
                <div className="font-semibold text-[0.95rem]">{trope.gameplay_type_shown || 'N/A'}</div>
              </div>
              <div className="bg-white/5 border border-white/5 rounded-xl p-4">
                <div className="text-xs text-text-muted mb-1 uppercase tracking-wider">Has Story Sequence?</div>
                <div className="font-semibold text-[0.95rem]">{trope.has_story_narrative ? 'Yes' : 'No'}</div>
              </div>
              <div className="bg-white/5 border border-white/5 rounded-xl p-4">
                <div className="text-xs text-text-muted mb-1 uppercase tracking-wider">Fail Ad Format?</div>
                <div className="font-semibold text-[0.95rem]">{trope.is_fail_ad ? 'Yes' : 'No'}</div>
              </div>
              {trope.story_summary && (
                <div className="col-span-2 bg-white/5 border border-white/5 rounded-xl p-4">
                  <div className="text-xs text-text-muted mb-1 uppercase tracking-wider">Narrative Plot Summary</div>
                  <div className="font-normal leading-relaxed text-[0.95rem] text-text-secondary">{trope.story_summary}</div>
                </div>
              )}
            </div>
          </div>

          {/* Hook Breakdown */}
          <div className="bg-glass-bg border border-glass-border rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-4 flex justify-between items-center">
              <span>🪝 Visual Hook Audit</span>
              <span className="text-xs bg-accent-purple/15 text-accent-purple px-2 py-1 rounded">
                {hook.hook_type || 'N/A'}
              </span>
            </h3>
            <div className="text-sm leading-relaxed mb-4 text-text-secondary">
              {hook.analysis || 'No Hook Analysis provided.'}
            </div>
            {hook.suggestions && (
              <div className="bg-accent-purple/5 border border-accent-purple/20 rounded-xl p-4">
                <div className="text-xs font-bold text-accent-purple mb-1 uppercase">Optimized Hook Suggestion</div>
                <div className="text-sm leading-relaxed text-text-secondary">{hook.suggestions}</div>
              </div>
            )}
          </div>

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-glass-bg border border-glass-border rounded-2xl p-6 bg-accent-emerald/5 border-accent-emerald/15">
              <h3 className="text-lg font-semibold mb-5 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-accent-emerald" /> What Went Well
              </h3>
              <div className="flex flex-col gap-3">
                {audit.what_went_well?.length ? audit.what_went_well.map((text: string, i: number) => (
                  <div key={i} className="text-sm leading-relaxed p-3 rounded-lg flex gap-3 items-start bg-accent-emerald/10 border border-accent-emerald/20">
                    <CheckCircle2 className="w-4 h-4 text-accent-emerald shrink-0 mt-0.5" />
                    <span className="text-text-secondary">{text}</span>
                  </div>
                )) : (
                  <div className="text-text-muted text-sm">No strengths listed.</div>
                )}
              </div>
            </div>

            <div className="bg-glass-bg border border-glass-border rounded-2xl p-6 bg-accent-rose/5 border-accent-rose/15">
              <h3 className="text-lg font-semibold mb-5 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-accent-rose" /> What Went Wrong
              </h3>
              <div className="flex flex-col gap-3">
                {audit.what_went_wrong?.length ? audit.what_went_wrong.map((text: string, i: number) => (
                  <div key={i} className="text-sm leading-relaxed p-3 rounded-lg flex gap-3 items-start bg-accent-rose/10 border border-accent-rose/20">
                    <XCircle className="w-4 h-4 text-accent-rose shrink-0 mt-0.5" />
                    <span className="text-text-secondary">{text}</span>
                  </div>
                )) : (
                  <div className="text-text-muted text-sm">No friction points listed.</div>
                )}
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-glass-bg border border-glass-border rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-4">🚀 Actionable UA Creative Optimization</h3>
            <div className="flex flex-col gap-3">
              {audit.actionable_feedback?.length ? audit.actionable_feedback.map((text: string, i: number) => (
                <div key={i} className="bg-white/5 border border-white/5 rounded-xl p-4 flex gap-4 items-start">
                  <div className="bg-accent-blue text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                    {i + 1}
                  </div>
                  <div className="text-sm leading-relaxed text-text-secondary">{text}</div>
                </div>
              )) : (
                <div className="text-text-muted text-sm">No recommendations generated.</div>
              )}
            </div>
          </div>

        </div>
      </ScrollArea>
    </div>
  );
}
