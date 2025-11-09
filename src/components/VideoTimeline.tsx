"use client";

import { useState, useRef, useEffect } from 'react';
import { AlertTriangle, Clock, Target } from 'lucide-react';

interface ViolenceDetection {
  startTime: number;
  endTime: number;
  confidence: number;
  type: string;
  description: string;
}

interface VideoTimelineProps {
  duration: number;
  violenceDetections: ViolenceDetection[];
  currentTime: number;
  onTimeClick: (time: number) => void;
  selectedDetection: ViolenceDetection | null;
}

export default function VideoTimeline({
  duration,
  violenceDetections,
  currentTime,
  onTimeClick,
  selectedDetection
}: VideoTimelineProps) {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [hoveredTime, setHoveredTime] = useState<number | null>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const frames = Math.floor((seconds % 1) * 30); // Assuming 30fps
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`;
  };

  const handleTimelineClick = (e: React.MouseEvent) => {
    if (!timelineRef.current) return;
    
    const rect = timelineRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const time = percentage * duration;
    
    onTimeClick(Math.max(0, Math.min(duration, time)));
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!timelineRef.current) return;
    
    const rect = timelineRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const percentage = mouseX / rect.width;
    const time = percentage * duration;
    
    setHoveredTime(Math.max(0, Math.min(duration, time)));
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-red-500';
    if (confidence >= 0.6) return 'bg-orange-500';
    return 'bg-yellow-500';
  };

  const getConfidenceIntensity = (confidence: number) => {
    if (confidence >= 0.8) return 'opacity-90';
    if (confidence >= 0.6) return 'opacity-70';
    return 'opacity-50';
  };

  // Generate time markers
  const timeMarkers = [];
  const markerInterval = duration > 60 ? 10 : 5; // 10s intervals for long videos, 5s for short
  for (let i = 0; i <= duration; i += markerInterval) {
    timeMarkers.push(i);
  }

  return (
    <div className="p-4 w-full">
      {/* Timeline Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <div className="flex items-center flex-wrap gap-4 w-full md:w-auto">
          <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
            <Target className="w-5 h-5 text-orange-400" />
            <span>Violence Detection Timeline</span>
          </h3>
          <div className="flex items-center space-x-2 text-base text-slate-100">
            <Clock className="w-4 h-4" />
            <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-x-4 gap-y-2 text-base w-full md:w-auto md:justify-end">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span className="text-white">High Risk</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-orange-500 rounded"></div>
            <span className="text-white">Medium Risk</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span className="text-white">Low Risk</span>
          </div>
        </div>
      </div>

      {/* Main Timeline */}
      <div className="relative">
        {/* Time Markers */}
        <div className="flex justify-between text-sm text-slate-200 mb-2 font-medium">
          {timeMarkers.map(time => (
            <span key={time} className="text-center">
              {formatTime(time)}
            </span>
          ))}
        </div>

        {/* Timeline Track */}
        <div
          ref={timelineRef}
          className="relative h-16 md:h-20 bg-slate-800 rounded-lg cursor-pointer overflow-hidden w-full"
          onClick={handleTimelineClick}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredTime(null)}
          aria-label="Video analysis timeline"
        >
          {/* Base timeline gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-700 to-slate-800"></div>
          
          {/* Violence Detection Highlights */}
          {violenceDetections.map((detection, index) => {
            const startPercent = (detection.startTime / duration) * 100;
            const widthPercent = ((detection.endTime - detection.startTime) / duration) * 100;
            const isSelected = selectedDetection === detection;
            
            return (
              <div
                key={index}
                className={`
                  absolute top-0 h-full transition-all duration-200
                  ${getConfidenceColor(detection.confidence)} ${getConfidenceIntensity(detection.confidence)}
                  ${isSelected ? 'ring-2 ring-white ring-opacity-80 z-10' : ''}
                  hover:brightness-110
                `}
                style={{
                  left: `${startPercent}%`,
                  width: `${widthPercent}%`
                }}
                title={`${detection.type} (${Math.round(detection.confidence * 100)}% confidence)`}
              >
                {/* Violence type indicator */}
                <div className="absolute top-1 left-1 right-1">
                  <div className="flex items-center justify-between">
                    <AlertTriangle className="w-3 h-3 text-white" />
                    <span className="text-xs text-white font-medium">
                      {Math.round(detection.confidence * 100)}%
                    </span>
                  </div>
                </div>
                
                {/* Waveform-like pattern for visual appeal */}
                <div className="absolute bottom-0 left-0 right-0 h-2">
                  <div className="h-full bg-white/20 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                </div>
              </div>
            );
          })}
          
          {/* Current Time Indicator */}
          <div
            className="absolute top-0 w-0.5 h-full bg-white shadow-lg z-20"
            style={{ left: `${(currentTime / duration) * 100}%` }}
          >
            <div className="absolute -top-2 -left-2 w-4 h-4 bg-white rounded-full shadow-lg"></div>
          </div>
          
          {/* Hover Time Indicator */}
          {hoveredTime !== null && (
            <div
              className="absolute top-0 w-px h-full bg-blue-400 opacity-60 z-10"
              style={{ left: `${(hoveredTime / duration) * 100}%` }}
            >
              <div className="absolute -top-8 -left-8 bg-blue-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                {formatTime(hoveredTime)}
              </div>
            </div>
          )}
        </div>
        
        {/* Timeline Scale */}
        <div className="flex justify-between mt-1">
          {timeMarkers.map(time => (
            <div key={time} className="w-px h-2 bg-slate-500"></div>
          ))}
        </div>
      </div>
    </div>
  );
}