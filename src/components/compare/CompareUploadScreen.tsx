"use client";

import { useState, useRef } from "react";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { API_BASE_URL } from "@/config/api";

export function CompareUploadScreen({ onUploadSuccess }: { onUploadSuccess: (id: string) => void }) {
  const [file1, setFile1] = useState<File | null>(null);
  const [file2, setFile2] = useState<File | null>(null);
  const [isDragging1, setIsDragging1] = useState(false);
  const [isDragging2, setIsDragging2] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const fileInputRef1 = useRef<HTMLInputElement>(null);
  const fileInputRef2 = useRef<HTMLInputElement>(null);

  const handleDrop1 = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging1(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile1(e.dataTransfer.files[0]);
    }
  };

  const handleDrop2 = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging2(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile2(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file1 || !file2) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("video1_file", file1);
    formData.append("video2_file", file2);

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/comparator/upload/`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit comparison");
      }
      const result = await res.json();
      onUploadSuccess(result.id);
    } catch (err: any) {
      alert("Upload failed: " + err.message);
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full animate-fade-in">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Video Creative Comparator</h2>
        <p className="text-text-secondary mb-10">
          Upload two mobile game ad videos. We will extract the audio via Gemini Flash, strip it, and run a Gemma 4 (31B) synthesis to determine the winner based on visual and audio hooks.
        </p>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            {/* Video 1 Dropzone */}
            <div 
              onClick={() => fileInputRef1.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setIsDragging1(true); }}
              onDragLeave={() => setIsDragging1(false)}
              onDrop={handleDrop1}
              className={`border-2 border-dashed rounded-xl p-8 cursor-pointer transition-all ${isDragging1 || file1 ? 'border-brand-primary bg-brand-primary/5' : 'border-white/15 hover:border-brand-primary hover:bg-brand-primary/5'}`}
            >
              <Zap className="w-10 h-10 text-brand-primary mx-auto mb-4 animate-[pulse-slow_2s_infinite]" />
              <h3 className="text-lg font-semibold mb-1">Video 1</h3>
              {file1 ? (
                <div className="text-sm font-medium text-brand-primary truncate">{file1.name}</div>
              ) : (
                <p className="text-text-secondary text-sm">Click or drag Video 1 here</p>
              )}
              <input 
                type="file" 
                className="hidden" 
                accept="video/*" 
                ref={fileInputRef1}
                onChange={(e) => setFile1(e.target.files?.[0] || null)}
              />
            </div>

            {/* Video 2 Dropzone */}
            <div 
              onClick={() => fileInputRef2.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setIsDragging2(true); }}
              onDragLeave={() => setIsDragging2(false)}
              onDrop={handleDrop2}
              className={`border-2 border-dashed rounded-xl p-8 cursor-pointer transition-all ${isDragging2 || file2 ? 'border-brand-primary bg-brand-primary/5' : 'border-white/15 hover:border-brand-primary hover:bg-brand-primary/5'}`}
            >
              <Zap className="w-10 h-10 text-brand-primary mx-auto mb-4 animate-[pulse-slow_2s_infinite]" />
              <h3 className="text-lg font-semibold mb-1">Video 2</h3>
              {file2 ? (
                <div className="text-sm font-medium text-brand-primary truncate">{file2.name}</div>
              ) : (
                <p className="text-text-secondary text-sm">Click or drag Video 2 here</p>
              )}
              <input 
                type="file" 
                className="hidden" 
                accept="video/*" 
                ref={fileInputRef2}
                onChange={(e) => setFile2(e.target.files?.[0] || null)}
              />
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={!file1 || !file2 || isUploading}
            className="w-full bg-[image:var(--background-image-grad-primary)] text-white h-12 text-base font-semibold hover:-translate-y-[1px] hover:shadow-[0_6px_20px_rgba(170,31,254,0.4)] transition-all shadow-[0_4px_15px_rgba(170,31,254,0.2)] border-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? "Uploading & Analyzing..." : "Launch Comparison"}
          </Button>
        </form>
      </div>
    </div>
  );
}
