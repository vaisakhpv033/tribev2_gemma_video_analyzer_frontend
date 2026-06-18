"use client";

import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, CheckCircle2, XCircle, MessageSquare, Target, Brain } from "lucide-react";
import { NeuralMetricsSection } from "./NeuralMetricsSection";

export function CompareDashboard({ data }: { data: any }) {
  if (!data || !data.raw_analysis) return null;

  const analysis = data.raw_analysis;
  const { video1_analysis, video2_analysis, hook_comparison, messaging_comparison, audit } = analysis;

  const winner = audit?.winner || data.winner || "tie";

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* Side-by-side Videos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="relative rounded-2xl overflow-hidden bg-black/40 border border-glass-border aspect-[9/16] lg:aspect-video flex flex-col shadow-xl">
          <div className="absolute top-0 w-full p-4 bg-gradient-to-b from-black/80 to-transparent z-10 flex justify-between items-start">
            <span className="text-white/80 font-medium text-sm truncate max-w-[70%]">{data.video1_name}</span>
            {winner === "video1" && (
              <div className="bg-brand-primary text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1.5 animate-in zoom-in">
                <Trophy className="w-3.5 h-3.5" /> Winner
              </div>
            )}
            {winner === "tie" && (
              <div className="bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5" /> Tie
              </div>
            )}
          </div>
          <video src={data.video1_file} controls className="w-full h-full object-contain" />
        </div>

        <div className="relative rounded-2xl overflow-hidden bg-black/40 border border-glass-border aspect-[9/16] lg:aspect-video flex flex-col shadow-xl">
          <div className="absolute top-0 w-full p-4 bg-gradient-to-b from-black/80 to-transparent z-10 flex justify-between items-start">
            <span className="text-white/80 font-medium text-sm truncate max-w-[70%]">{data.video2_name}</span>
            {winner === "video2" && (
              <div className="bg-brand-primary text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1.5 animate-in zoom-in">
                <Trophy className="w-3.5 h-3.5" /> Winner
              </div>
            )}
            {winner === "tie" && (
              <div className="bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5" /> Tie
              </div>
            )}
          </div>
          <video src={data.video2_file} controls className="w-full h-full object-contain" />
        </div>
      </div>

      {/* Side-by-side Strengths / Weaknesses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-bg-darker border-white/5 p-6">
          <h2 className="text-xl font-semibold mb-4 text-brand-primary">Video 1 Analysis</h2>
          <div className="space-y-6">
            <div>
              <h3 className="flex items-center gap-2 text-accent-emerald font-medium mb-3">
                <CheckCircle2 className="w-5 h-5" /> What Went Well
              </h3>
              <ul className="space-y-2">
                {video1_analysis?.what_went_well?.map((item: string, i: number) => (
                  <li key={i} className="text-sm text-text-secondary flex items-start gap-2">
                    <span className="text-accent-emerald mt-0.5">•</span> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="flex items-center gap-2 text-accent-rose font-medium mb-3">
                <XCircle className="w-5 h-5" /> What Went Wrong
              </h3>
              <ul className="space-y-2">
                {video1_analysis?.what_went_wrong?.map((item: string, i: number) => (
                  <li key={i} className="text-sm text-text-secondary flex items-start gap-2">
                    <span className="text-accent-rose mt-0.5">•</span> {item}
                  </li>
                ))}
              </ul>
            </div>
            
            {video1_analysis?.gameplay_and_narrative_clarity && (
              <div>
                <h3 className="flex items-center gap-2 text-white font-medium mb-3 text-sm uppercase tracking-wider">
                  <Target className="w-4 h-4 text-brand-primary" /> Gameplay & Narrative Clarity
                </h3>
                <p className="text-sm text-text-secondary bg-white/5 p-3 rounded-lg border border-white/5">
                  {video1_analysis.gameplay_and_narrative_clarity}
                </p>
              </div>
            )}
            
            {video1_analysis?.neural_alignment && (
              <div>
                <h3 className="flex items-center gap-2 text-white font-medium mb-3 text-sm uppercase tracking-wider">
                  <Brain className="w-4 h-4 text-brand-primary" /> Neural Alignment
                </h3>
                <p className="text-sm text-text-secondary bg-brand-primary/10 p-3 rounded-lg border border-brand-primary/20">
                  {video1_analysis.neural_alignment}
                </p>
              </div>
            )}
          </div>
        </Card>

        <Card className="bg-bg-darker border-white/5 p-6">
          <h2 className="text-xl font-semibold mb-4 text-brand-primary">Video 2 Analysis</h2>
          <div className="space-y-6">
            <div>
              <h3 className="flex items-center gap-2 text-accent-emerald font-medium mb-3">
                <CheckCircle2 className="w-5 h-5" /> What Went Well
              </h3>
              <ul className="space-y-2">
                {video2_analysis?.what_went_well?.map((item: string, i: number) => (
                  <li key={i} className="text-sm text-text-secondary flex items-start gap-2">
                    <span className="text-accent-emerald mt-0.5">•</span> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="flex items-center gap-2 text-accent-rose font-medium mb-3">
                <XCircle className="w-5 h-5" /> What Went Wrong
              </h3>
              <ul className="space-y-2">
                {video2_analysis?.what_went_wrong?.map((item: string, i: number) => (
                  <li key={i} className="text-sm text-text-secondary flex items-start gap-2">
                    <span className="text-accent-rose mt-0.5">•</span> {item}
                  </li>
                ))}
              </ul>
            </div>

            {video2_analysis?.gameplay_and_narrative_clarity && (
              <div>
                <h3 className="flex items-center gap-2 text-white font-medium mb-3 text-sm uppercase tracking-wider">
                  <Target className="w-4 h-4 text-brand-primary" /> Gameplay & Narrative Clarity
                </h3>
                <p className="text-sm text-text-secondary bg-white/5 p-3 rounded-lg border border-white/5">
                  {video2_analysis.gameplay_and_narrative_clarity}
                </p>
              </div>
            )}
            
            {video2_analysis?.neural_alignment && (
              <div>
                <h3 className="flex items-center gap-2 text-white font-medium mb-3 text-sm uppercase tracking-wider">
                  <Brain className="w-4 h-4 text-brand-primary" /> Neural Alignment
                </h3>
                <p className="text-sm text-text-secondary bg-brand-primary/10 p-3 rounded-lg border border-brand-primary/20">
                  {video2_analysis.neural_alignment}
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Neural Metrics (If Available) */}
      {data.ranking_session && data.ranking_session.videos && data.ranking_session.videos.length >= 2 && (
        <NeuralMetricsSection rankingSession={data.ranking_session} />
      )}

      {/* Hook Comparison */}
      <Card className="bg-glass-bg border-glass-border p-6">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <Target className="w-6 h-6 text-brand-primary" /> Hook Comparison (First 3s)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
          <div>
            <div className="flex justify-between mb-2">
              <span className="font-medium">Video 1 Hook Rating</span>
              <span className="text-brand-primary font-bold">{hook_comparison?.video1_hook_rating}/10</span>
            </div>
            <Progress value={(hook_comparison?.video1_hook_rating || 0) * 10} className="h-2 bg-white/10" />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span className="font-medium">Video 2 Hook Rating</span>
              <span className="text-brand-primary font-bold">{hook_comparison?.video2_hook_rating}/10</span>
            </div>
            <Progress value={(hook_comparison?.video2_hook_rating || 0) * 10} className="h-2 bg-white/10" />
          </div>
        </div>
        <div className="bg-white/5 rounded-xl p-4 text-sm text-text-secondary leading-relaxed">
          <strong className="text-white block mb-1">Attention Capture Analysis:</strong>
          {hook_comparison?.attention_capture_analysis || hook_comparison?.comparison_analysis}
        </div>
      </Card>

      {/* Messaging Comparison */}
      <Card className="bg-glass-bg border-glass-border p-6">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-brand-primary" /> Messaging & CTA
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-bg-darker p-4 rounded-xl border border-white/5">
            <h4 className="text-brand-primary font-medium mb-2 text-sm uppercase tracking-wider">Video 1 Core Message</h4>
            <p className="text-sm text-text-secondary">{messaging_comparison?.video1_core_message}</p>
          </div>
          <div className="bg-bg-darker p-4 rounded-xl border border-white/5">
            <h4 className="text-brand-primary font-medium mb-2 text-sm uppercase tracking-wider">Video 2 Core Message</h4>
            <p className="text-sm text-text-secondary">{messaging_comparison?.video2_core_message}</p>
          </div>
        </div>
        <div className="bg-white/5 rounded-xl p-4 text-sm text-text-secondary leading-relaxed">
          <strong className="text-white block mb-1">Cognitive Retention Analysis:</strong>
          {messaging_comparison?.cognitive_retention_analysis || messaging_comparison?.comparison_analysis}
        </div>
      </Card>

      {/* Final Audit & Hybrid Idea */}
      <Card className="bg-[image:var(--background-image-grad-primary)] p-[1px] rounded-2xl overflow-hidden shadow-[0_8px_32px_0_rgba(170,31,254,0.2)]">
        <div className="bg-bg-darker rounded-2xl p-8 h-full">
          <h2 className="text-2xl font-bold mb-6 text-white">Final Audit & Recommendations</h2>
          
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-brand-primary mb-2">Neural-Backed Winner Justification</h3>
            <p className="text-text-secondary leading-relaxed">{audit?.neural_backed_winner_justification || audit?.why_winner_won}</p>
          </div>

          <div className="bg-brand-primary/10 border border-brand-primary/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Actionable Hybrid Idea (Video 3)</h3>
            <p className="text-brand-primary/90 leading-relaxed">{audit?.actionable_hybrid_idea}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
