"use client";

import { Brain, Eye, Heart, Camera, TrendingUp } from 'lucide-react';

interface AnalysisData {
  summary: string;
  objects: string[];
  emotions: string[];
  scenes: string[];
  confidence: number;
}

interface AnalysisResultsProps {
  data: AnalysisData;
}

export default function AnalysisResults({ data }: AnalysisResultsProps) {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-400';
    if (confidence >= 0.6) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.6) return 'Medium';
    return 'Low';
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center space-x-2 mb-4">
          <Brain className="w-6 h-6 text-blue-400" />
          <h3 className="text-xl font-semibold text-white">AI Analysis Results</h3>
        </div>
        
        {/* Confidence Score */}
        <div className="mb-6 p-4 bg-slate-800/50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-300">Confidence Score</span>
            <span className={`font-semibold ${getConfidenceColor(data.confidence)}`}>
              {getConfidenceLabel(data.confidence)} ({Math.round(data.confidence * 100)}%)
            </span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-orange-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${data.confidence * 100}%` }}
            />
          </div>
        </div>
        
        {/* Summary */}
        <div className="mb-6">
          <h4 className="text-lg font-medium text-white mb-3 flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-orange-400" />
            <span>Summary</span>
          </h4>
          <p className="text-slate-300 leading-relaxed bg-slate-800/30 p-4 rounded-lg">
            {data.summary}
          </p>
        </div>
      </div>
      
      {/* Detected Objects */}
      <div className="card">
        <h4 className="text-lg font-medium text-white mb-4 flex items-center space-x-2">
          <Eye className="w-5 h-5 text-blue-400" />
          <span>Detected Objects</span>
        </h4>
        <div className="flex flex-wrap gap-2">
          {data.objects.map((object, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm border border-blue-500/30"
            >
              {object}
            </span>
          ))}
        </div>
      </div>
      
      {/* Emotions */}
      <div className="card">
        <h4 className="text-lg font-medium text-white mb-4 flex items-center space-x-2">
          <Heart className="w-5 h-5 text-orange-400" />
          <span>Emotions Detected</span>
        </h4>
        <div className="flex flex-wrap gap-2">
          {data.emotions.map((emotion, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-orange-500/20 text-orange-300 rounded-full text-sm border border-orange-500/30"
            >
              {emotion}
            </span>
          ))}
        </div>
      </div>
      
      {/* Scene Analysis */}
      <div className="card">
        <h4 className="text-lg font-medium text-white mb-4 flex items-center space-x-2">
          <Camera className="w-5 h-5 text-purple-400" />
          <span>Scene Analysis</span>
        </h4>
        <div className="flex flex-wrap gap-2">
          {data.scenes.map((scene, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm border border-purple-500/30"
            >
              {scene}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}