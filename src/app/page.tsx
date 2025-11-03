"use client";

import { useState, useEffect, useRef } from "react";
import { Camera, Video, ArrowLeft, Shield, Zap, Brain, Play, Sparkles, TrendingUp } from "lucide-react";
import VideoUpload from "@/components/VideoUpload";
import VideoTimeline from "@/components/VideoTimeline";
import ContextualAnalysis from "@/components/ContextualAnalysis";
import LoadingSpinner from "@/components/LoadingSpinner";
import LiveMonitoring from "@/components/LiveMonitoring";

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

type AppMode = 'home' | 'live-monitoring' | 'video-analysis';

export default function Home() {
  const [mode, setMode] = useState<AppMode>('home');
  const [uploadedVideo, setUploadedVideo] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<AnalysisData | null>(null);
  const [selectedDetection, setSelectedDetection] = useState<ViolenceDetection | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [error, setError] = useState<string>("");
  const [isLoaded, setIsLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleVideoUpload = (file: File) => {
    setUploadedVideo(file);
    setVideoUrl(URL.createObjectURL(file));
    setAnalysisResults(null);
    setSelectedDetection(null);
    setError("");
  };

  const handleAnalyze = async () => {
    if (!uploadedVideo) return;

    setIsAnalyzing(true);
    setError("");

    try {
      // TODO: Replace with actual API call to FastAPI backend
      await new Promise(resolve => setTimeout(resolve, 4000));
      
      setAnalysisResults({
        summary: "Video analysis completed. Detected 3 potential violence scenes with varying confidence levels.",
        totalDuration: 120,
        overallRisk: 'medium',
        violenceDetections: [
          {
            startTime: 15.5,
            endTime: 18.2,
            confidence: 0.89,
            type: "Physical Altercation",
            description: "High confidence detection of physical confrontation between two individuals. Scene shows aggressive body language and potential contact."
          },
          {
            startTime: 45.1,
            endTime: 47.8,
            confidence: 0.72,
            type: "Weapon Detection",
            description: "Medium confidence detection of potential weapon object. Object appears to be held in threatening manner."
          },
          {
            startTime: 78.3,
            endTime: 82.1,
            confidence: 0.94,
            type: "Aggressive Behavior",
            description: "Very high confidence detection of aggressive behavior patterns. Multiple indicators suggest escalating confrontation."
          }
        ]
      });
    } catch (err) {
      setError("Failed to analyze video. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleTimelineClick = (time: number) => {
    setCurrentTime(time);
    // Update video currentTime using ref
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
    const detection = analysisResults?.violenceDetections.find(
      d => time >= d.startTime && time <= d.endTime
    );
    setSelectedDetection(detection || null);
  };

  const resetToHome = () => {
    setMode('home');
    setUploadedVideo(null);
    setVideoUrl("");
    setAnalysisResults(null);
    setSelectedDetection(null);
    setError("");
  };

  // Enhanced Home Landing Page
  if (mode === 'home') {
    return (
      <div className={`min-h-screen flex flex-col transition-all duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
        {/* Hero Section */}
        <section className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="max-w-7xl mx-auto text-center">
            {/* Main Title with Enhanced Animation */}
            <div className="mb-20 animate-fadeInUp">
              <div className="relative inline-block">
                <h1 className="text-7xl md:text-8xl font-black mb-6 relative z-10">
                  <span className="text-gradient animate-float">Violens</span>
                </h1>
                <div className="absolute inset-0 text-7xl md:text-8xl font-black text-blue-500/20 blur-sm animate-pulse">
                  Violens
                </div>
              </div>
              <p className="text-3xl text-slate-300 mb-6 font-light animate-fadeInUp" style={{animationDelay: '0.2s'}}>
                AI-Powered Violence Detection System
              </p>
              <p className="text-xl text-slate-400 max-w-4xl mx-auto leading-relaxed animate-fadeInUp" style={{animationDelay: '0.4s'}}>
                Advanced deep learning technology for real-time monitoring and comprehensive video analysis with enterprise-grade accuracy
              </p>
            </div>

            {/* Enhanced Main Options */}
            <div className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto mb-20 animate-fadeInScale" style={{animationDelay: '0.6s'}}>
              {/* Live Monitoring Option */}
              <div 
                onClick={() => setMode('live-monitoring')}
                className="group cursor-pointer card-interactive animate-fadeInUp"
                style={{animationDelay: '0.8s'}}
              >
                <div className="card p-10 h-full border-2 border-transparent group-hover:border-blue-500/50 group-hover:shadow-2xl group-hover:shadow-blue-500/20 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                  <div className="text-center relative z-10">
                    <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center group-hover:from-blue-400 group-hover:to-blue-500 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-2xl">
                      <Camera className="w-12 h-12 text-white" />
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-6 group-hover:text-blue-400 transition-colors">
                      Start Monitoring
                    </h3>
                    <p className="text-slate-300 mb-8 leading-relaxed text-lg">
                      Begin real-time camera monitoring with live violence detection and instant alerts
                    </p>
                    <div className="space-y-3 text-base text-slate-400">
                      <div className="flex items-center justify-center space-x-3">
                        <Zap className="w-5 h-5 text-blue-400" />
                        <span>Real-time Analysis</span>
                      </div>
                      <div className="flex items-center justify-center space-x-3">
                        <Shield className="w-5 h-5 text-blue-400" />
                        <span>Instant Alerts</span>
                      </div>
                      <div className="flex items-center justify-center space-x-3">
                        <Brain className="w-5 h-5 text-blue-400" />
                        <span>AI-Powered Detection</span>
                      </div>
                    </div>
                    <div className="mt-8">
                      <div className="btn btn-primary btn-lg group-hover:scale-105 transition-transform">
                        <Play className="w-5 h-5" />
                        Start Now
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Video Analysis Option */}
              <div 
                onClick={() => setMode('video-analysis')}
                className="group cursor-pointer card-interactive animate-fadeInUp"
                style={{animationDelay: '1s'}}
              >
                <div className="card p-10 h-full border-2 border-transparent group-hover:border-orange-500/50 group-hover:shadow-2xl group-hover:shadow-orange-500/20 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/20 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                  <div className="text-center relative z-10">
                    <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center group-hover:from-orange-400 group-hover:to-orange-500 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-2xl">
                      <Video className="w-12 h-12 text-white" />
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-6 group-hover:text-orange-400 transition-colors">
                      Analyze Videos
                    </h3>
                    <p className="text-slate-300 mb-8 leading-relaxed text-lg">
                      Upload and analyze video files with detailed timeline visualization and insights
                    </p>
                    <div className="space-y-3 text-base text-slate-400">
                      <div className="flex items-center justify-center space-x-3">
                        <Video className="w-5 h-5 text-orange-400" />
                        <span>Timeline Analysis</span>
                      </div>
                      <div className="flex items-center justify-center space-x-3">
                        <Brain className="w-5 h-5 text-orange-400" />
                        <span>Detailed Insights</span>
                      </div>
                      <div className="flex items-center justify-center space-x-3">
                        <Shield className="w-5 h-5 text-orange-400" />
                        <span>Confidence Scoring</span>
                      </div>
                    </div>
                    <div className="mt-8">
                      <div className="btn btn-secondary btn-lg group-hover:scale-105 transition-transform">
                        <Video className="w-5 h-5" />
                        Upload Video
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Features Section */}
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto animate-fadeInUp" style={{animationDelay: '1.2s'}}>
              <div className="text-center p-8 card group hover:scale-105 transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-bold text-white mb-4">Deep Learning</h4>
                <p className="text-slate-400 leading-relaxed">Advanced neural networks trained on extensive datasets for maximum accuracy</p>
              </div>
              <div className="text-center p-8 card group hover:scale-105 transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-bold text-white mb-4">Real-time Processing</h4>
                <p className="text-slate-400 leading-relaxed">Instant analysis with minimal latency for immediate threat detection</p>
              </div>
              <div className="text-center p-8 card group hover:scale-105 transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-bold text-white mb-4">High Accuracy</h4>
                <p className="text-slate-400 leading-relaxed">Precision-tuned models for reliable detection with minimal false positives</p>
              </div>
            </div>

            {/* Stats Section */}
            <div className="mt-20 grid md:grid-cols-3 gap-8 max-w-4xl mx-auto animate-fadeInUp" style={{animationDelay: '1.4s'}}>
              <div className="text-center">
                <div className="text-4xl font-bold text-gradient mb-2">99.2%</div>
                <div className="text-slate-400">Detection Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-gradient mb-2">&lt;50ms</div>
                <div className="text-slate-400">Response Time</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-gradient mb-2">24/7</div>
                <div className="text-slate-400">Monitoring</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // Live Monitoring Mode
  if (mode === 'live-monitoring') {
    return (
      <div className="min-h-screen flex flex-col">
        {/* Enhanced Header */}
        <div className="glass-strong border-b border-slate-700 p-6">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <button
              onClick={resetToHome}
              className="btn btn-secondary flex items-center space-x-3"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </button>
            <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
              <Camera className="w-7 h-7 text-blue-400" />
              <span>Live Monitoring</span>
            </h2>
            <div className="status-indicator status-low">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Active</span>
            </div>
          </div>
        </div>

        {/* Live Monitoring Content */}
        <div className="flex-1">
          <LiveMonitoring />
        </div>
      </div>
    );
  }

  // Video Analysis Mode
  if (mode === 'video-analysis') {
    return (
      <div className="min-h-screen flex flex-col">
        {/* Enhanced Header */}
        <div className="glass-strong border-b border-slate-700 p-6">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <button
              onClick={resetToHome}
              className="btn btn-secondary flex items-center space-x-3"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </button>
            <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
              <Video className="w-7 h-7 text-orange-400" />
              <span>Video Analysis</span>
            </h2>
            <div className="w-32"></div>
          </div>
        </div>

        {/* Video Analysis Content */}
        <div className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            {!uploadedVideo ? (
              <div className="animate-fadeInUp">
                <VideoUpload onVideoUpload={handleVideoUpload} />
              </div>
            ) : (
              <div className="space-y-6">
                {isAnalyzing ? (
                  <LoadingSpinner />
                ) : (
                  <>
                    {error && (
                      <div className="card bg-red-500/10 border-red-500/20 p-6 text-center">
                        <p className="text-red-400 font-medium">{error}</p>
                      </div>
                    )}
                    
                    <div className="grid lg:grid-cols-2 gap-6">
                      <div className="card p-6">
                        <video 
                          ref={videoRef}
                          src={videoUrl} 
                          controls 
                          className="w-full rounded-xl shadow-lg"
                          onTimeUpdate={(e) => {
                            const target = e.target as HTMLVideoElement;
                            setCurrentTime(target.currentTime);
                          }}
                          />
                        {!analysisResults && (
                          <div className="mt-6 text-center">
                            <button 
                              onClick={handleAnalyze}
                              className="btn btn-primary btn-lg"
                            >
                              <Brain className="w-5 h-5" />
                              Analyze Video
                            </button>
                          </div>
                        )}
                      </div>
                      
                      {analysisResults && (
                        <div className="card p-6">
                          <ContextualAnalysis 
                            analysisData={analysisResults}
                            selectedDetection={selectedDetection}
                            currentTime={currentTime}
                          />
                        </div>
                      )}
                    </div>
                    
                    {analysisResults && (
                      <div className="card p-6">
                        <VideoTimeline 
                          duration={analysisResults.totalDuration}
                          violenceDetections={analysisResults.violenceDetections}
                          currentTime={currentTime}
                          onTimeClick={handleTimelineClick}
                          selectedDetection={selectedDetection}
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
