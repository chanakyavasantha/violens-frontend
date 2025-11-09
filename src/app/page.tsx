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
  const [previewWarning, setPreviewWarning] = useState<string>("");
  const [canPreview, setCanPreview] = useState<boolean>(true);
  const [isConverting, setIsConverting] = useState(false);
  const [convertProgress, setConvertProgress] = useState(0);
  const ffmpegRef = useRef<any>(null);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Load FFmpeg dynamically when needed
  const ensureFFmpeg = async () => {
    if (!ffmpegRef.current) {
      try {
        // Dynamic import of @ffmpeg/ffmpeg (v0.12.x API)
        const { FFmpeg } = await import('@ffmpeg/ffmpeg');
        const { fetchFile } = await import('@ffmpeg/util');
        const { toBlobURL } = await import('@ffmpeg/util');
        
        const ffmpeg = new FFmpeg();
        
        ffmpeg.on('log', ({ message }: any) => {
          console.log(message);
        });
        
        ffmpeg.on('progress', ({ progress }: any) => {
          setConvertProgress(Math.round((progress || 0) * 100));
        });
        
        // Load FFmpeg core
        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
        await ffmpeg.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        });
        
        ffmpegRef.current = { ffmpeg, fetchFile };
      } catch (err) {
        throw new Error('Failed to load FFmpeg. Please ensure @ffmpeg/ffmpeg and @ffmpeg/util are installed.');
      }
    }
  };

  const handleVideoUpload = (file: File) => {
    // Revoke previous object URL to avoid memory leaks
    if (videoUrl) {
      try {
        URL.revokeObjectURL(videoUrl);
      } catch (e) {
        console.error('Failed to revoke object URL:', e);
      }
    }
    setUploadedVideo(file);
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    setAnalysisResults(null);
    setSelectedDetection(null);
    setError("");
    setPreviewWarning("");
    setCanPreview(true); // Reset preview capability for new video
  };

  const handleAnalyze = async () => {
    if (!uploadedVideo) return;

    setIsAnalyzing(true);
    setError("");

    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL ||
        (typeof window !== "undefined" ? `http://${window.location.hostname}:8000` : "");

      if (!baseUrl) {
        throw new Error("API base URL is not configured (NEXT_PUBLIC_API_BASE_URL).");
      }

      const formData = new FormData();
      formData.append("file", uploadedVideo);

      const res = await fetch(`${baseUrl}/analysis`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Analysis failed (${res.status}): ${text}`);
      }

      const data = await res.json();

      const mapped: AnalysisData = {
        summary: data.summary ?? "Analysis completed.",
        totalDuration: data.totalDuration ?? (videoRef.current?.duration ?? 0),
        overallRisk: data.overallRisk ?? "low",
        violenceDetections: data.violenceDetections ?? [],
      };

      setAnalysisResults(mapped);
    } catch (err: any) {
      setError(err?.message || "Failed to analyze video. Please try again.");
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

  const handleConvertForPreview = async () => {
    if (!uploadedVideo) return;
    
    try {
      setIsConverting(true);
      setConvertProgress(0);
      setError("");
      
      await ensureFFmpeg();
      
      if (!ffmpegRef.current) {
        throw new Error('FFmpeg not loaded');
      }
      
      const { ffmpeg, fetchFile } = ffmpegRef.current;

      const ext = uploadedVideo.name.split(".").pop()?.toLowerCase() || "avi";
      const inputName = `input.${ext}`;

      // Write the file to FFmpeg's virtual filesystem (new API)
      await ffmpeg.writeFile(inputName, await fetchFile(uploadedVideo));
      
      // Convert to MP4 with web-compatible settings
      await ffmpeg.exec([
        "-i", inputName,
        "-c:v", "libx264",
        "-c:a", "aac",
        "-movflags", "faststart",
        "-preset", "fast",
        "output.mp4"
      ]);

      // Read the converted file (new API)
      const data = await ffmpeg.readFile("output.mp4");
      const convertedBlob = new Blob([data], { type: "video/mp4" });
      const url = URL.createObjectURL(convertedBlob);

      // Clean up old URL
      if (videoUrl) { 
        try { 
          URL.revokeObjectURL(videoUrl); 
        } catch (e) {
          console.error('Failed to revoke object URL:', e);
        } 
      }
      
      setVideoUrl(url);
      setCanPreview(true);
      setPreviewWarning("");
      
      // Clean up FFmpeg virtual filesystem (new API)
      try {
        await ffmpeg.deleteFile(inputName);
        await ffmpeg.deleteFile("output.mp4");
      } catch (e) {
        console.warn('Failed to clean up FFmpeg files:', e);
      }
      
    } catch (e: any) {
      console.error('Conversion error:', e);
      setError(e?.message || "Conversion failed. Try manually converting to MP4/WebM.");
    } finally {
      setIsConverting(false);
      setConvertProgress(0);
    }
  };

  const resetToHome = () => {
    // Clean up video URL
    if (videoUrl) {
      try {
        URL.revokeObjectURL(videoUrl);
      } catch (e) {
        console.error('Failed to revoke object URL:', e);
      }
    }
    
    setMode('home');
    setUploadedVideo(null);
    setVideoUrl("");
    setAnalysisResults(null);
    setSelectedDetection(null);
    setError("");
    setPreviewWarning("");
    setCanPreview(true);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (videoUrl) {
        try {
          URL.revokeObjectURL(videoUrl);
        } catch (e) {
          console.error('Failed to revoke object URL:', e);
        }
      }
    };
  }, [videoUrl]);

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
                        {canPreview ? (
                          <video
                            key={videoUrl}
                            ref={videoRef}
                            controls
                            playsInline
                            preload="metadata"
                            className="w-full rounded-xl shadow-lg"
                            src={videoUrl}
                            onLoadedMetadata={(e) => {
                              const target = e.target as HTMLVideoElement;
                              setCurrentTime(0);
                            }}
                            onTimeUpdate={(e) => {
                              const target = e.target as HTMLVideoElement;
                              setCurrentTime(target.currentTime);
                            }}
                            onError={() => {
                              setPreviewWarning(
                                "Preview not supported for this format in this browser. You can still analyze the video."
                              );
                              setCanPreview(false);
                            }}
                          />
                        ) : (
                          <div className="rounded-xl p-4 bg-slate-800 border border-slate-700">
                            <p className="text-slate-300">
                              Preview not supported for this format in this browser. You can still analyze the video.
                            </p>
                            <div className="mt-3">
                              <button
                                onClick={handleConvertForPreview}
                                disabled={isConverting}
                                className="btn btn-secondary"
                              >
                                {isConverting ? `Converting (${convertProgress}%)` : "Convert for Preview"}
                              </button>
                            </div>
                            <p className="mt-2 text-xs text-slate-400">
                              Conversion runs locally; large files may take time.
                            </p>
                          </div>
                        )}
                
                        {previewWarning && (
                          <p className="mt-2 text-sm text-slate-300">{previewWarning}</p>
                        )}
                
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