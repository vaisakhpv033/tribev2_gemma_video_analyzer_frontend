"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Info } from "lucide-react";

interface RankingTimeseriesChartProps {
  videos: any[];
  activeVideoId: string | null;
  activeFeature: string;
}

export function RankingTimeseriesChart({ videos, activeVideoId, activeFeature }: RankingTimeseriesChartProps) {
  const activeVideo = videos.find(v => v.id === activeVideoId);
  const topVideo = [...videos].sort((a, b) => (b.overall_score || 0) - (a.overall_score || 0))[0];
  
  // If no active video selected or no timeseries data, don't show
  if (!videos || videos.length === 0) return null;

  const featureTabs = [
    {
      id: "global",
      label: "Overall Engagement",
      key: "global",
      desc: "Average activity across the entire brain. Higher values mean the ad commands more neurological resources overall.",
    },
    {
      id: "emotional",
      label: "Emotional Response",
      key: "emotional",
      desc: "Tracks emotion-processing regions. Higher values indicate moments that triggered empathy, excitement, or a 'gut-level' pull.",
    },
    {
      id: "visual",
      label: "Visual Processing",
      key: "visual",
      desc: "Tracks visual cortex intensity. Reflects how much the ad's visuals (motion, colors, faces) capture visual attention.",
    },
    {
      id: "dorsattn_net",
      label: "Sustained Attention",
      key: "dorsattn_net",
      desc: "Measures the brain's Dorsal Attention Network. High values mean the viewer is intensely focused on the screen, not daydreaming.",
    },
    {
      id: "salventattn_net",
      label: "Surprise & Novelty",
      key: "salventattn_net",
      desc: "Measures the Salience Network. Spikes indicate moments that the brain flags as unexpected, highly important, or 'wow' moments.",
    },
    {
      id: "auditory",
      label: "Auditory Processing",
      key: "auditory",
      desc: "Tracks how actively the brain is processing sound, voiceovers, or music.",
    },
    {
      id: "memory",
      label: "Memory Encoding",
      key: "memory",
      desc: "Measures activity in regions linked to memory formation. Peaks suggest moments that are likely to be remembered later.",
    },
    {
      id: "language",
      label: "Narrative Clarity",
      key: "language",
      desc: "Tracks language processing centers. High values mean the viewer is actively understanding the storyline or spoken/written words.",
    },
  ];

  const activeTabConfig = featureTabs.find(t => t.id === activeFeature) || featureTabs[0];
  const timeseriesKey = activeTabConfig.key;

  const getCombinedChartData = () => {
    if (!activeVideo || !activeVideo.engagement_curve) return [];

    const currentData = activeVideo.engagement_curve[timeseriesKey] || [];
    const topData = topVideo && topVideo.id !== activeVideoId && topVideo.engagement_curve ? topVideo.engagement_curve[timeseriesKey] : [];

    const maxLength = Math.max(currentData.length || 0, topData?.length || 0);
    if (maxLength === 0) return [];

    const chartData = [];
    for (let i = 0; i < maxLength; i++) {
      chartData.push({
        second: i + 1,
        currentValue: currentData[i] ?? null,
        topValue: topData[i] ?? null,
      });
    }
    return chartData;
  };

  const chartData = getCombinedChartData();

  if (!activeVideo) {
    return (
      <div className="h-[250px] w-full flex items-center justify-center border border-white/5 bg-black/20 rounded-xl text-text-muted text-sm">
        Select a video to view its neural timeseries
      </div>
    );
  }

  return (
    <div className="bg-black/20 border border-white/5 rounded-xl p-5">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-semibold text-text-secondary">Neural Timeseries Comparison (Per Second)</h3>
      </div>
      
      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis 
              dataKey="second" 
              stroke="rgba(255,255,255,0.3)" 
              tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
              tickMargin={10}
            />
            <YAxis 
              stroke="rgba(255,255,255,0.3)" 
              tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
              tickMargin={10}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }}
              itemStyle={{ color: '#fff' }}
              labelStyle={{ color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}
              formatter={(value: any, name: any) => {
                const numVal = typeof value === 'number' ? value : parseFloat(value) || 0;
                if (name === 'currentValue') return [numVal.toFixed(4), "Selected Video"];
                if (name === 'topValue') return [numVal.toFixed(4), "Top Ranked Video"];
                return [numVal.toFixed(4), name];
              }}
              labelFormatter={(label) => `Second ${label}`}
            />
            <Line 
              type="monotone" 
              dataKey="currentValue" 
              name="currentValue"
              stroke="var(--color-accent-blue)" 
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "var(--color-accent-blue)", stroke: "#000", strokeWidth: 2 }}
            />
            {topVideo && topVideo.id !== activeVideoId && (
              <Line 
                type="monotone" 
                dataKey="topValue" 
                name="topValue"
                stroke="#10b981" 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: "#10b981", stroke: "#000", strokeWidth: 2 }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center gap-4 mt-4 justify-center">
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-accent-blue"></div>
          <span className="text-xs text-text-muted truncate max-w-[150px]">{activeVideo.filename}</span>
        </div>
        {topVideo && topVideo.id !== activeVideoId && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-[#10b981]"></div>
            <span className="text-xs text-text-muted truncate max-w-[150px]">{topVideo.filename} (Top)</span>
          </div>
        )}
      </div>

      <div className="mt-4 flex gap-2.5 items-start bg-white/5 border border-white/5 rounded-lg p-3">
        <Info className="w-4 h-4 text-accent-blue shrink-0 mt-0.5" />
        <p className="text-xs text-text-muted">
          <span className="font-semibold text-text-primary mr-1">{activeTabConfig.label}:</span>
          {activeTabConfig.desc}
        </p>
      </div>

    </div>
  );
}
