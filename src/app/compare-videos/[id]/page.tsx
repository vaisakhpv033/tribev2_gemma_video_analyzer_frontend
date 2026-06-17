"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { CompareProcessingScreen } from "@/components/compare/CompareProcessingScreen";
import { CompareDashboard } from "@/components/compare/CompareDashboard";
import { XCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/config/api";
import Link from "next/link";

export default function CompareVideoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [activeItem, setActiveItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalysis = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/comparator/${id}/`);
      if (res.ok) {
        const item = await res.json();
        setActiveItem(item);
      }
    } catch (err) {
      console.error("Error loading comparison item:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAnalysis();
  }, [fetchAnalysis]);

  const handleProcessingComplete = (item: any) => {
    setActiveItem(item);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header 
        onNewAnalysis={() => router.push("/compare-videos")} 
        analyses={[]} 
        activeAnalysisId={null} 
        onSelectAnalysis={() => {}} 
      />

      <main className="flex-1 overflow-y-auto p-4 sm:p-8">
        <div className="max-w-7xl mx-auto mb-6">
          <Link href="/compare-videos">
            <Button variant="ghost" className="text-text-secondary hover:text-white pl-0 flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Back to Comparisons
            </Button>
          </Link>
        </div>

        {loading && (
          <div className="flex justify-center mt-20">
            <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-brand-primary animate-spin"></div>
          </div>
        )}

        {!loading && activeItem && (activeItem.status === "PENDING" || activeItem.status === "PROCESSING") && (
          <CompareProcessingScreen comparisonId={activeItem.id} onComplete={handleProcessingComplete} />
        )}

        {!loading && activeItem && activeItem.status === "FAILED" && (
          <div className="max-w-[600px] mx-auto my-16 text-center animate-fade-in">
            <XCircle className="w-16 h-16 text-accent-rose mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-2 text-accent-rose">Comparison Failed</h2>
            <p className="text-text-secondary mb-8">An error occurred while running the Gemma 4 visual comparison.</p>
            
            <div className="bg-accent-rose/10 border border-accent-rose/30 rounded-xl p-6 text-left mb-8">
              <div className="text-accent-rose font-bold mb-2">Error Trace</div>
              <div className="text-sm">{activeItem.error_message || "Unknown server error."}</div>
            </div>

            <div className="flex justify-center gap-4">
              <Link href="/compare-videos">
                <Button variant="outline" className="bg-glass-bg border-glass-border">
                  Back to List
                </Button>
              </Link>
            </div>
          </div>
        )}

        {!loading && activeItem && activeItem.status === "COMPLETED" && (
          <CompareDashboard data={activeItem} />
        )}
      </main>
    </div>
  );
}
