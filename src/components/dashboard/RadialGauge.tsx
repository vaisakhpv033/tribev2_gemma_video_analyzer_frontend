"use client";

import { useEffect, useState } from "react";

interface RadialGaugeProps {
  value: number;
  maxVal?: number;
  isInt?: boolean;
  title: string;
  desc: string;
  type: "score" | "hook";
}

export function RadialGauge({ value, maxVal = 10, isInt = false, title, desc, type }: RadialGaugeProps) {
  const [currentVal, setCurrentVal] = useState(0);
  const maxOffset = 314.16; // 2 * PI * 50
  
  useEffect(() => {
    // Animate counter
    let count = 0;
    const duration = 1000;
    const steps = 60;
    const stepVal = value / steps;
    const stepTime = duration / steps;
    
    const counter = setInterval(() => {
      count += stepVal;
      if (count >= value) {
        clearInterval(counter);
        setCurrentVal(value);
      } else {
        setCurrentVal(count);
      }
    }, stepTime);

    return () => clearInterval(counter);
  }, [value]);

  const percent = Math.min(value / maxVal, 1.0);
  const strokeDashoffset = maxOffset * (1 - percent);
  
  const isScore = type === "score";

  return (
    <div className="bg-glass-bg border border-glass-border rounded-2xl p-6 text-center flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center w-[120px] h-[120px]">
        <svg className="w-[120px] h-[120px] -rotate-90">
          <defs>
            {isScore ? (
              <linearGradient id="purple-brand-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8b00ff" />
                <stop offset="100%" stopColor="#c362ff" />
              </linearGradient>
            ) : (
              <linearGradient id="purple-light-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#aa1ffe" />
                <stop offset="100%" stopColor="#e1b0ff" />
              </linearGradient>
            )}
          </defs>
          <circle 
            cx="60" cy="60" r="50" 
            fill="none" 
            stroke="rgba(255, 255, 255, 0.04)" 
            strokeWidth="10" 
          />
          <circle 
            cx="60" cy="60" r="50" 
            fill="none" 
            stroke={isScore ? "url(#purple-brand-grad)" : "url(#purple-light-grad)"}
            strokeWidth="10" 
            strokeLinecap="round"
            strokeDasharray={maxOffset}
            strokeDashoffset={maxOffset}
            style={{ 
              strokeDashoffset, 
              transition: "stroke-dashoffset 1s ease-out",
              filter: isScore ? "drop-shadow(0 0 6px rgba(170, 31, 254, 0.5))" : "drop-shadow(0 0 6px rgba(225, 176, 255, 0.5))"
            }}
          />
        </svg>
        <span className="absolute text-3xl font-bold text-text-primary">
          {isInt ? Math.round(currentVal) : currentVal.toFixed(1)}
        </span>
      </div>
      <div className="mt-4 font-semibold text-sm text-text-secondary">{title}</div>
      <div className="text-xs text-text-muted mt-1">{desc}</div>
    </div>
  );
}
