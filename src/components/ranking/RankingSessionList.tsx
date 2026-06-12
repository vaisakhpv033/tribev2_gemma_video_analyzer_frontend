"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Loader2, AlertCircle, ChevronRight, Trophy } from "lucide-react";
import { API_BASE_URL } from "@/config/api";

interface Session {
  id: string;
  name: string;
  preset: string;
  normalization: string;
  status: string;
  video_count: number;
  top_video: { filename: string; overall_score: number } | null;
  created_at: string;
  completed_at: string | null;
}

export function RankingSessionList() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/rankings/`);
      if (!res.ok) throw new Error("Failed to fetch ranking sessions");
      const data = await res.json();
      setSessions(Array.isArray(data) ? data : (data.results || []));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
    
    // Poll if any session is processing
    const hasProcessing = sessions.some(s => s.status === "PENDING" || s.status === "PROCESSING");
    if (hasProcessing) {
      const interval = setInterval(fetchSessions, 3000);
      return () => clearInterval(interval);
    }
  }, [sessions]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-accent-blue" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-accent-rose/10 border border-accent-rose/20 rounded-xl text-accent-rose flex gap-2">
        <AlertCircle className="w-5 h-5 shrink-0" />
        <p>{error}</p>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center p-12 bg-white/5 border border-white/10 rounded-xl">
        <Trophy className="w-12 h-12 text-white/20 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-text-primary">No ranking sessions yet</h3>
        <p className="text-text-muted mt-1 text-sm">Upload multiple .npz files to compare ad performance.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {sessions.map(session => (
        <Link 
          key={session.id} 
          href={`/ranking/${session.id}`}
          className="group block bg-glass-bg border border-glass-border hover:border-accent-blue/50 rounded-xl p-5 transition-all"
        >
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-lg font-semibold text-text-primary group-hover:text-accent-blue transition-colors">
                  {session.name || "Untitled Session"}
                </h3>
                <span className={`text-xs px-2 py-0.5 rounded uppercase font-medium ${
                  session.status === "COMPLETED" ? "bg-accent-emerald/10 text-accent-emerald" :
                  session.status === "FAILED" ? "bg-accent-rose/10 text-accent-rose" :
                  "bg-accent-amber/10 text-accent-amber animate-pulse"
                }`}>
                  {session.status}
                </span>
              </div>
              
              <div className="flex items-center gap-4 text-xs text-text-muted">
                <span>{session.video_count} videos</span>
                <span>•</span>
                <span className="capitalize">{session.preset.replace('_', ' ')} Profile</span>
                <span>•</span>
                <span>{formatDistanceToNow(new Date(session.created_at), { addSuffix: true })}</span>
              </div>
            </div>

            {session.status === "COMPLETED" && session.top_video && (
              <div className="bg-black/20 rounded-lg p-3 md:w-64 shrink-0 flex items-center justify-between border border-white/5">
                <div className="overflow-hidden">
                  <div className="text-[10px] text-text-muted uppercase font-bold tracking-wider mb-0.5 flex items-center gap-1.5">
                    <Trophy className="w-3 h-3 text-accent-emerald" />
                    Top Ranked Video
                  </div>
                  <div className="text-sm font-medium truncate" title={session.top_video.filename}>
                    {session.top_video.filename}
                  </div>
                </div>
                <div className="text-lg font-bold text-accent-emerald ml-3">
                  {session.top_video.overall_score.toFixed(0)}<span className="text-[10px] text-text-muted ml-0.5">/100</span>
                </div>
              </div>
            )}

            <div className="hidden md:block shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronRight className="w-5 h-5 text-accent-blue" />
            </div>

          </div>
        </Link>
      ))}
    </div>
  );
}
