"use client";

import { useEffect, useState } from "react";
import { Loader2, CheckCircle2, CircleDashed } from "lucide-react";
import { Card } from "@/components/ui/card";

export function ProcessingScreen({ analysisId, onComplete }: { analysisId: string, onComplete: (data: any) => void }) {
  const [status, setStatus] = useState("PENDING");
  const [mode, setMode] = useState("combination");

  useEffect(() => {
    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/v1/analyses/${analysisId}/`);
        if (res.ok) {
          const item = await res.json();
          setStatus(item.status);
          if (item.mode) setMode(item.mode);

          if (item.status === 'COMPLETED' || item.status === 'FAILED') {
            clearInterval(pollInterval);
            onComplete(item);
          }
        }
      } catch (err) {
        console.error("Polling error", err);
      }
    }, 2000);

    return () => clearInterval(pollInterval);
  }, [analysisId, onComplete]);

  return (
    <div className="max-w-[600px] w-full mx-auto my-12 text-center animate-fade-in px-4">
      <div className="relative w-32 h-32 mx-auto mb-8">
        <div className="absolute inset-0 rounded-full border-4 border-white/5 border-t-brand-primary animate-spin"></div>
        <div className="absolute inset-[15px] rounded-full bg-brand-primary/5 animate-[pulse-slow_2s_infinite]"></div>
      </div>
      
      <h2 className="text-2xl font-bold mb-2 bg-[image:var(--background-image-grad-primary)] bg-clip-text text-transparent">
        Analyzing Video Creative
      </h2>
      <p className="text-text-secondary mb-8">Synthesizing mobile gaming tropes and hooks. This can take up to 60-90 seconds.</p>
      
      <Card className="bg-bg-darker border-glass-border p-6 text-left rounded-xl">
        <StepItem index={0} title="Upload original video to storage" status={status} mode={mode} />
        <StepItem index={1} title="Extract audio cues and chimes (Gemini)" activeDesc={mode === "gemini_only" ? "Querying gemini-2.5-flash for complete review..." : "Extracting audio cues and chimes (Gemini)"} status={status} mode={mode} />
        {mode !== "gemini_only" && (
          <StepItem index={2} title="Generate silent video track (FFmpeg)" status={status} mode={mode} />
        )}
        {mode !== "gemini_only" && (
          <StepItem index={3} title="Evaluate visuals & overlays (Gemma 31B)" status={status} mode={mode} />
        )}
        <StepItem index={mode === "gemini_only" ? 2 : 4} title="Compile structured score card" status={status} mode={mode} />
      </Card>
    </div>
  );
}

interface StepItemProps {
  index: number;
  title: string;
  activeDesc?: string;
  status: string;
  mode: string;
}

function StepItem({ index, title, activeDesc, status, mode }: StepItemProps) {
  const getStepStatus = (stepIndex: number) => {
    if (status === "COMPLETED" || status === "FAILED") return "completed";
    if (status === "PENDING" && stepIndex === 1) return "active";
    if (status === "PENDING" && stepIndex > 1) return "pending";

    if (status === "PROCESSING") {
      if (mode === "gemini_only") {
        if (stepIndex === 1) return "active";
        return "pending";
      } else if (mode === "31b_only_no_audio") {
        if (stepIndex <= 1) return "completed";
        if (stepIndex === 2) return "active";
        return "pending";
      } else {
        if (stepIndex <= 1) return "completed";
        if (stepIndex === 2) return "active";
        return "pending";
      }
    }
    
    return stepIndex === 0 ? "completed" : "pending";
  };

  const s = getStepStatus(index);
  const isActive = s === "active";
  const isCompleted = s === "completed";

  return (
    <div className={`flex items-center gap-4 mb-4 last:mb-0 ${isActive ? 'text-brand-primary font-medium' : isCompleted ? 'text-accent-emerald' : 'text-text-muted'}`}>
      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold shrink-0 ${isCompleted ? 'bg-accent-emerald border-accent-emerald text-bg-darker' : isActive ? 'border-brand-primary' : 'border-current'}`}>
        {isCompleted ? <CheckCircle2 className="w-4 h-4 text-bg-darker" /> : index + 1}
      </div>
      <span>{isActive && activeDesc ? activeDesc : title}</span>
      {isActive && <Loader2 className="w-4 h-4 animate-spin ml-auto" />}
    </div>
  );
}
