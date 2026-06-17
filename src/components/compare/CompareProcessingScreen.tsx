"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { API_BASE_URL } from "@/config/api";

export function CompareProcessingScreen({ comparisonId, onComplete }: { comparisonId: string, onComplete: (item: any) => void }) {
  const [loadingText, setLoadingText] = useState("Initializing Gemma 4 Comparison...");

  useEffect(() => {
    const texts = [
      "Uploading to Gemini File Service...",
      "Extracting audio hooks via Gemini 2.5 Flash...",
      "Stripping audio locally...",
      "Running Gemma 31B synthesis...",
      "Comparing hooks and messaging...",
      "Finalizing audit..."
    ];
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % texts.length;
      setLoadingText(texts[i]);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const pollStatus = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/comparator/${comparisonId}/`);
        if (res.ok) {
          const item = await res.json();
          if (item.status === "COMPLETED" || item.status === "FAILED") {
            onComplete(item);
          }
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    };

    const intervalId = setInterval(pollStatus, 5000);
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
      <h3 className="text-xl font-semibold mt-8 mb-2">Analyzing Videos</h3>
      <p className="text-text-secondary animate-pulse">{loadingText}</p>
    </div>
  );
}
