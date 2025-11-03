"use client";

import { AlertTriangle, Shield, TrendingUp, Clock, Target } from 'lucide-react';

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
  currentTime: number;
}

export default function ContextualAnalysis({
  analysisData,
  selectedDetection,
  currentTime
}: ContextualAnalysisProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'text-red-400 bg-red-500/20';
      case 'medium': return 'text-orange-400 bg-orange-500/20';
      case 'low': return 'text-green-400 bg-green-500/20';
      default: return 'text-slate-400 bg-slate-500/20';
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

  return (
    <div className="p-4 space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Overall Analysis */}
        <div className="lg:col-span-1">
          <div className="card p-4">
            <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span>Overall Analysis</span>
            </h4>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Risk Level</span>
                <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getRiskColor(analysisData.overallRisk)}`}>
                  {getRiskIcon(analysisData.overallRisk)}
                  <span className="capitalize">{analysisData.overallRisk}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Detections</span>
                <span className="text-sm text-white font-medium">
                  {analysisData.violenceDetections.length}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Duration</span>
                <span className="text-sm text-white font-medium">
                  {formatTime(analysisData.totalDuration)}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Current Selection or Summary */}
        <div className="lg:col-span-2">
          <div className="card p-4">
            {selectedDetection ? (
              <>
                <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-orange-400" />
                  <span>Violence Detection Details</span>
                </h4>
                
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h5 className="text-lg font-semibold text-white mb-1">
                        {selectedDetection.type}
                      </h5>
                      <div className="flex items-center space-x-4 text-sm text-slate-400">
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatTime(selectedDetection.startTime)} - {formatTime(selectedDetection.endTime)}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Target className="w-3 h-3" />
                          <span>{Math.round(selectedDetection.confidence * 100)}% confidence</span>
                        </span>
                      </div>
                    </div>
                    
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      selectedDetection.confidence >= 0.8 ? 'bg-red-500/20 text-red-400' :
                      selectedDetection.confidence >= 0.6 ? 'bg-orange-500/20 text-orange-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {selectedDetection.confidence >= 0.8 ? 'High Risk' :
                       selectedDetection.confidence >= 0.6 ? 'Medium Risk' : 'Low Risk'}
                    </div>
                  </div>
                  
                  <p className="text-slate-300 leading-relaxed">
                    {selectedDetection.description}
                  </p>
                </div>
              </>
            ) : (
              <>
                <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4" />
                  <span>Analysis Summary</span>
                </h4>
                
                <p className="text-slate-300 leading-relaxed mb-4">
                  {analysisData.summary}
                </p>
                
                <div className="text-sm text-slate-400">
                  Click on highlighted sections in the timeline above to view detailed analysis of specific violence detections.
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}