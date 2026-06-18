"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { API_BASE_URL } from "@/config/api";

export function CompareProcessingScreen({ comparisonId, onComplete }: { comparisonId: string, onComplete: (item: any) => void }) {
  const [loadingText, setLoadingText] = useState("Initializing Pipeline...");
  const [sessionStatus, setSessionStatus] = useState("Analyzing Videos");

  useEffect(() => {
    const pollStatus = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/comparator/${comparisonId}/`);
        if (res.ok) {
          const item = await res.json();
          
          if (item.ranking_session) {
            const rStat = item.ranking_session.status;
            if (rStat === "PROCESSING" || rStat === "PENDING") {
              setSessionStatus("Running TRIBEv2 Neural Ranking (GPU Pods)");
              setLoadingText("Extracting cognitive & emotional brainwave metrics...");
            } else if (rStat === "COMPLETED") {
              setSessionStatus("Neural Ranking Complete");
              setLoadingText("Running Gemma 31B synthesis with Neural Context...");
            }
          }
          
          if (item.status === "COMPLETED" || item.status === "FAILED") {
            onComplete(item);
          }
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    };

    const intervalId = setInterval(pollStatus, 4000);
    pollStatus(); // initial fetch
    return () => clearInterval(intervalId);
  }, [comparisonId, onComplete]);

  return (
    <div className="flex flex-col items-center justify-center h-[60vh] animate-fade-in">
      <div className="relative">
        <div className="w-24 h-24 rounded-full border-4 border-white/5 border-t-brand-primary animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-brand-primary animate-pulse" />
        </div>
      </div>
      <h3 className="text-xl font-semibold mt-8 mb-2">{sessionStatus}</h3>
      <p className="text-text-secondary animate-pulse text-center max-w-md">{loadingText}</p>
    </div>
  );
}
