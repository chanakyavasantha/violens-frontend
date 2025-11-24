"use client";

import { Brain, Target, Smile, Film, AlertTriangle } from 'lucide-react';

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
  confidence: number;
  objects: string[];
  emotions: string[];
  scenes: string[];
}

interface AnalysisResultsProps {
  data: AnalysisData;
}

export default function AnalysisResults({ data }: AnalysisResultsProps) {
  return (
    <div className="h-full animate-fadeInUp">
      <div className="card h-full p-2.5 bg-[#0f0f13] border border-white/5 rounded-lg shadow-lg flex flex-col">
        <div className="flex items-center space-x-1.5 mb-2 shrink-0">
          <div className="p-0.5 bg-blue-500/10 rounded">
            <Brain className="w-2.5 h-2.5 text-blue-400" />
          </div>
          <h3 className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">AI Insights</h3>
        </div>

        <div className="grid grid-cols-3 gap-2 flex-1 overflow-hidden">
          {/* Detected Objects */}
          <div className="bg-white/[0.02] rounded-md p-2 border border-white/5 flex flex-col overflow-hidden">
            <div className="flex items-center space-x-1.5 mb-1.5 shrink-0">
              <Target className="w-2.5 h-2.5 text-purple-400" />
              <h4 className="font-medium text-slate-400 text-[9px] uppercase tracking-wider">Objects</h4>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {data.objects && data.objects.length > 0 ? (
                <div className="flex flex-wrap gap-1 content-start">
                  {data.objects.map((obj, i) => (
                    <span key={i} className="px-1.5 py-0.5 bg-purple-500/5 text-purple-300 rounded text-[9px] font-medium border border-purple-500/10 hover:bg-purple-500/10 transition-colors cursor-default whitespace-nowrap">
                      {obj}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-600 text-[9px] font-medium italic">
                  None
                </div>
              )}
            </div>
          </div>

          {/* Emotions */}
          <div className="bg-white/[0.02] rounded-md p-2 border border-white/5 flex flex-col overflow-hidden">
            <div className="flex items-center space-x-1.5 mb-1.5 shrink-0">
              <Smile className="w-2.5 h-2.5 text-yellow-400" />
              <h4 className="font-medium text-slate-400 text-[9px] uppercase tracking-wider">Emotions</h4>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {data.emotions && data.emotions.length > 0 ? (
                <div className="flex flex-wrap gap-1 content-start">
                  {data.emotions.map((emotion, i) => (
                    <span key={i} className="px-1.5 py-0.5 bg-yellow-500/5 text-yellow-300 rounded text-[9px] font-medium border border-yellow-500/10 hover:bg-yellow-500/10 transition-colors cursor-default whitespace-nowrap">
                      {emotion}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-600 text-[9px] font-medium italic">
                  None
                </div>
              )}
            </div>
          </div>

          {/* Scene Analysis */}
          <div className="bg-white/[0.02] rounded-md p-2 border border-white/5 flex flex-col overflow-hidden">
            <div className="flex items-center space-x-1.5 mb-1.5 shrink-0">
              <Film className="w-2.5 h-2.5 text-green-400" />
              <h4 className="font-medium text-slate-400 text-[9px] uppercase tracking-wider">Scenes</h4>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {data.scenes && data.scenes.length > 0 ? (
                <div className="flex flex-wrap gap-1 content-start">
                  {data.scenes.map((scene, i) => (
                    <span key={i} className="px-1.5 py-0.5 bg-green-500/5 text-green-300 rounded text-[9px] font-medium border border-green-500/10 hover:bg-green-500/10 transition-colors cursor-default whitespace-nowrap">
                      {scene}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-600 text-[9px] font-medium italic">
                  None
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}