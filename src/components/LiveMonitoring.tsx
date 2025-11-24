"use client";

import { useState, useRef, useEffect } from 'react';
import { Camera, Square, Play, Pause, AlertTriangle, Shield, Zap, Activity, Radio, ArrowLeft } from 'lucide-react';

interface LiveDetection {
  id: string;
  timestamp: Date;
  confidence: number;
  type: string;
  description: string;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

interface LiveMonitoringProps {
  onBack: () => void;
}

export default function LiveMonitoring({ onBack }: LiveMonitoringProps) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [detections, setDetections] = useState<LiveDetection[]>([]);
  const [currentRiskLevel, setCurrentRiskLevel] = useState<'low' | 'medium' | 'high'>('low');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: false
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsStreaming(true);
        startMockDetection();
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
    setIsRecording(false);
  };

  const startMockDetection = () => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const detectionTypes = [
          { type: 'Suspicious Movement', confidence: 0.65 + Math.random() * 0.3 },
          { type: 'Aggressive Gesture', confidence: 0.70 + Math.random() * 0.25 },
          { type: 'Potential Weapon', confidence: 0.60 + Math.random() * 0.35 },
          { type: 'Physical Altercation', confidence: 0.75 + Math.random() * 0.20 }
        ];

        const detection = detectionTypes[Math.floor(Math.random() * detectionTypes.length)];

        const newDetection: LiveDetection = {
          id: Date.now().toString(),
          timestamp: new Date(),
          confidence: detection.confidence,
          type: detection.type,
          description: `Detected ${detection.type.toLowerCase()} with ${Math.round(detection.confidence * 100)}% confidence`,
          boundingBox: {
            x: Math.random() * 0.6,
            y: Math.random() * 0.6,
            width: 0.2 + Math.random() * 0.2,
            height: 0.2 + Math.random() * 0.2
          }
        };

        setDetections(prev => [newDetection, ...prev.slice(0, 9)]);
        setCurrentRiskLevel(detection.confidence > 0.8 ? 'high' : detection.confidence > 0.65 ? 'medium' : 'low');
      }
    }, 3000);

    return () => clearInterval(interval);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'text-red-400 bg-red-500/20 border-red-500/50 shadow-red-500/20';
      case 'medium': return 'text-orange-400 bg-orange-500/20 border-orange-500/50 shadow-orange-500/20';
      case 'low': return 'text-green-400 bg-green-500/20 border-green-500/50 shadow-green-500/20';
      default: return 'text-slate-400 bg-slate-500/20 border-slate-500/50';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString();
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col">
      {/* Header */}
      <div className="glass-strong border-b border-white/5 px-4 py-2 sticky top-0 z-40">
        <div className="max-w-[1920px] mx-auto flex items-center justify-between">
          <button
            onClick={onBack}
            className="group flex items-center space-x-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back</span>
          </button>

          <div className="flex items-center space-x-3">
            <Camera className="w-5 h-5 text-blue-500/80" />
            <h2 className="text-sm font-semibold text-slate-200 tracking-wide">Live Monitoring</h2>
          </div>

          <div className="w-16"></div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row flex-1">
        {/* Main Camera View */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Camera Controls Bar */}
            <div className="card p-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {!isStreaming ? (
                  <button
                    onClick={startCamera}
                    className="btn btn-primary flex items-center space-x-2 px-6 py-2.5"
                  >
                    <Camera className="w-5 h-5" />
                    <span>Start Camera</span>
                  </button>
                ) : (
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={stopCamera}
                      className="btn btn-secondary flex items-center space-x-2 px-4 py-2"
                    >
                      <Square className="w-4 h-4 fill-current" />
                      <span>Stop</span>
                    </button>

                    <button
                      onClick={() => setIsRecording(!isRecording)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all font-medium ${isRecording
                        ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30'
                        : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                        }`}
                    >
                      {isRecording ? (
                        <>
                          <Pause className="w-4 h-4 fill-current" />
                          <span>Recording...</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 fill-current" />
                          <span>Record</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Risk Level Indicator */}
              {isStreaming && (
                <div className={`px-4 py-2 rounded-lg border shadow-lg transition-all duration-300 ${getRiskColor(currentRiskLevel)}`}>
                  <div className="flex items-center space-x-2">
                    {currentRiskLevel === 'high' && <AlertTriangle className="w-5 h-5 animate-pulse" />}
                    {currentRiskLevel === 'medium' && <Activity className="w-5 h-5" />}
                    {currentRiskLevel === 'low' && <Shield className="w-5 h-5" />}
                    <span className="font-bold capitalize">{currentRiskLevel} Risk</span>
                  </div>
                </div>
              )}
            </div>

            {/* Camera Feed */}
            <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl border border-slate-800 aspect-video group">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {!isStreaming && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                      <Camera className="w-10 h-10 text-slate-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">Camera Offline</h3>
                    <p className="text-slate-400">Click "Start Camera" to begin real-time monitoring</p>
                  </div>
                </div>
              )}

              {/* Overlays */}
              {isStreaming && (
                <>
                  {/* Recording Indicator */}
                  {isRecording && (
                    <div className="absolute top-6 left-6 flex items-center space-x-2 bg-red-500/90 backdrop-blur-md text-white px-4 py-1.5 rounded-full shadow-lg animate-pulse">
                      <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                      <span className="text-sm font-bold tracking-wide">REC</span>
                    </div>
                  )}

                  {/* Live Indicator */}
                  <div className="absolute top-6 right-6 flex items-center space-x-2 bg-green-500/90 backdrop-blur-md text-white px-4 py-1.5 rounded-full shadow-lg">
                    <Radio className="w-4 h-4 animate-pulse" />
                    <span className="text-sm font-bold tracking-wide">LIVE</span>
                  </div>

                  {/* Grid Overlay */}
                  <div className="absolute inset-0 pointer-events-none opacity-20"
                    style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '100px 100px' }}>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Detection Panel */}
        <div className="w-full lg:w-96 bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col h-[400px] lg:h-auto">
          <div className="p-5 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <Activity className="w-5 h-5 text-blue-400" />
              <span>Live Detections</span>
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {detections.length === 0 ? (
              <div className="text-center py-12 flex flex-col items-center justify-center h-full">
                <Shield className="w-16 h-16 text-slate-700 mb-4" />
                <p className="text-slate-400 font-medium">System Secure</p>
                <p className="text-sm text-slate-500 mt-1">Monitoring for threats...</p>
              </div>
            ) : (
              detections.map((detection) => (
                <div key={detection.id} className="bg-slate-800/50 hover:bg-slate-800 rounded-xl p-4 border border-slate-700/50 transition-all duration-300 animate-fadeIn">
                  <div className="flex items-start justify-between mb-2">
                    <span className="font-semibold text-white text-sm">{detection.type}</span>
                    <span className="text-xs text-slate-400 font-mono">{formatTime(detection.timestamp)}</span>
                  </div>
                  <p className="text-xs text-slate-300 mb-3 leading-relaxed">{detection.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <Zap className="w-3 h-3 text-slate-500" />
                      <span className="text-xs text-slate-400">Confidence</span>
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${detection.confidence > 0.8 ? 'bg-red-500/20 text-red-400' :
                      detection.confidence > 0.65 ? 'bg-orange-500/20 text-orange-400' : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                      {Math.round(detection.confidence * 100)}%
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}