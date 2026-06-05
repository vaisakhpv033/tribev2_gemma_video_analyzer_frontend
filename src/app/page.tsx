"use client";

import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/layout/Header";
import { UploadScreen } from "@/components/upload/UploadScreen";
import { ProcessingScreen } from "@/components/dashboard/ProcessingScreen";
import { AnalysisDashboard } from "@/components/dashboard/AnalysisDashboard";
import { XCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [activeAnalysisId, setActiveAnalysisId] = useState<string | null>(null);
  const [activeItem, setActiveItem] = useState<any>(null);

  const selectAnalysis = useCallback(async (id: string) => {
    setActiveAnalysisId(id);
    if (typeof window !== "undefined") {
      localStorage.setItem("activeAnalysisId", id);
    }
    try {
      const res = await fetch(`http://localhost:8000/api/v1/analyses/${id}/`);
      const item = await res.json();
      setActiveItem(item);
    } catch (err) {
      console.error("Error loading item:", err);
    }
  }, []);

  const loadHistory = useCallback(async (selectIdAfterLoad: string | null = null) => {
    try {
      const res = await fetch("http://localhost:8000/api/v1/analyses/");
      const data = await res.json();
      
      const parsedAnalyses = Array.isArray(data.results)
        ? data.results
        : Array.isArray(data)
        ? data
        : [];
        
      setAnalyses(parsedAnalyses);

      let targetId = selectIdAfterLoad;
      if (!targetId && typeof window !== "undefined") {
        targetId = localStorage.getItem("activeAnalysisId");
      }

      if (targetId && parsedAnalyses.some((a: any) => a.id === targetId)) {
        selectAnalysis(targetId);
      } else if (parsedAnalyses.length > 0 && !activeAnalysisId) {
        selectAnalysis(parsedAnalyses[0].id);
      }
    } catch (err) {
      console.error("Error loading history:", err);
    }
  }, [activeAnalysisId, selectAnalysis]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNewAnalysis = () => {
    setActiveAnalysisId(null);
    setActiveItem(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("activeAnalysisId");
    }
  };


  const handleUploadSuccess = (id: string) => {
    loadHistory(id);
  };

  const handleProcessingComplete = (item: any) => {
    loadHistory(item.id);
  };

  const handleReanalyze = async (id: string) => {
    if (!confirm('Are you sure you want to re-run the creative analysis for this video?')) return;
    
    try {
      const res = await fetch(`http://localhost:8000/api/v1/analyses/${id}/reanalyze/`, {
        method: 'POST'
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to trigger reanalysis');
      }
      loadHistory(id);
    } catch (err: any) {
      alert('Reanalysis trigger failed: ' + err.message);
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header 
        onNewAnalysis={handleNewAnalysis} 
        analyses={analyses} 
        activeAnalysisId={activeAnalysisId} 
        onSelectAnalysis={selectAnalysis} 
      />

      <main className="flex-1 overflow-y-auto p-4 sm:p-8">
        {!activeItem && (
          <UploadScreen onUploadSuccess={handleUploadSuccess} />
        )}

        {activeItem && (activeItem.status === "PENDING" || activeItem.status === "PROCESSING") && (
          <ProcessingScreen analysisId={activeItem.id} onComplete={handleProcessingComplete} />
        )}

        {activeItem && activeItem.status === "FAILED" && (
          <div className="max-w-[600px] mx-auto my-16 text-center animate-fade-in">
            <XCircle className="w-16 h-16 text-accent-rose mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-2 text-accent-rose">Creative Analysis Failed</h2>
            <p className="text-text-secondary mb-8">An error occurred while running the LLM analysis models.</p>
            
            <div className="bg-accent-rose/10 border border-accent-rose/30 rounded-xl p-6 text-left mb-8">
              <div className="text-accent-rose font-bold mb-2">Error Trace</div>
              <div className="text-sm">{activeItem.error_message || "Unknown server error."}</div>
            </div>

            <div className="flex justify-center gap-4">
              <Button variant="outline" onClick={handleNewAnalysis} className="bg-glass-bg border-glass-border">
                Back to Upload
              </Button>
              <Button onClick={() => handleReanalyze(activeItem.id)} className="bg-accent-rose hover:bg-accent-rose/80 text-white">
                Retry Analysis
              </Button>
            </div>
          </div>
        )}

        {activeItem && activeItem.status === "COMPLETED" && (
          <AnalysisDashboard 
            data={activeItem} 
            onReanalyze={handleReanalyze} 
            onRefresh={() => selectAnalysis(activeItem.id)}
          />
        )}
      </main>
    </div>
  );
}
