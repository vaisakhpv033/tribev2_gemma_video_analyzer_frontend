"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Settings2 } from "lucide-react";
import { API_BASE_URL } from "@/config/api";

const TWEAK_BUSINESS_TERMS: Record<string, string> = {
    "emotional_resonance": "Emotional Response",
    "visual_engagement": "Visual Processing",
    "attention_capture": "Attention/Hook Strength",
    "sustained_focus": "Sustained Focus",
    "novelty_salience": "Surprise & Novelty",
    "auditory_impact": "Auditory Processing",
    "memory_encoding": "Memory Encoding",
    "narrative_language": "Narrative Clarity",
  };

interface TweakWeightsModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: any;
  onSuccess: (updatedSession: any) => void;
}

export function TweakWeightsModal({ isOpen, onClose, session, onSuccess }: TweakWeightsModalProps) {
  const [customWeights, setCustomWeights] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize sliders with existing weights scaled to 0-10
  useEffect(() => {
    if (isOpen && session?.result_summary?.effective_weights) {
      const initial: Record<string, number> = {};
      Object.entries(session.result_summary.effective_weights).forEach(([k, v]) => {
        initial[k] = Math.round((v as number) * 10);
      });
      
      // Ensure all 8 keys exist
      Object.keys(TWEAK_BUSINESS_TERMS).forEach(k => {
        if (initial[k] === undefined) initial[k] = 5;
      });

      setCustomWeights(initial);
      setError(null);
    }
  }, [isOpen, session]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const total = Object.values(customWeights).reduce((sum, val) => sum + val, 0);
    if (total === 0) {
      setError("At least one custom weight must be greater than 0.");
      setIsLoading(false);
      return;
    }

    const normalizedWeights: Record<string, number> = {};
    Object.entries(customWeights).forEach(([key, val]) => {
      normalizedWeights[key] = val / total;
    });

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/rankings/${session.id}/recalculate/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ custom_weights: normalizedWeights }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Failed to recalculate ranking.");
      }

      const updatedSession = await res.json();
      onSuccess(updatedSession);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-bg-darker border border-white/10 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col">
        
        <div className="flex justify-between items-center p-6 border-b border-white/5 bg-white/5">
          <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-accent-blue" />
            Tweak Dimension Weights
          </h2>
          <button onClick={onClose} className="text-text-muted hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {error && (
            <div className="mb-6 p-4 bg-accent-rose/10 border border-accent-rose/20 rounded-xl text-accent-rose text-sm">
              {error}
            </div>
          )}

          <form id="tweak-weights-form" onSubmit={handleSubmit}>
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <h3 className="text-sm font-medium text-white mb-4">Set Relative Importance (0 - 10)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                {Object.entries(customWeights).map(([key, val]) => (
                  <div key={key}>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs text-text-secondary">{TWEAK_BUSINESS_TERMS[key] || key}</label>
                      <span className="text-xs font-bold text-accent-blue">{val}/10</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      step="1"
                      value={val}
                      onChange={(e) => setCustomWeights(prev => ({ ...prev, [key]: parseInt(e.target.value) }))}
                      className="w-full accent-accent-blue"
                    />
                  </div>
                ))}
              </div>
              <p className="text-xs text-text-muted mt-4">Values are automatically normalized to exactly 100% when submitted. The leaderboard will update instantly.</p>
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-white/5 bg-white/5 flex justify-end gap-3">
          <button 
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-5 py-2.5 rounded-lg text-sm font-medium bg-transparent border border-white/10 hover:bg-white/5 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            type="submit"
            form="tweak-weights-form"
            disabled={isLoading}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-lg text-sm font-medium transition-all disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Settings2 className="w-4 h-4" />}
            {isLoading ? "Recalculating..." : "Apply & Recalculate"}
          </button>
        </div>

      </div>
    </div>
  );
}
