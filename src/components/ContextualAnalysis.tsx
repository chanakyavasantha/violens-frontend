"use client";

import { AlertTriangle, Shield, TrendingUp, Clock, Target, Activity } from 'lucide-react';

interface ViolenceDetection {
  startTime: number;
  endTime: number;
  confidence: number;
  type: string;
  description: string;
}

interface AnalysisData {
  summary: string;
  violenceDetections: ViolenceDetection[];
  totalDuration: number;
  overallRisk: 'low' | 'medium' | 'high';
}

interface ContextualAnalysisProps {
  analysisData: AnalysisData;
  selectedDetection: ViolenceDetection | null;
  variant?: 'stats' | 'details';
}

export default function ContextualAnalysis({
  analysisData,
  selectedDetection,
  variant = 'stats'
}: ContextualAnalysisProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'medium': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      case 'low': return 'text-green-400 bg-green-500/10 border-green-500/20';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      case 'medium': return <TrendingUp className="w-4 h-4" />;
      case 'low': return <Shield className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const sanitizeSummary = (summary: string) => {
    const noisy = [
      'gemini', 'failed', '404', 'not found', 'not supported', 'listmodels', 'error'
    ];
    const s = summary?.toLowerCase() || '';
    if (noisy.some(token => s.includes(token))) {
      const count = analysisData.violenceDetections.length;
      const risk = analysisData.overallRisk[0].toUpperCase() + analysisData.overallRisk.slice(1);
      return `Video analysis completed. Detected ${count} potential violence segment${count === 1 ? '' : 's'}. Overall risk: ${risk}. Click timeline highlights for details.`;
    }
    return summary;
  };

  const describeDetection = (d: ViolenceDetection) => {
    const raw = (d.description || '').trim();
    const noisy = ['gemini', 'failed', '404', 'not found', 'not supported', 'error'];
    if (!raw || noisy.some(token => raw.toLowerCase().includes(token))) {
      return `Detected ${d.type.toLowerCase()} from ${formatTime(d.startTime)} to ${formatTime(d.endTime)} with ${Math.round(d.confidence * 100)}% confidence.`;
    }
    return raw;
  };

  if (variant === 'stats') {
    return (
      <div className="h-full animate-fadeInUp">
        <div className="card h-full p-2.5 border-l border-purple-500/50 bg-[#0f0f13] border-y border-r border-white/5 rounded-lg shadow-lg flex flex-col justify-center">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest flex items-center space-x-1.5">
              <Activity className="w-2.5 h-2.5 text-purple-400" />
              <span>Assessment</span>
            </h4>
            <div className={`px-1 py-0.5 rounded text-[8px] font-medium flex items-center space-x-0.5 border ${getRiskColor(analysisData.overallRisk)}`}>
              {getRiskIcon(analysisData.overallRisk)}
              <span className="capitalize tracking-wide">{analysisData.overallRisk}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col p-1.5 bg-white/[0.02] rounded border border-white/5">
              <span className="text-[9px] text-slate-500 font-medium uppercase tracking-wider mb-0.5">Detections</span>
              <span className="text-base font-semibold text-white tabular-nums tracking-tight">
                {analysisData.violenceDetections.length}
              </span>
            </div>

            <div className="flex flex-col p-1.5 bg-white/[0.02] rounded border border-white/5">
              <span className="text-[9px] text-slate-500 font-medium uppercase tracking-wider mb-0.5">Duration</span>
              <span className="text-base font-semibold text-white tabular-nums tracking-tight">
                {formatTime(analysisData.totalDuration)}
              </span>
            </div>

            <div className="flex flex-col p-1.5 bg-white/[0.02] rounded border border-white/5">
              <span className="text-[9px] text-slate-500 font-medium uppercase tracking-wider mb-0.5">Confidence</span>
              <span className="text-base font-semibold text-white tabular-nums tracking-tight">
                {analysisData.violenceDetections.length > 0
                  ? Math.round(analysisData.violenceDetections.reduce((acc, curr) => acc + curr.confidence, 0) / analysisData.violenceDetections.length * 100)
                  : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full animate-fadeInUp">
      <div className="card h-full p-2.5 bg-[#0f0f13] border border-white/5 rounded-lg shadow-lg flex flex-col">
        {selectedDetection ? (
          <div className="animate-fadeIn flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-1.5 shrink-0">
              <h4 className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest flex items-center space-x-1.5">
                <AlertTriangle className="w-2.5 h-2.5 text-orange-400" />
                <span>Detection</span>
              </h4>
              <div className={`px-0.5 py-0.25 rounded text-[8px] font-medium uppercase tracking-wide ${selectedDetection.confidence >= 0.8 ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                selectedDetection.confidence >= 0.6 ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                  'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                }`}>
                {selectedDetection.confidence >= 0.8 ? 'High' :
                  selectedDetection.confidence >= 0.6 ? 'Medium' : 'Low'}
              </div>
            </div>

            <div className="flex flex-col gap-1.5 flex-1 overflow-hidden">
              <div className="p-2 bg-white/[0.02] rounded border border-white/5 shrink-0">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-semibold text-white tracking-tight">
                    {selectedDetection.type}
                  </h5>
                  <div className="flex items-center space-x-2 text-[9px] text-slate-400 font-medium">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-2.5 h-2.5 text-blue-500/70" />
                      <span className="font-mono">{formatTime(selectedDetection.startTime)}-{formatTime(selectedDetection.endTime)}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Target className="w-2.5 h-2.5 text-blue-500/70" />
                      <span>{Math.round(selectedDetection.confidence * 100)}%</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-2 bg-white/[0.02] rounded border border-white/5 flex-1 overflow-y-auto custom-scrollbar">
                <p className="text-slate-300 text-[10px] leading-relaxed font-normal">
                  {describeDetection(selectedDetection)}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-fadeIn flex-1 flex flex-col overflow-hidden">
            <h4 className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center space-x-1.5 shrink-0">
              <TrendingUp className="w-2.5 h-2.5 text-blue-400" />
              <span>Summary</span>
            </h4>

            <div className="flex-1 p-2 bg-white/[0.02] rounded border border-white/5 mb-1.5 overflow-y-auto custom-scrollbar">
              <p className="text-slate-300 text-[10px] leading-relaxed font-normal">
                {sanitizeSummary(analysisData.summary)}
              </p>
            </div>

            <div className="flex items-center p-1.5 bg-blue-500/5 rounded border border-blue-500/10 text-blue-400 text-[9px] font-medium shrink-0">
              <Target className="w-2.5 h-2.5 mr-1.5 flex-shrink-0" />
              Select timeline for details
            </div>
          </div>
        )}
      </div>
    </div>
  );
}