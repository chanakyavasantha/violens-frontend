"use client";

import { useRef, useState } from 'react';
import { Play, Pause, RotateCcw, Zap } from 'lucide-react';

interface VideoPlayerProps {
  videoUrl: string;
  onAnalyze: () => void;
  isAnalyzing: boolean;
}

export default function VideoPlayer({ videoUrl, onAnalyze, isAnalyzing }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

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
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const resetVideo = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      setCurrentTime(0);
      setIsPlaying(false);
      videoRef.current.pause();
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="card space-y-4">
      <h3 className="text-xl font-semibold text-white mb-4">Video Preview</h3>
      
      <div className="relative bg-black rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-auto max-h-96 object-contain"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
        />
        
        {/* Video Controls Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <div className="space-y-2">
            {/* Progress Bar */}
            <input
              type="range"
              min={0}
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1 bg-slate-600 rounded-lg appearance-none cursor-pointer slider"
            />
            
            {/* Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={togglePlay}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 text-white" />
                  ) : (
                    <Play className="w-5 h-5 text-white ml-0.5" />
                  )}
                </button>
                
                <button
                  onClick={resetVideo}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                >
                  <RotateCcw className="w-4 h-4 text-white" />
                </button>
                
                <span className="text-white text-sm">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Analysis Button */}
      <button
        onClick={onAnalyze}
        disabled={isAnalyzing}
        className={`
          w-full py-4 px-6 rounded-lg font-semibold text-white transition-all duration-300
          ${isAnalyzing 
            ? 'bg-slate-600 cursor-not-allowed' 
            : 'btn-secondary hover:scale-105'
          }
        `}
      >
        <div className="flex items-center justify-center space-x-2">
          <Zap className={`w-5 h-5 ${isAnalyzing ? 'animate-pulse' : ''}`} />
          <span>
            {isAnalyzing ? 'Analyzing Video...' : 'Analyze Video with AI'}
          </span>
        </div>
      </button>
    </div>
  );
}