"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Loader2, AlertCircle, Trash2 } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { RankingDetailView } from "@/components/ranking/RankingDetailView";
import { API_BASE_URL } from "@/config/api";

export default function RankingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params?.id as string;

  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!sessionId) return;

    const fetchSession = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/rankings/${sessionId}/`);
        if (!res.ok) {
          if (res.status === 404) throw new Error("Ranking session not found.");
          throw new Error("Failed to load ranking session.");
        }
        const data = await res.json();
        setSession(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSession();

    // Poll if processing
    let intervalId: NodeJS.Timeout;
    if (session && (session.status === "PENDING" || session.status === "PROCESSING")) {
      intervalId = setInterval(fetchSession, 3000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [sessionId, session?.status]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this ranking session? This cannot be undone.")) return;
    
    setIsDeleting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/rankings/${sessionId}/`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete session.");
      router.push("/ranking");
    } catch (err: any) {
      alert(err.message);
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-darker text-text-primary flex flex-col font-sans">
      <Header />
      
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-6">
          
          <div className="flex items-center justify-between">
            <Link 
              href="/ranking"
              className="flex items-center gap-2 text-text-muted hover:text-white transition-colors text-sm font-medium w-fit"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Rankings
            </Link>
            
            {session && (
              <button 
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center gap-2 text-accent-rose hover:bg-accent-rose/10 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Delete Session
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-accent-blue mb-4" />
              <p className="text-text-muted">Loading ranking results...</p>
            </div>
          ) : error ? (
            <div className="p-6 bg-accent-rose/10 border border-accent-rose/20 rounded-xl text-accent-rose flex flex-col items-center justify-center text-center py-20">
              <AlertCircle className="w-12 h-12 mb-4 opacity-80" />
              <h2 className="text-xl font-bold mb-2">Error Loading Session</h2>
              <p>{error}</p>
            </div>
          ) : session ? (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">{session.name || "Untitled Session"}</h1>
                <div className="flex items-center gap-4 text-sm text-text-muted">
                  <span className="capitalize border border-white/10 px-2 py-0.5 rounded-md bg-white/5">{session.preset.replace('_', ' ')} Profile</span>
                  <span>{session.videos?.length || 0} Videos Compared</span>
                  <span>Normalization: <span className="capitalize">{session.normalization}</span></span>
                </div>
              </div>

              {session.status === "FAILED" ? (
                <div className="p-6 bg-accent-rose/10 border border-accent-rose/20 rounded-xl text-accent-rose flex gap-3 items-start">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold">Ranking Process Failed</h3>
                    <p className="mt-1 text-sm opacity-90">{session.error_message}</p>
                  </div>
                </div>
              ) : session.status !== "COMPLETED" ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white/5 border border-white/10 rounded-xl">
                  <Loader2 className="w-8 h-8 animate-spin text-accent-blue mb-4" />
                  <p className="text-white font-medium">Session is currently processing...</p>
                  <p className="text-text-muted text-sm mt-1">This page will automatically update once ranking is complete.</p>
                </div>
              ) : (
                <RankingDetailView session={session} />
              )}
            </div>
          ) : null}

        </div>
      </main>
    </div>
  );
}
