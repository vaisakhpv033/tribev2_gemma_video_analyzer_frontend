"use client";

import { useState, useEffect } from "react";
import { X, Upload, Loader2, AlertCircle, FileVideo } from "lucide-react";
import { API_BASE_URL } from "@/config/api";

interface CreateRankingSessionProps {
  onClose: () => void;
  onCreated: () => void;
}

export function CreateRankingSession({ onClose, onCreated }: CreateRankingSessionProps) {
  const [name, setName] = useState("");
  const [preset, setPreset] = useState("default");
  const [normalization, setNormalization] = useState("minmax");
  const [files, setFiles] = useState<File[]>([]);
  
  const [customWeights, setCustomWeights] = useState<Record<string, number>>({
    emotional_resonance: 5,
    visual_engagement: 5,
    attention_capture: 5,
    sustained_focus: 5,
    novelty_salience: 5,
    auditory_impact: 5,
    memory_encoding: 5,
    narrative_language: 5,
  });

  const BUSINESS_TERMS: Record<string, string> = {
    "emotional_resonance": "Emotional Response",
    "visual_engagement": "Visual Processing",
    "attention_capture": "Attention/Hook Strength",
    "sustained_focus": "Sustained Focus",
    "novelty_salience": "Surprise & Novelty",
    "auditory_impact": "Auditory Processing",
    "memory_encoding": "Memory Encoding",
    "narrative_language": "Narrative Clarity",
  };

  const [uploadType, setUploadType] = useState<"npz" | "video">("npz");
  const [presets, setPresets] = useState<{id: string, name: string}[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/v1/rankings/presets/`)
      .then(res => res.json())
      .then(data => setPresets(data))
      .catch(err => console.error("Failed to load presets", err));
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files);
      
      if (uploadType === "npz") {
        const valid = selected.filter(f => f.name.endsWith('.npz'));
        if (valid.length !== selected.length) {
          setError("Only .npz files are allowed.");
        } else {
          setError(null);
          setFiles(prev => [...prev, ...valid]);
        }
      } else {
        const validExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.webm'];
        const valid = selected.filter(f => validExtensions.some(ext => f.name.toLowerCase().endsWith(ext)));
        if (valid.length !== selected.length) {
          setError(`Only video files (${validExtensions.join(', ')}) are allowed.`);
        } else {
          const validSize = valid.filter(f => f.size <= 500 * 1024 * 1024);
          if (validSize.length !== valid.length) {
            setError("Some videos exceed the 500MB size limit.");
          } else {
            setError(null);
            const newFiles = [...files, ...validSize];
            if (newFiles.length > 10) {
              setError("Maximum 10 videos allowed.");
              setFiles(newFiles.slice(0, 10));
            } else {
              setFiles(newFiles);
            }
          }
        }
      }
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length < 2) {
      setError("Please upload at least 2 .npz files to create a ranking comparison.");
      return;
    }

    if (uploadType === "video" && files.length > 10) {
      setError("Please upload a maximum of 10 videos.");
      return;
    }

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("preset", preset);
    formData.append("normalization", normalization);
    
    if (preset === "custom") {
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
      formData.append("custom_weights", JSON.stringify(normalizedWeights));
    }

    files.forEach(file => {
      formData.append(uploadType === "video" ? "video_files" : "npz_files", file);
    });

    const endpoint = uploadType === "video" 
      ? `${API_BASE_URL}/api/v1/rankings/create-from-videos/` 
      : `${API_BASE_URL}/api/v1/rankings/`;

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || errData.non_field_errors?.[0] || "Failed to create ranking session.");
      }

      onCreated();
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-bg-darker border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="flex justify-between items-center p-6 border-b border-white/5 bg-white/5">
          <h2 className="text-xl font-bold text-text-primary">New Ranking Session</h2>
          <button onClick={onClose} className="text-text-muted hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {error && (
            <div className="mb-6 p-4 bg-accent-rose/10 border border-accent-rose/20 rounded-xl text-accent-rose text-sm flex gap-2 items-start">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <form id="create-ranking-form" onSubmit={handleSubmit} className="space-y-6">
            
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Session Name</label>
              <input 
                type="text" 
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g., Q3 Fall Campaign Ad Testing"
                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-accent-blue transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Upload Source</label>
              <div className="flex bg-black/40 border border-white/10 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => {
                    setUploadType("npz");
                    setFiles([]);
                    setError(null);
                  }}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                    uploadType === "npz" ? "bg-white/10 text-white shadow-sm" : "text-text-muted hover:text-text-secondary"
                  }`}
                >
                  Pre-processed .npz Files
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUploadType("video");
                    setFiles([]);
                    setError(null);
                  }}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                    uploadType === "video" ? "bg-white/10 text-white shadow-sm" : "text-text-muted hover:text-text-secondary"
                  }`}
                >
                  Raw Video Files
                </button>
              </div>
              {uploadType === "video" && (
                <p className="text-xs text-accent-blue mt-2">
                  Video uploads will spin up GPU instances to extract brain features in the background. This process takes a few minutes per video.
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Industry Profile (Preset)</label>
                <select 
                  value={preset}
                  onChange={e => setPreset(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-accent-blue transition-colors capitalize"
                >
                  {presets.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                  {presets.length === 0 && <option value="default">Default (Balanced)</option>}
                </select>
                <p className="text-xs text-text-muted mt-2">Adjusts how heavily different brain dimensions influence the final score.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Scoring Normalization</label>
                <select 
                  value={normalization}
                  onChange={e => setNormalization(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-accent-blue transition-colors"
                >
                  <option value="minmax">Min-Max (Relative 0-100)</option>
                  <option value="zscore">Z-Score (Distribution Curve)</option>
                  <option value="percentile">Percentile Rank</option>
                </select>
                <p className="text-xs text-text-muted mt-2">How raw features are scaled across the uploaded videos.</p>
              </div>
            </div>

            {preset === "custom" && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-5 animate-in slide-in-from-top-2">
                <h3 className="text-sm font-medium text-white mb-4">Set Relative Importance (0 - 10)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  {Object.entries(customWeights).map(([key, val]) => (
                    <div key={key}>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs text-text-secondary">{BUSINESS_TERMS[key] || key}</label>
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
                <p className="text-xs text-text-muted mt-4">Values are automatically normalized to 100% when submitted.</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                {uploadType === "npz" ? "Upload .npz Files" : "Upload Video Files"}
              </label>
              <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center bg-black/20 hover:bg-black/40 hover:border-accent-blue/50 transition-colors">
                <input 
                  type="file" 
                  multiple 
                  accept={uploadType === "npz" ? ".npz" : ".mp4,.mov,.avi,.mkv,.webm"} 
                  onChange={handleFileChange}
                  className="hidden" 
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                  <Upload className="w-8 h-8 text-text-muted mb-3" />
                  <span className="text-sm font-medium text-text-primary">Click to select files or drag and drop</span>
                  <span className="text-xs text-text-muted mt-1">
                    {uploadType === "npz" 
                      ? "Requires at least 2 .npz files for comparison" 
                      : "Requires 2 to 10 video files for comparison"}
                  </span>
                </label>
              </div>
            </div>

            {files.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-text-secondary mb-3 flex justify-between">
                  Selected Files ({files.length})
                </h4>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                  {files.map((file, i) => (
                    <div key={i} className="flex items-center justify-between bg-white/5 border border-white/5 rounded-lg p-3">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <FileVideo className="w-4 h-4 text-accent-blue shrink-0" />
                        <span className="text-sm truncate">{file.name}</span>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => removeFile(i)}
                        className="text-text-muted hover:text-accent-rose p-1 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
            form="create-ranking-form"
            disabled={isLoading || files.length < 2}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-lg text-sm font-medium transition-all shadow-[0_0_15px_rgba(var(--brand-primary-rgb),0.3)] disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {isLoading ? "Analyzing & Ranking..." : "Start Ranking"}
          </button>
        </div>

      </div>
    </div>
  );
}
