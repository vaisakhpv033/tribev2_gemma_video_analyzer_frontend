"use client";

import { useState, useRef, useEffect } from "react";
import { BrainCircuit, Upload, Play, AlertCircle, Loader2, Info } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { API_BASE_URL } from "@/config/api";

export function BrainAnalysisPanel({ data, onUpdate }: { data: any, onUpdate: () => void }) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeFeature, setActiveFeature] = useState<string>("global");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [performanceVideos, setPerformanceVideos] = useState<any[]>([]);
  const [selectedTopVideoId, setSelectedTopVideoId] = useState<string>("");
  const [selectedBottomVideoId, setSelectedBottomVideoId] = useState<string>("");
  const [selectedCompetitorVideoId, setSelectedCompetitorVideoId] = useState<string>("");

  const status = data.brain_analysis_status;
  const isPending = status === "PENDING";
  const isCompleted = status === "COMPLETED";
  const isFailed = status === "FAILED";

  // Polling logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPending) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/api/v1/analyses/${data.id}/`);
          if (res.ok) {
            const freshData = await res.json();
            if (freshData.brain_analysis_status !== "PENDING") {
              onUpdate(); // Trigger parent refresh
            }
          }
        } catch (e) {
          console.error("Polling error", e);
        }
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isPending, data.id, onUpdate]);

  // Fetch performance videos
  useEffect(() => {
    async function fetchPerformanceVideos() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/performance-videos/`);
        if (res.ok) {
          const vids = await res.json();
          setPerformanceVideos(vids);
          
          const topVideos = vids.filter((v: any) => v.tier === 'TOP');
          const bottomVideos = vids.filter((v: any) => v.tier === 'BOTTOM');
          const competitorVideos = vids.filter((v: any) => v.tier === 'COMPETITOR_SUCCESS');
          
          if (topVideos.length > 0) {
            setSelectedTopVideoId(topVideos[0].id);
          }
          if (bottomVideos.length > 0) {
            setSelectedBottomVideoId(bottomVideos[bottomVideos.length - 1].id);
          }
          if (competitorVideos.length > 0) {
            setSelectedCompetitorVideoId(competitorVideos[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to fetch performance videos", err);
      }
    }
    fetchPerformanceVideos();
  }, []);

  const handleTriggerAnalysis = async (file?: File) => {
    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("analysis_id", data.id);
    if (file) {
      formData.append("npz_file", file);
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/brain-analysis/`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Failed to trigger brain analysis");
      }
      
      onUpdate(); // Refresh parent to show PENDING state
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleTriggerAnalysis(file);
    }
  };

  const featureTabs = [
    {
      id: "global",
      label: "Overall Brain Engagement",
      key: "global",
      desc: "Average activity across the entire brain, second by second. This timeseries is used to calculate two key metrics:",
      metrics: [
        { name: "Sustained Attention Duration", detail: "The longest unbroken streak (in seconds) where brain engagement stayed above the video's average level. Longer streaks mean the ad held attention without dips." },
        { name: "Attention Trigger Point", detail: "The exact second when brain engagement first spiked significantly above normal. Earlier spikes suggest the ad grabs attention faster." },
      ],
    },
    {
      id: "emotional",
      label: "Emotional Response",
      key: "emotional",
      desc: "Tracks how strongly the viewer's emotion-processing brain regions reacted each second. Higher values indicate moments that triggered stronger feelings — excitement, empathy, curiosity, or urgency.",
      metrics: [
        { name: "Emotional Engagement Score", detail: "The average emotional response across the entire video. Higher scores mean the ad consistently evoked emotional reactions, which drives memorability and action." },
      ],
    },
    {
      id: "orbital",
      label: "Decision & Reward Interest",
      key: "orbital",
      desc: "Measures activity in the brain's decision-making and reward-evaluation center, second by second. Peaks indicate moments when the viewer was evaluating whether the product or offer is worth pursuing.",
      metrics: [
        { name: "Decision Focus Score", detail: "The average decision and reward-evaluation activity. Higher values suggest the ad effectively triggered 'is this worth it?' thinking — a strong precursor to conversion intent." },
      ],
    },
    {
      id: "visual",
      label: "Visual Processing Intensity",
      key: "visual",
      desc: "Tracks how intensely the viewer's visual processing regions responded each second. This reflects how much the ad's visuals — colors, motion, text overlays, scene changes — captured the brain's visual attention.",
      metrics: [
        { name: "Visual Variation Score", detail: "The variability (standard deviation) of visual processing across the video. Higher variation means the ad's visuals created distinct peaks and valleys of engagement — dynamic scenes that kept the brain alert rather than flat, monotonous imagery." },
      ],
    },
    {
      id: "insula",
      label: "Gut-Feel Reaction",
      key: "insula_short",
      desc: "Measures the brain's instinctive, gut-level reactions second by second. This region drives immediate 'I want that' or 'that feels right' responses — the subconscious pull toward a product before conscious reasoning kicks in.",
      metrics: [
        { name: "Instinct Response Score", detail: "The average gut-reaction intensity. Higher values indicate the ad triggered stronger intuitive pull — the kind of subconscious appeal that drives impulse downloads and taps." },
      ],
    },
  ];

  // Derive which timeseries array to show based on the active tab
  const activeTabConfig = featureTabs.find(t => t.id === activeFeature);
  const activeTimeseriesKey = activeTabConfig?.key || "global";

  const getCombinedChartData = () => {
    const currentTimeseriesArray = isCompleted && data.brain_timeseries ? data.brain_timeseries[activeTimeseriesKey] : [];
    
    const selectedTopVideo = performanceVideos.find(v => v.id === selectedTopVideoId);
    const selectedBottomVideo = performanceVideos.find(v => v.id === selectedBottomVideoId);
    const selectedCompetitorVideo = performanceVideos.find(v => v.id === selectedCompetitorVideoId);

    const topTimeseriesArray = selectedTopVideo?.brain_timeseries?.[activeTimeseriesKey] || [];
    const bottomTimeseriesArray = selectedBottomVideo?.brain_timeseries?.[activeTimeseriesKey] || [];
    const competitorTimeseriesArray = selectedCompetitorVideo?.brain_timeseries?.[activeTimeseriesKey] || [];

    const maxLength = Math.max(
      currentTimeseriesArray?.length || 0,
      topTimeseriesArray?.length || 0,
      bottomTimeseriesArray?.length || 0,
      competitorTimeseriesArray?.length || 0
    );

    if (maxLength === 0) return [];

    const chartData = [];
    for (let i = 0; i < maxLength; i++) {
      chartData.push({
        second: i + 1,
        currentValue: currentTimeseriesArray[i] ?? null,
        topValue: topTimeseriesArray[i] ?? null,
        bottomValue: bottomTimeseriesArray[i] ?? null,
        competitorValue: competitorTimeseriesArray[i] ?? null,
      });
    }
    return chartData;
  };

  const chartData = getCombinedChartData();

  return (
    <div className="bg-glass-bg border border-glass-border rounded-2xl p-6 mb-8 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-accent-blue/10 blur-[80px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2" />
      
      <div className="flex justify-between items-start mb-6 relative">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <BrainCircuit className="w-6 h-6 text-accent-blue" />
            Neural Response Analysis
          </h2>
          <p className="text-sm text-text-muted mt-1 max-w-lg">
            Predicts ad performance and conversion rates by analyzing simulated human neurological responses (attention, emotion, visual processing).
          </p>
        </div>

        {/* Upload Buttons */}
        {(!status || isFailed) && (
          <div className="flex gap-3">
            <button
              onClick={() => handleTriggerAnalysis()}
              disabled={isUploading}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
            >
              Analyze without .npz
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex items-center gap-2 px-4 py-2 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-lg text-sm font-medium transition-all shadow-[0_0_15px_rgba(var(--brand-primary-rgb),0.3)] disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              Upload .npz Prediction
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".npz"
              className="hidden"
            />
          </div>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-accent-rose/10 border border-accent-rose/20 rounded-xl text-accent-rose text-sm flex gap-2 items-center">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {isPending && (
        <div className="py-12 flex flex-col items-center justify-center text-center">
          <Loader2 className="w-8 h-8 text-accent-blue animate-spin mb-4" />
          <h3 className="text-lg font-medium">Processing Neural Data...</h3>
          <p className="text-text-muted text-sm mt-2">Extracting brain features and predicting performance. This usually takes less than a minute.</p>
        </div>
      )}

      {isCompleted && (
        <div className="animate-fade-in space-y-8 relative">
          
          {/* Top Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Predicted Performance */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <div className="text-xs text-text-muted uppercase tracking-wider mb-2">Predicted Ad Performance</div>
              <div className="flex items-end gap-3">
                <span className={`text-3xl font-bold ${data.brain_predicted_class === 'High' ? 'text-accent-emerald' : 'text-accent-amber'}`}>
                  {data.brain_predicted_class}
                </span>
                <span className="text-sm text-text-secondary pb-1 bg-white/5 px-2 py-0.5 rounded">
                  Tier: {data.brain_prediction_tier}
                </span>
              </div>
              <div className="text-xs text-text-muted mt-3 flex gap-1.5 items-start bg-black/20 p-2 rounded">
                <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span>"High" means the video is predicted to perform above the median CTR of our historically trained dataset.</span>
              </div>
            </div>

            {/* Predicted CTR */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <div className="text-xs text-text-muted uppercase tracking-wider mb-2">Predicted Conversion Rate</div>
              <div className="flex items-end gap-3">
                <span className="text-3xl font-bold text-white">
                  {data.brain_predicted_ctr ? data.brain_predicted_ctr.toFixed(2) : '--'}%
                </span>
              </div>
              <div className="text-xs text-text-secondary mt-3">
                <span className="font-medium">Expected Range:</span> {data.brain_ctr_lower_bound?.toFixed(2)}% - {data.brain_ctr_upper_bound?.toFixed(2)}%
              </div>
              <div className="w-full bg-white/5 h-1.5 mt-2 rounded-full overflow-hidden">
                <div 
                  className="bg-accent-blue h-full rounded-full" 
                  style={{ width: `${Math.min((data.brain_predicted_ctr || 0) / 5 * 100, 100)}%` }} 
                />
              </div>
            </div>

            {/* Confidence */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <div className="text-xs text-text-muted uppercase tracking-wider mb-2">Model Confidence</div>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold text-white">
                  {data.brain_predicted_confidence ? data.brain_predicted_confidence.toFixed(1) : '--'}%
                </span>
              </div>
              <div className="text-xs text-text-muted mt-3 flex gap-1.5 items-start bg-black/20 p-2 rounded">
                <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span>Confidence level that the Neural Network's prediction tier is accurate based on the brain signals extracted.</span>
              </div>
            </div>

          </div>

          {/* Timeseries Graph Section */}
          <div className="bg-black/20 border border-white/5 rounded-xl p-5">
            <h3 className="text-sm font-semibold mb-4 text-text-secondary">Neural Timeseries Breakdown (Per Second)</h3>
            
            {/* Comparative Selectors */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <label className="text-xs text-text-muted mb-1.5 block font-medium">Compare with Top Video</label>
                <select 
                  value={selectedTopVideoId} 
                  onChange={e => setSelectedTopVideoId(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg text-sm p-2 text-white focus:outline-none focus:border-accent-emerald transition-colors"
                >
                  <option value="">None</option>
                  {performanceVideos.filter(v => v.tier === 'TOP').map(v => (
                    <option key={v.id} value={v.id}>
                      {v.filename.replace('.npz', '')} (CTR: {v.actual_ctr ?? v.brain_predicted_ctr?.toFixed(2)}%)
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex-1">
                <label className="text-xs text-text-muted mb-1.5 block font-medium">Compare with Bottom Video</label>
                <select 
                  value={selectedBottomVideoId} 
                  onChange={e => setSelectedBottomVideoId(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg text-sm p-2 text-white focus:outline-none focus:border-accent-rose transition-colors"
                >
                  <option value="">None</option>
                  {performanceVideos.filter(v => v.tier === 'BOTTOM').map(v => (
                    <option key={v.id} value={v.id}>
                      {v.filename.replace('.npz', '')} (CTR: {v.actual_ctr ?? v.brain_predicted_ctr?.toFixed(2)}%)
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex-1">
                <label className="text-xs text-text-muted mb-1.5 block font-medium">Compare with Competitor</label>
                <select 
                  value={selectedCompetitorVideoId} 
                  onChange={e => setSelectedCompetitorVideoId(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg text-sm p-2 text-white focus:outline-none focus:border-[#f59e0b] transition-colors"
                >
                  <option value="">None</option>
                  {performanceVideos.filter(v => v.tier === 'COMPETITOR_SUCCESS').map(v => (
                    <option key={v.id} value={v.id}>
                      {v.filename.replace('.npz', '')} (Imp: {v.impressions ?? 'N/A'})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
              {featureTabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFeature(tab.id)}
                  className={`px-3 py-1.5 text-xs rounded-lg transition-all border ${
                    activeFeature === tab.id 
                      ? "bg-accent-blue/20 border-accent-blue/50 text-accent-blue font-medium shadow-[0_0_10px_rgba(var(--accent-blue-rgb),0.2)]" 
                      : "bg-white/5 border-transparent text-text-muted hover:bg-white/10 hover:text-text-secondary"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Chart */}
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
                      if (name === 'currentValue') return [numVal.toFixed(4), "Current Video"];
                      if (name === 'topValue') return [numVal.toFixed(4), "Top Video"];
                      if (name === 'bottomValue') return [numVal.toFixed(4), "Bottom Video"];
                      if (name === 'competitorValue') return [numVal.toFixed(4), "Competitor Video"];
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
                  {selectedTopVideoId && (
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
                  {selectedBottomVideoId && (
                    <Line 
                      type="monotone" 
                      dataKey="bottomValue" 
                      name="bottomValue"
                      stroke="#ef4444" 
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4, fill: "#ef4444", stroke: "#000", strokeWidth: 2 }}
                    />
                  )}
                  {selectedCompetitorVideoId && (
                    <Line 
                      type="monotone" 
                      dataKey="competitorValue" 
                      name="competitorValue"
                      stroke="#f59e0b" 
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4, fill: "#f59e0b", stroke: "#000", strokeWidth: 2 }}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            {/* Chart Legend */}
            <div className="flex items-center gap-4 mt-4 justify-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-accent-blue"></div>
                <span className="text-xs text-text-muted">Current Video</span>
              </div>
              {selectedTopVideoId && (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-0.5 bg-[#10b981]"></div>
                  <span className="text-xs text-text-muted">Top Video</span>
                </div>
              )}
              {selectedBottomVideoId && (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-0.5 bg-[#ef4444]"></div>
                  <span className="text-xs text-text-muted">Bottom Video</span>
                </div>
              )}
              {selectedCompetitorVideoId && (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-0.5 bg-[#f59e0b]"></div>
                  <span className="text-xs text-text-muted">Competitor Video</span>
                </div>
              )}
            </div>
            
            <div className="mt-5 space-y-3">
              <p className="text-xs text-text-secondary leading-relaxed">
                {activeTabConfig?.desc}
              </p>
              {activeTabConfig?.metrics && activeTabConfig.metrics.length > 0 && (
                <div className="space-y-2">
                  {activeTabConfig.metrics.map((m, i) => (
                    <div key={i} className="flex gap-2.5 items-start bg-white/5 border border-white/5 rounded-lg p-3">
                      <Info className="w-3.5 h-3.5 text-accent-blue mt-0.5 shrink-0" />
                      <div>
                        <span className="text-xs font-semibold text-text-primary">{m.name}: </span>
                        <span className="text-xs text-text-muted">{m.detail}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      )}
    </div>
  );
}
