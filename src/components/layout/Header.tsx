"use client";

import { Menu, PlaySquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { HistorySidebar } from "./HistorySidebar";

interface HeaderProps {
  onNewAnalysis: () => void;
  analyses: any[];
  activeAnalysisId: string | null;
  onSelectAnalysis: (id: string) => void;
}

export function Header({ onNewAnalysis, analyses, activeAnalysisId, onSelectAnalysis }: HeaderProps) {
  return (
    <header className="flex justify-between items-center bg-bg-dark/70 backdrop-blur-md border-b border-white/5 p-5 shrink-0 relative z-50">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-[image:var(--background-image-grad-primary)] rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(170,31,254,0.4)]">
          <PlaySquare className="w-5 h-5 text-white fill-white" />
        </div>
        <h1 className="text-xl font-bold tracking-tight bg-[image:var(--background-image-grad-primary)] bg-clip-text text-transparent">
          TripleTap Ad Analyzer
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <Button onClick={onNewAnalysis} className="bg-[image:var(--background-image-grad-primary)] hover:-translate-y-[1px] hover:shadow-[0_6px_16px_rgba(170,31,254,0.35)] transition-all shadow-[0_4px_12px_rgba(170,31,254,0.2)] text-white border-0">
          Upload Video
        </Button>
        <Sheet>
          <SheetTrigger render={<Button variant="outline" size="icon" className="bg-transparent border-white/10 hover:bg-white/5 text-text-primary" />}>
            <Menu className="w-5 h-5" />
          </SheetTrigger>
          <SheetContent className="bg-bg-darker border-white/10 p-0 w-[320px] sm:max-w-[320px]">
            <SheetHeader className="p-6 border-b border-white/10">
              <SheetTitle className="text-text-secondary uppercase tracking-widest text-sm text-left">
                Analysis History
              </SheetTitle>
            </SheetHeader>
            <HistorySidebar 
              analyses={analyses} 
              activeAnalysisId={activeAnalysisId} 
              onSelectAnalysis={onSelectAnalysis} 
            />
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
