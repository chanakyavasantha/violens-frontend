"use client";

import { Loader2, Brain, Zap } from 'lucide-react';

export default function LoadingSpinner() {
  return (
    <div className="card text-center">
      <div className="space-y-6">
        <div className="relative">
          <div className="w-20 h-20 mx-auto relative">
            <Loader2 className="w-20 h-20 text-blue-400 animate-spin" />
            <Brain className="w-8 h-8 text-orange-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
        </div>
        
        <div>
          <h3 className="text-xl font-semibold text-white mb-2">
            AI Analysis in Progress
          </h3>
          <p className="text-slate-300 mb-4">
            Our deep learning models are analyzing your video...
          </p>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-center space-x-2 text-sm text-slate-400">
            <Zap className="w-4 h-4 animate-pulse" />
            <span>Processing video frames</span>
          </div>
          <div className="flex items-center justify-center space-x-2 text-sm text-slate-400">
            <Brain className="w-4 h-4 animate-pulse" />
            <span>Running contextual analysis</span>
          </div>
          <div className="flex items-center justify-center space-x-2 text-sm text-slate-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Generating insights</span>
          </div>
        </div>
        
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div className="bg-gradient-to-r from-blue-500 to-orange-500 h-2 rounded-full animate-pulse" style={{width: '60%'}} />
        </div>
      </div>
    </div>
  );
}