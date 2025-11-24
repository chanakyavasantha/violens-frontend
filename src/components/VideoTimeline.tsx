"use client";

import { useState, useRef } from 'react';
import { AlertTriangle, Clock, Target, Activity } from 'lucide-react';

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
    const frames = Math.floor((seconds % 1) * 30);
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
  const markerInterval = duration > 60 ? 10 : 5;
  for (let i = 0; i <= duration; i += markerInterval) {
    timeMarkers.push(i);
  }

  return (
    <div className="w-full animate-fadeInUp h-full flex flex-col">
      {/* Timeline Header */}
      <div className="flex items-center justify-between mb-3 shrink-0">
        <div className="flex items-center space-x-2">
          <div className="p-1 bg-orange-500/10 rounded">
            <Activity className="w-4 h-4 text-orange-400" />
          </div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Timeline</h3>
          <div className="h-4 w-px bg-white/10 mx-2"></div>
          <div className="flex items-center space-x-2 text-xs text-slate-400 font-mono">
            <Clock className="w-4 h-4" />
            <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-[10px] font-medium bg-white/[0.02] px-3 py-1.5 rounded border border-white/5">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full shadow-[0_0_4px_rgba(239,68,68,0.6)]"></div>
            <span className="text-slate-400">High</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full shadow-[0_0_4px_rgba(249,115,22,0.6)]"></div>
            <span className="text-slate-400">Medium</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full shadow-[0_0_4px_rgba(234,179,8,0.6)]"></div>
            <span className="text-slate-400">Low</span>
          </div>
        </div>
      </div>

      {/* Main Timeline */}
      <div className="relative select-none flex-1 flex flex-col justify-center">
        {/* Time Markers */}
        <div className="flex justify-between text-[10px] text-slate-600 mb-2 font-mono px-1">
          {timeMarkers.map((time, i) => (
            <span key={time} className={`${i % 2 !== 0 ? 'hidden sm:inline' : ''}`}>
              {formatTime(time).split(':')[1]}:{formatTime(time).split(':')[2]}
            </span>
          ))}
        </div>

        {/* Timeline Track */}
        <div
          ref={timelineRef}
          className="relative h-20 bg-[#050507] rounded-lg cursor-pointer overflow-hidden w-full border border-white/5 shadow-inner group"
          onClick={handleTimelineClick}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredTime(null)}
        >
          {/* Grid Background */}
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '20px 100%' }}>
          </div>

          {/* Violence Detection Highlights */}
          {violenceDetections.map((detection, index) => {
            const startPercent = (detection.startTime / duration) * 100;
            const widthPercent = ((detection.endTime - detection.startTime) / duration) * 100;
            const isSelected = selectedDetection === detection;

            return (
              <div
                key={index}
                className={`
                  absolute top-1 bottom-1 transition-all duration-300 rounded-sm
                  ${getConfidenceColor(detection.confidence)} ${getConfidenceIntensity(detection.confidence)}
                  ${isSelected ? 'ring-2 ring-white ring-opacity-100 z-20 brightness-125' : 'z-10'}
                  hover:brightness-125 hover:scale-y-105 origin-bottom
                `}
                style={{
                  left: `${startPercent}%`,
                  width: `${Math.max(widthPercent, 0.5)}%` // Ensure at least minimal width
                }}
              >
                {/* Confidence Label on Hover */}
                <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap z-30 pointer-events-none transition-opacity">
                  {Math.round(detection.confidence * 100)}%
                </div>

                {/* Visual Pattern */}
                <div className="w-full h-full opacity-30 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNCIgaGVpZ2h0PSI0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0xIDNoMXYxSDF6IiBmaWxsPSIjZmZmIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiLz48L3N2Zz4=')]"></div>
              </div>
            );
          })}

          {/* Current Time Indicator */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)] z-30 transition-all duration-75"
            style={{ left: `${(currentTime / duration) * 100}%` }}
          >
            <div className="absolute -top-1 -left-1.5 w-3 h-3 bg-blue-500 border-2 border-white rounded-full shadow-lg"></div>
          </div>

          {/* Hover Time Indicator */}
          {hoveredTime !== null && (
            <div
              className="absolute top-0 bottom-0 w-px bg-white/30 z-20 pointer-events-none dashed"
              style={{ left: `${(hoveredTime / duration) * 100}%` }}
            >
              <div className="absolute top-1 left-1 bg-slate-800/90 text-white text-[10px] px-2 py-1 rounded border border-slate-700 shadow-xl whitespace-nowrap font-mono">
                {formatTime(hoveredTime)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}