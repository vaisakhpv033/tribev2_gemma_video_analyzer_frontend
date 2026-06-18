"use client";

import { Card } from "@/components/ui/card";
import { Brain, Sparkles, TrendingDown } from "lucide-react";

interface NeuralMetricsProps {
  rankingSession: any;
}

export function NeuralMetricsSection({ rankingSession }: NeuralMetricsProps) {
  if (!rankingSession || !rankingSession.videos) return null;

  const v1 = rankingSession.videos.find((v: any) => v.filename === "video1");
  const v2 = rankingSession.videos.find((v: any) => v.filename === "video2");

  if (!v1 || !v2) return null;

  const renderVideoMetrics = (v: any, title: string) => {
    return (
      <Card className="bg-bg-darker border-white/5 p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-brand-primary flex items-center gap-2">
            <Brain className="w-5 h-5" /> {title} Neural Profile
          </h3>
          <div className="bg-glass-bg border border-brand-primary/20 px-4 py-1.5 rounded-full text-brand-primary font-bold shadow-md">
            Rank: #{v.rank}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
          <div className="bg-brand-primary/10 border border-brand-primary/20 rounded-lg p-3 flex flex-col justify-center">
            <div className="text-[10px] text-brand-primary uppercase tracking-wider mb-1 line-clamp-1">
              Overall Score
            </div>
            <div className="text-2xl font-bold text-white">
              {(v.overall_score || 0).toFixed(0)}<span className="text-[10px] text-brand-primary/70 font-normal ml-0.5">/100</span>
            </div>
            <div className="w-full bg-black/40 h-1 mt-2 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full bg-brand-primary"
                style={{ width: `${Math.min(v.overall_score || 0, 100)}%` }} 
              />
            </div>
          </div>
          {Object.entries(v.dimension_scores || {}).map(([dim, score]: [string, any]) => (
            <div key={dim} className="bg-white/5 border border-white/5 rounded-lg p-3">
              <div className="text-[10px] text-text-muted uppercase tracking-wider mb-1 line-clamp-1" title={dim}>
                {dim.charAt(0).toUpperCase() + dim.slice(1)}
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-brand-primary/5 border border-brand-primary/10 rounded-xl p-4">
            <h4 className="flex items-center gap-2 text-brand-primary font-semibold mb-3">
              <Sparkles className="w-4 h-4" /> Neural Strengths
            </h4>
            <ul className="space-y-2">
              {v.strengths?.map((str: string, i: number) => (
                <li key={i} className="text-sm text-text-secondary flex items-start gap-2">
                  <span className="text-brand-primary mt-0.5">•</span> {str}
                </li>
              ))}
              {(!v.strengths || v.strengths.length === 0) && (
                <li className="text-sm text-text-muted">No specific neural strengths detected.</li>
              )}
            </ul>
          </div>
          
          <div className="bg-white/5 border border-white/5 rounded-xl p-4">
            <h4 className="flex items-center gap-2 text-text-primary font-semibold mb-3">
              <TrendingDown className="w-4 h-4 text-text-muted" /> Neural Weaknesses
            </h4>
            <ul className="space-y-2">
              {v.weaknesses?.map((wk: string, i: number) => (
                <li key={i} className="text-sm text-text-secondary flex items-start gap-2">
                  <span className="text-text-muted mt-0.5">•</span> {wk}
                </li>
              ))}
              {(!v.weaknesses || v.weaknesses.length === 0) && (
                <li className="text-sm text-text-muted">No specific neural weaknesses detected.</li>
              )}
            </ul>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6 mt-8 mb-12">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-[image:var(--background-image-grad-primary)] flex items-center justify-center shadow-lg">
          <Brain className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold bg-[image:var(--background-image-grad-primary)] bg-clip-text text-transparent">
            Neural Metrics
          </h2>
          <p className="text-sm text-text-secondary">Quantitative Brain-Computer Interface Evaluation</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {renderVideoMetrics(v1, "Video 1")}
        {renderVideoMetrics(v2, "Video 2")}
      </div>
    </div>
  );
}
