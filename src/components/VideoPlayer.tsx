"use client";

import { useRef, useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Zap, AlertTriangle, RefreshCw, Brain } from 'lucide-react';

interface VideoPlayerProps {
  videoUrl: string;
  onAnalyze?: () => void;
  isAnalyzing?: boolean;
  onTimeUpdate?: (currentTime: number) => void;
  onDurationChange?: (duration: number) => void;
  canPreview?: boolean;
  onConvert?: () => void;
  isConverting?: boolean;
  convertProgress?: number;
}

export default function VideoPlayer({
  videoUrl,
  onAnalyze,
  isAnalyzing = false,
  onTimeUpdate,
  onDurationChange,
  canPreview = true,
  onConvert,
  isConverting = false,
  convertProgress = 0
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    // Reset state when videoUrl changes
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setError("");
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, [videoUrl]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const time = videoRef.current.currentTime;
      setCurrentTime(time);
      if (onTimeUpdate) onTimeUpdate(time);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const dur = videoRef.current.duration;
      setDuration(dur);
      if (onDurationChange) onDurationChange(dur);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
      if (onTimeUpdate) onTimeUpdate(time);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative w-full h-full bg-black rounded-xl overflow-hidden group border border-white/5 shadow-2xl">
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full h-full object-contain"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        onClick={togglePlay}
      />

      {/* Overlay Controls */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center space-x-3 flex-1">
            <button
              onClick={togglePlay}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md transition-all transform hover:scale-105"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 text-white" />
              ) : (
                <Play className="w-4 h-4 text-white ml-0.5" />
              )}
            </button>

            <button
              onClick={() => {
                if (videoRef.current) {
                  videoRef.current.currentTime = 0;
                  setCurrentTime(0);
                }
              }}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5 text-white" />
            </button>

            <div className="flex-1 mx-2 group/scrubber relative">
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-0.5 bg-white/30 rounded-lg appearance-none cursor-pointer hover:h-1 transition-all accent-blue-500"
              />
            </div>

            <div className="text-white font-mono text-[10px] bg-black/50 px-2 py-0.5 rounded shrink-0">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          {!isAnalyzing && onAnalyze && (
            <button
              onClick={onAnalyze}
              className="btn btn-primary btn-sm flex items-center space-x-1.5 shadow-lg shadow-blue-500/20 ml-2 shrink-0 text-[10px] px-3 py-1.5 h-auto"
            >
              <Brain className="w-3.5 h-3.5" />
              <span>Analyze</span>
            </button>
          )}
        </div>
      </div>

      {/* Conversion Overlay */}
      {!canPreview && (
        <div className="absolute inset-0 bg-[#0a0a0f]/90 flex flex-col items-center justify-center z-20 p-6 text-center">
          <AlertTriangle className="w-8 h-8 text-yellow-400 mb-3" />
          <h3 className="text-sm font-bold text-white mb-1">Format Not Supported</h3>
          <p className="text-slate-400 mb-4 max-w-xs text-xs">
            Convert to MP4 to preview and analyze.
          </p>
          {isConverting ? (
            <div className="w-full max-w-[200px]">
              <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                <span>Converting...</span>
                <span>{convertProgress}%</span>
              </div>
              <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${convertProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <button
              onClick={onConvert}
              className="btn btn-primary btn-sm text-xs"
            >
              Convert to MP4
            </button>
          )}
        </div>
      )}

      {/* Loading Overlay */}
      {isAnalyzing && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="text-center">
            <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3 mx-auto"></div>
            <p className="text-blue-400 font-medium animate-pulse text-xs uppercase tracking-wide">Analyzing...</p>
          </div>
        </div>
      )}
    </div>
  );
}