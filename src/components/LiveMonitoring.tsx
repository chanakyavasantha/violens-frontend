"use client";

import { useState, useRef, useEffect } from 'react';
import { Camera, Square, Play, Pause, AlertTriangle, Shield, Zap } from 'lucide-react';

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

export default function LiveMonitoring() {
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
        
        // Start mock detection simulation
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
    // Simulate real-time detection events
    const interval = setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance of detection
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
        
        setDetections(prev => [newDetection, ...prev.slice(0, 9)]); // Keep last 10 detections
        
        // Update risk level based on recent detections
        setCurrentRiskLevel(detection.confidence > 0.8 ? 'high' : detection.confidence > 0.65 ? 'medium' : 'low');
      }
    }, 3000); // Check every 3 seconds
    
    return () => clearInterval(interval);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'text-red-400 bg-red-500/20 border-red-500/50';
      case 'medium': return 'text-orange-400 bg-orange-500/20 border-orange-500/50';
      case 'low': return 'text-green-400 bg-green-500/20 border-green-500/50';
      default: return 'text-slate-400 bg-slate-500/20 border-slate-500/50';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString();
  };

  return (
    <div className="flex h-full">
      {/* Main Camera View */}
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Camera Controls */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {!isStreaming ? (
                <button
                  onClick={startCamera}
                  className="btn-primary flex items-center space-x-2 px-6 py-3"
                >
                  <Camera className="w-5 h-5" />
                  <span>Start Camera</span>
                </button>
              ) : (
                <div className="flex items-center space-x-3">
                  <button
                    onClick={stopCamera}
                    className="btn-secondary flex items-center space-x-2 px-4 py-2"
                  >
                    <Square className="w-4 h-4" />
                    <span>Stop</span>
                  </button>
                  
                  <button
                    onClick={() => setIsRecording(!isRecording)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                      isRecording 
                        ? 'bg-red-500 hover:bg-red-600 text-white' 
                        : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                    }`}
                  >
                    {isRecording ? (
                      <>
                        <Pause className="w-4 h-4" />
                        <span>Recording...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        <span>Record</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
            
            {/* Risk Level Indicator */}
            {isStreaming && (
              <div className={`px-4 py-2 rounded-lg border ${getRiskColor(currentRiskLevel)}`}>
                <div className="flex items-center space-x-2">
                  {currentRiskLevel === 'high' && <AlertTriangle className="w-4 h-4" />}
                  {currentRiskLevel === 'medium' && <Zap className="w-4 h-4" />}
                  {currentRiskLevel === 'low' && <Shield className="w-4 h-4" />}
                  <span className="font-semibold capitalize">{currentRiskLevel} Risk</span>
                </div>
              </div>
            )}
          </div>
          
          {/* Camera Feed */}
          <div className="relative bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-96 object-cover"
            />
            
            {!isStreaming && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                <div className="text-center">
                  <Camera className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                  <p className="text-slate-400">Camera not active</p>
                  <p className="text-sm text-slate-500">Click "Start Camera" to begin monitoring</p>
                </div>
              </div>
            )}
            
            {/* Recording Indicator */}
            {isRecording && (
              <div className="absolute top-4 left-4 flex items-center space-x-2 bg-red-500/90 text-white px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">REC</span>
              </div>
            )}
            
            {/* Live Indicator */}
            {isStreaming && (
              <div className="absolute top-4 right-4 flex items-center space-x-2 bg-green-500/90 text-white px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">LIVE</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Detection Panel */}
      <div className="w-80 bg-slate-900 border-l border-slate-700 p-4">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-orange-400" />
          <span>Live Detections</span>
        </h3>
        
        {detections.length === 0 ? (
          <div className="text-center py-8">
            <Shield className="w-12 h-12 text-slate-500 mx-auto mb-3" />
            <p className="text-slate-400">No detections</p>
            <p className="text-sm text-slate-500">System is monitoring...</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {detections.map((detection) => (
              <div key={detection.id} className="bg-slate-800 rounded-lg p-3 border-l-4 border-orange-500">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-sm font-medium text-white">{detection.type}</span>
                  <span className="text-xs text-slate-400">{formatTime(detection.timestamp)}</span>
                </div>
                <p className="text-sm text-slate-300 mb-2">{detection.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Confidence</span>
                  <span className={`text-xs font-medium ${
                    detection.confidence > 0.8 ? 'text-red-400' :
                    detection.confidence > 0.65 ? 'text-orange-400' : 'text-yellow-400'
                  }`}>
                    {Math.round(detection.confidence * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}