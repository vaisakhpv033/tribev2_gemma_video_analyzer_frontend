"use client";

import { useState, useRef } from "react";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function UploadScreen({ onUploadSuccess }: { onUploadSuccess: (id: string) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState("combination");
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const modeDescriptions: Record<string, string> = {
    combination: "**Combination Mode** uploads to Gemini 2.5 Flash to extract voiceover and SFX cues, strips audio with ffmpeg, and uploads silent visuals to Gemma-31B to compile a detailed, synthesized timeline.",
    gemini_only: "**Gemini Only Mode** passes the entire video (visuals and audio) directly to Gemini 2.5 Flash for a fast, single-step analysis.",
    "31b_only_no_audio": "**Gemma 31B Visual Only Mode** strips audio and processes visuals only on the Gemma-31B model. (Requires Ffmpeg on the server)."
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("video", file);
    formData.append("mode", mode);

    try {
      const res = await fetch("http://localhost:8000/api/v1/analyses/", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit analysis");
      }
      const result = await res.json();
      onUploadSuccess(result.id);
    } catch (err: any) {
      alert("Upload failed: " + err.message);
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-[800px] w-full mx-auto my-12 animate-fade-in px-4">
      <Card className="bg-glass-bg border-glass-border backdrop-blur-xl rounded-2xl p-8 sm:p-12 text-center shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
        <h2 className="text-3xl font-bold mb-2">Creative Video Analyzer</h2>
        <p className="text-text-secondary mb-10">Upload a mobile game ad video to run AI-powered creative scoring, hook audits, trope breakdowns, and synchronized timeline breakdowns.</p>
        
        <form onSubmit={handleSubmit}>
          <div 
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-12 cursor-pointer transition-all mb-8 ${isDragging || file ? 'border-accent-cyan bg-accent-cyan/5' : 'border-white/15 hover:border-accent-cyan hover:bg-accent-cyan/5'}`}
          >
            <Zap className="w-12 h-12 text-accent-cyan mx-auto mb-4 animate-[pulse-slow_2s_infinite]" />
            <h3 className="text-lg font-semibold mb-1">Select Video File</h3>
            <p className="text-text-secondary">Drag and drop your video file here, or click to browse</p>
            <p className="text-xs text-text-muted mt-2">Supports MP4, MOV, WebM (Max 50MB)</p>
            <input 
              type="file" 
              className="hidden" 
              accept="video/*" 
              ref={fileInputRef}
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>

          {file && (
            <div className="text-left bg-white/5 border border-glass-border rounded-lg p-3 px-4 mb-6">
              <div className="font-medium text-sm truncate">{file.name}</div>
              <div className="text-xs text-text-muted">{(file.size / (1024 * 1024)).toFixed(2)} MB</div>
            </div>
          )}

          <div className="text-left mb-6">
            <Label className="block font-medium text-[0.95rem] text-text-secondary mb-2">Analysis Execution Mode</Label>
            <Select value={mode} onValueChange={(val) => setMode(val || "combination")}>
              <SelectTrigger className="w-full bg-bg-darker border-glass-border h-12">
                <SelectValue placeholder="Select mode" />
              </SelectTrigger>
              <SelectContent className="bg-bg-darker border-glass-border">
                <SelectItem value="combination">Combination Mode (Gemini Audio + Gemma 31B Visual & Synthesis) - Recommended</SelectItem>
                <SelectItem value="gemini_only">Gemini Only Mode (gemini-2.5-flash for audio & visual)</SelectItem>
                <SelectItem value="31b_only_no_audio">Gemma 31B Visual Only Mode (gemma-4-31b-it - no audio analysis)</SelectItem>
              </SelectContent>
            </Select>
            <div className="text-xs text-text-muted mt-2 leading-relaxed">
              {modeDescriptions[mode]}
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={!file || isUploading}
            className="w-full bg-[image:var(--background-image-grad-primary)] text-white h-12 text-base font-semibold hover:-translate-y-[1px] hover:shadow-[0_6px_20px_rgba(6,182,212,0.4)] transition-all shadow-[0_4px_15px_rgba(6,182,212,0.2)] border-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
          >
            {isUploading ? "Uploading Video File..." : "Launch Creative Analysis"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
