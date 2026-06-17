"use client";

import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/layout/Header";
import { CompareUploadScreen } from "@/components/compare/CompareUploadScreen";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { API_BASE_URL } from "@/config/api";
import Link from "next/link";
import { Plus, Clock, Trophy, PlaySquare } from "lucide-react";

export default function CompareVideosListPage() {
  const [comparisons, setComparisons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchComparisons = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/comparator/`);
      if (res.ok) {
        const data = await res.json();
        setComparisons(data);
      }
    } catch (err) {
      console.error("Error loading comparisons:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchComparisons();
  }, [fetchComparisons]);

  const handleUploadSuccess = (id: string) => {
    setIsModalOpen(false);
    // Redirect to the detail page
    window.location.href = `/compare-videos/${id}`;
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header 
        onNewAnalysis={() => setIsModalOpen(true)} 
        analyses={[]} 
        activeAnalysisId={null} 
        onSelectAnalysis={() => {}} 
      />

      <main className="flex-1 overflow-y-auto p-4 sm:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold bg-[image:var(--background-image-grad-primary)] bg-clip-text text-transparent">
              Video Comparisons
            </h1>
            
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger render={<Button className="bg-[image:var(--background-image-grad-primary)] text-white hover:-translate-y-[1px] transition-all shadow-lg border-0" />}>
                <Plus className="w-4 h-4 mr-2" /> Add New Comparison
              </DialogTrigger>
              <DialogContent className="max-w-[900px] p-8 sm:p-12 bg-bg-darker border-glass-border shadow-2xl rounded-2xl">
                <DialogTitle className="sr-only">Upload New Video Comparison</DialogTitle>
                <CompareUploadScreen onUploadSuccess={handleUploadSuccess} />
              </DialogContent>
            </Dialog>
          </div>

          {loading ? (
            <div className="flex justify-center mt-20">
              <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-brand-primary animate-spin"></div>
            </div>
          ) : comparisons.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-white/10 rounded-2xl">
              <PlaySquare className="w-12 h-12 text-text-muted mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No comparisons yet</h3>
              <p className="text-text-secondary mb-6">Upload two videos to see which one performs better.</p>
              <Button onClick={() => setIsModalOpen(true)} className="bg-[image:var(--background-image-grad-primary)] text-white border-0">
                Create First Comparison
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {comparisons.map((item) => (
                <Link key={item.id} href={`/compare-videos/${item.id}`}>
                  <Card className="bg-glass-bg border-glass-border hover:border-brand-primary/50 transition-colors cursor-pointer p-6 h-full flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-text-muted" />
                        <span className="text-xs text-text-muted">
                          {new Date(item.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        item.status === 'COMPLETED' ? 'bg-accent-emerald/20 text-accent-emerald' : 
                        item.status === 'FAILED' ? 'bg-accent-rose/20 text-accent-rose' : 
                        'bg-brand-primary/20 text-brand-primary'
                      }`}>
                        {item.status}
                      </span>
                    </div>

                    <div className="flex-1 space-y-3 mb-6">
                      <div className="bg-bg-darker rounded-lg p-3 border border-white/5 truncate">
                        <span className="text-xs text-brand-primary font-medium uppercase tracking-wider block mb-1">Video 1</span>
                        <span className="text-sm font-medium" title={item.video1_name}>{item.video1_name}</span>
                      </div>
                      <div className="bg-bg-darker rounded-lg p-3 border border-white/5 truncate">
                        <span className="text-xs text-brand-primary font-medium uppercase tracking-wider block mb-1">Video 2</span>
                        <span className="text-sm font-medium" title={item.video2_name}>{item.video2_name}</span>
                      </div>
                    </div>

                    {item.status === 'COMPLETED' && (
                      <div className="pt-4 border-t border-white/5 mt-auto flex items-center justify-between">
                        <span className="text-sm text-text-secondary">Winner:</span>
                        <span className="flex items-center gap-1 text-sm font-bold text-accent-emerald uppercase">
                          <Trophy className="w-4 h-4" /> 
                          {item.winner === 'tie' ? 'Tie' : item.winner === 'video1' ? 'Video 1' : 'Video 2'}
                        </span>
                      </div>
                    )}
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
