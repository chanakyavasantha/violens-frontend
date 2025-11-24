"use client";

import { useState, useEffect, useRef } from "react";
import { Camera, Video, ArrowLeft, Brain, Activity } from "lucide-react";
import VideoUpload from "@/components/VideoUpload";
import VideoPlayer from "@/components/VideoPlayer";
import VideoTimeline from "@/components/VideoTimeline";
import ContextualAnalysis from "@/components/ContextualAnalysis";
import LoadingSpinner from "@/components/LoadingSpinner";
import LiveMonitoring from "@/components/LiveMonitoring";
import HomeView from "@/components/HomeView";
import AnalysisResults from "@/components/AnalysisResults";
import MetricsDashboard from "@/components/MetricsDashboard";
import FeedbackForm from "@/components/FeedbackForm";

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
  confidence: number;
  objects: string[];
  emotions: string[];
  scenes: string[];
}

type AppMode = 'home' | 'live-monitoring' | 'video-analysis' | 'metrics';

export default function Home() {
  const [mode, setMode] = useState<AppMode>('home');
  const [uploadedVideo, setUploadedVideo] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<AnalysisData | null>(null);
  const [selectedDetection, setSelectedDetection] = useState<ViolenceDetection | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [error, setError] = useState<string>("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const [previewWarning, setPreviewWarning] = useState<string>("");
  const [canPreview, setCanPreview] = useState<boolean>(true);
  const [isConverting, setIsConverting] = useState(false);
  const [convertProgress, setConvertProgress] = useState(0);

  // FFmpeg refs
  type FFmpegAPI = {
    on: (event: 'log' | 'progress', callback: (payload: unknown) => void) => void;
    load: (opts: { coreURL: string; wasmURL: string }) => Promise<void>;
    writeFile: (name: string, data: Uint8Array) => Promise<void>;
    readFile: (name: string) => Promise<Uint8Array>;
    deleteFile: (name: string) => Promise<void>;
    exec: (args: string[]) => Promise<void>;
  };
  type FetchFileFn = (input: File | Blob | string) => Promise<Uint8Array>;
  const ffmpegRef = useRef<{ ffmpeg: unknown; fetchFile: FetchFileFn } | null>(null);

  // Load FFmpeg dynamically when needed
  const ensureFFmpeg = async () => {
    if (!ffmpegRef.current) {
      try {
        const { FFmpeg } = await import('@ffmpeg/ffmpeg');
        const { fetchFile } = await import('@ffmpeg/util');
        const { toBlobURL } = await import('@ffmpeg/util');

        const ffmpeg = new FFmpeg();

        ffmpeg.on('log', (payload: unknown) => {
          const message = (payload as { message?: string })?.message;
          if (message) console.log(message);
        });

        ffmpeg.on('progress', (payload: unknown) => {
          const value = (payload as { progress?: number })?.progress ?? 0;
          setConvertProgress(Math.round(value * 100));
        });

        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
        await ffmpeg.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        });

        ffmpegRef.current = { ffmpeg, fetchFile };
      } catch {
        throw new Error('Failed to load FFmpeg. Please ensure @ffmpeg/ffmpeg and @ffmpeg/util are installed.');
      }
    }
  };

  const handleVideoUpload = (file: File) => {
    // Revoke previous object URL
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

    // Check for formats that browsers typically can't play natively
    const ext = file.name.split('.').pop()?.toLowerCase();
    const needsConversion = ext === 'avi' || ext === 'mkv' || ext === 'flv' || ext === 'wmv';

    setCanPreview(!needsConversion);
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

      // Map backend response to frontend interface
      const mapped: AnalysisData = {
        summary: data.summary ?? "Analysis completed.",
        totalDuration: data.totalDuration ?? (videoRef.current?.duration ?? 0),
        overallRisk: data.overallRisk ?? "low",
        violenceDetections: data.violenceDetections ?? [],
        confidence: data.confidence ?? 0,
        objects: data.objects ?? [],
        emotions: data.emotions ?? [],
        scenes: data.scenes ?? [],
      };

      setAnalysisResults(mapped);
    } catch (err: unknown) {
      const msg = (err as Error)?.message;
      setError(msg || "Failed to analyze video. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleTimelineClick = (time: number) => {
    setCurrentTime(time);
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
      const core = ffmpeg as FFmpegAPI;

      const ext = uploadedVideo.name.split(".").pop()?.toLowerCase() || "avi";
      const inputName = `input.${ext}`;

      await core.writeFile(inputName, await fetchFile(uploadedVideo));

      await core.exec([
        "-i", inputName,
        "-c:v", "libx264",
        "-c:a", "aac",
        "-movflags", "faststart",
        "-preset", "fast",
        "output.mp4"
      ]);

      const data = await core.readFile("output.mp4");
      const convertedBlob = new Blob([data.buffer as ArrayBuffer], { type: "video/mp4" });
      const url = URL.createObjectURL(convertedBlob);

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

      try {
        await core.deleteFile(inputName);
        await core.deleteFile("output.mp4");
      } catch (e) {
        console.warn('Failed to clean up FFmpeg files:', e);
      }

    } catch (e: unknown) {
      console.error('Conversion error:', e);
      const msg = (e as Error)?.message;
      setError(msg || "Conversion failed. Try manually converting to MP4/WebM.");
    } finally {
      setIsConverting(false);
      setConvertProgress(0);
    }
  };

  const resetToHome = () => {
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

  // Render Views
  if (mode === 'home') {
    return (
      <HomeView
        onVideoAnalysisClick={() => setMode('video-analysis')}
        onLiveMonitoringClick={() => setMode('live-monitoring')}
        onMetricsClick={() => setMode('metrics')}
      />
    );
  }

  if (mode === 'live-monitoring') {
    return (
      <LiveMonitoring
        onBack={() => setMode('home')}
      />
    );
  }

  if (mode === 'metrics') {
    return <MetricsDashboard />;
  }

  if (mode === 'video-analysis') {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex flex-col font-sans antialiased selection:bg-blue-500/30">
        {/* Header */}
        <div className="glass-strong border-b border-white/5 px-4 py-2 z-40 sticky top-0">
          <div className="max-w-[1920px] mx-auto flex items-center justify-between">
            <button
              onClick={resetToHome}
              className="group flex items-center space-x-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span>Back</span>
            </button>

            <div className="flex items-center space-x-3">
              <Video className="w-5 h-5 text-blue-500/80" />
              <h2 className="text-sm font-semibold text-slate-200 tracking-wide">Video Analysis Dashboard</h2>
            </div>

            <div className="w-16"></div>
          </div>
        </div>

        <div className="flex-1 p-6">
          <div className="max-w-[1920px] mx-auto">
            {!uploadedVideo ? (
              <div className="animate-fadeInUp flex items-center justify-center min-h-[80vh]">
                <div className="w-full max-w-lg">
                  <VideoUpload onVideoUpload={handleVideoUpload} />
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {isAnalyzing ? (
                  <div className="flex items-center justify-center min-h-[80vh]">
                    <LoadingSpinner />
                  </div>
                ) : (
                  <>
                    {error && (
                      <div className="card bg-red-500/5 border-red-500/10 p-3 text-center">
                        <p className="text-red-400 font-medium text-sm">{error}</p>
                      </div>
                    )}

                    {/* Main Dashboard Grid */}
                    <div className="grid grid-cols-12 gap-6">
                      {/* Left: Video Player */}
                      <div className="col-span-5">
                        <div className="card p-4 bg-[#0f0f13] border border-white/5 rounded-xl shadow-2xl">
                          <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                            <Video className="w-4 h-4 text-blue-400" />
                            Video Feed
                          </h3>
                          <div className="aspect-video bg-black rounded-lg overflow-hidden border border-white/5">
                            <VideoPlayer
                              videoUrl={videoUrl}
                              onAnalyze={!analysisResults ? handleAnalyze : undefined}
                              isAnalyzing={isAnalyzing}
                              onTimeUpdate={(time) => setCurrentTime(time)}
                              canPreview={canPreview}
                              onConvert={handleConvertForPreview}
                              isConverting={isConverting}
                              convertProgress={convertProgress}
                            />
                          </div>
                        </div>

                        {/* Assessment Stats */}
                        {analysisResults && (
                          <div className="mt-6">
                            <ContextualAnalysis
                              analysisData={analysisResults}
                              selectedDetection={selectedDetection}
                              variant="stats"
                            />
                          </div>
                        )}
                      </div>

                      {/* Right: Analysis & Timeline */}
                      <div className="col-span-7 flex flex-col gap-6">
                        {/* Contextual Analysis */}
                        {analysisResults && (
                          <div className="card p-5 bg-[#0f0f13] border border-white/5 rounded-xl shadow-2xl">
                            <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                              <Brain className="w-4 h-4 text-purple-400" />
                              Contextual Analysis
                            </h3>
                            <div className="prose prose-invert prose-sm max-w-none">
                              <div className="bg-white/[0.02] rounded-lg p-4 border border-white/5">
                                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                                  {analysisResults.summary}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Detection Timeline Combined */}
                        {analysisResults && (
                          <div className="card p-5 bg-[#0f0f13] border border-white/5 rounded-xl shadow-2xl">
                            <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                              <Activity className="w-4 h-4 text-orange-400" />
                              Detection Timeline
                            </h3>

                            {/* Timeline Component */}
                            <div className="mb-4">
                              <VideoTimeline
                                duration={analysisResults.totalDuration}
                                violenceDetections={analysisResults.violenceDetections}
                                currentTime={currentTime}
                                onTimeClick={handleTimelineClick}
                                selectedDetection={selectedDetection}
                              />
                            </div>

                            {/* Detection Details */}
                            {selectedDetection ? (
                              <div className="mt-4 p-4 bg-white/[0.02] rounded-lg border border-white/5">
                                <div className="flex items-center justify-between mb-3">
                                  <h4 className="text-sm font-semibold text-white">Selected Detection</h4>
                                  <span className={`px-2 py-1 rounded text-xs font-medium ${selectedDetection.confidence >= 0.8 ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                    selectedDetection.confidence >= 0.6 ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                                      'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                                    }`}>
                                    {Math.round(selectedDetection.confidence * 100)}% Confidence
                                  </span>
                                </div>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-slate-400">Type:</span>
                                    <span className="text-slate-200 font-medium">{selectedDetection.type}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-400">Time Range:</span>
                                    <span className="text-slate-200 font-mono">
                                      {Math.floor(selectedDetection.startTime)}s - {Math.floor(selectedDetection.endTime)}s
                                    </span>
                                  </div>
                                  <div className="mt-3 pt-3 border-t border-white/5">
                                    <p className="text-slate-300 text-sm leading-relaxed">
                                      {selectedDetection.description}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="mt-4 p-4 bg-blue-500/5 rounded-lg border border-blue-500/10 text-center">
                                <p className="text-blue-400 text-sm">Click on a detection in the timeline to view details</p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Feedback Form */}
                        {analysisResults && (
                          <div className="mt-6">
                            <FeedbackForm analysisId="latest" />
                          </div>
                        )}
                      </div>
                    </div>
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