"use client";

import { Header } from "@/components/layout/Header";
import { RankingSessionList } from "@/components/ranking/RankingSessionList";
import { CreateRankingSession } from "@/components/ranking/CreateRankingSession";
import { useState } from "react";
import { Plus } from "lucide-react";

export default function RankingPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleSessionCreated = () => {
    setIsCreateModalOpen(false);
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-bg-darker text-text-primary flex flex-col font-sans">
      <Header />
      
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Multi-Video Neural Ranking</h1>
              <p className="text-text-muted mt-1 text-sm">
                Compare multiple creatives to find the most neurologically engaging ads.
              </p>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-lg text-sm font-medium transition-all shadow-[0_0_15px_rgba(var(--brand-primary-rgb),0.3)]"
            >
              <Plus className="w-4 h-4" />
              New Ranking Session
            </button>
          </div>

          <RankingSessionList key={refreshTrigger} />
        </div>
      </main>

      {isCreateModalOpen && (
        <CreateRankingSession 
          onClose={() => setIsCreateModalOpen(false)} 
          onCreated={handleSessionCreated} 
        />
      )}
    </div>
  );
}
