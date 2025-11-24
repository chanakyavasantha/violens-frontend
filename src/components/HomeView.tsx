"use client";

import { Camera, Video, Shield, Zap, Brain, Play, CheckCircle, ArrowRight, BarChart3 } from "lucide-react";

interface HomeViewProps {
    onVideoAnalysisClick: () => void;
    onLiveMonitoringClick: () => void;
    onMetricsClick: () => void;
}

export default function HomeView({ onVideoAnalysisClick, onLiveMonitoringClick, onMetricsClick }: HomeViewProps) {
    return (
        <div className="min-h-screen flex flex-col animate-fadeInUp">
            {/* Hero Section */}
            <section className="relative pt-10 pb-24 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                        {/* Left Column: Content */}
                        <div className="flex-1 text-center lg:text-left space-y-8 max-w-2xl lg:max-w-none mx-auto">
                            <div className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 mb-4">
                                <span className="flex h-2 w-2 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                                </span>
                                <span className="text-sm font-medium text-blue-400">v2.0 Now Available</span>
                            </div>

                            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-white leading-tight">
                                Intelligent <span className="text-gradient">Violence Detection</span> for Modern Security
                            </h1>

                            <p className="text-lg text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
                                Transform your surveillance with enterprise-grade AI. Detect threats in real-time, analyze footage instantly, and ensure safety with 99.9% accuracy.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                                <button
                                    onClick={onLiveMonitoringClick}
                                    className="btn btn-primary btn-lg w-full sm:w-auto group font-semibold"
                                >
                                    <Camera className="w-5 h-5 mr-2" />
                                    Start Monitoring
                                    <ArrowRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                </button>
                                <button
                                    onClick={onVideoAnalysisClick}
                                    className="btn btn-secondary btn-lg w-full sm:w-auto font-semibold"
                                >
                                    <Video className="w-5 h-5 mr-2" />
                                    Analyze Video
                                </button>
                                <button
                                    onClick={onMetricsClick}
                                    className="btn btn-secondary btn-lg w-full sm:w-auto font-semibold"
                                >
                                    <BarChart3 className="w-5 h-5 mr-2" />
                                    View Metrics
                                </button>
                            </div>

                            <div className="pt-6 flex items-center justify-center lg:justify-start gap-6 text-sm font-medium text-slate-500">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-blue-500" />
                                    <span>Real-time Alerts</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-blue-500" />
                                    <span>Privacy First</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-blue-500" />
                                    <span>Easy Integration</span>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Dashboard Preview */}
                        <div className="flex-1 relative w-full lg:min-w-[600px] xl:min-w-[700px]">
                            <div className="relative rounded-2xl bg-slate-800/50 p-2 ring-1 ring-white/10 shadow-2xl transform lg:scale-110 lg:translate-x-10 transition-transform duration-700 hover:scale-[1.12]">
                                <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl opacity-20 blur-2xl -z-10 animate-pulse"></div>
                                <img
                                    src="/dashboard-preview.png"
                                    alt="Violens Dashboard Interface"
                                    className="rounded-xl shadow-inner border border-slate-700/50 w-full h-auto object-cover"
                                />

                                {/* Floating Badge 1 */}
                                <div className="absolute -top-6 -right-6 bg-slate-800/90 backdrop-blur-md p-4 rounded-xl border border-slate-700 shadow-xl hidden md:block animate-float">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-red-500/20 rounded-lg">
                                            <Zap className="w-5 h-5 text-red-400" />
                                        </div>
                                        <div>
                                            <div className="text-xs text-slate-400 font-medium">Response Time</div>
                                            <div className="text-lg font-bold text-white">&lt;50ms</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Floating Badge 2 */}
                                <div className="absolute -bottom-6 -left-6 bg-slate-800/90 backdrop-blur-md p-4 rounded-xl border border-slate-700 shadow-xl hidden md:block animate-float-delayed">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-green-500/20 rounded-lg">
                                            <Shield className="w-5 h-5 text-green-400" />
                                        </div>
                                        <div>
                                            <div className="text-xs text-slate-400 font-medium">System Status</div>
                                            <div className="text-lg font-bold text-white">Active</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-24 bg-slate-900/50 border-y border-slate-800/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl font-bold text-white mb-4">Everything you need for complete security</h2>
                        <p className="text-slate-400 text-lg">Powerful features designed to keep your environment safe and secure around the clock.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="p-8 rounded-2xl bg-slate-800/30 border border-slate-700/30 hover:bg-slate-800/50 transition-colors group">
                            <div className="w-14 h-14 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Brain className="w-7 h-7 text-blue-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-3">Advanced AI Models</h3>
                            <p className="text-slate-400 leading-relaxed">
                                Powered by state-of-the-art deep learning algorithms trained on diverse datasets to minimize false positives.
                            </p>
                        </div>

                        <div className="p-8 rounded-2xl bg-slate-800/30 border border-slate-700/30 hover:bg-slate-800/50 transition-colors group">
                            <div className="w-14 h-14 bg-orange-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Zap className="w-7 h-7 text-orange-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-3">Real-time Processing</h3>
                            <p className="text-slate-400 leading-relaxed">
                                Instant threat detection and analysis with sub-second latency, ensuring immediate response capabilities.
                            </p>
                        </div>

                        <div className="p-8 rounded-2xl bg-slate-800/30 border border-slate-700/30 hover:bg-slate-800/50 transition-colors group">
                            <div className="w-14 h-14 bg-green-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Shield className="w-7 h-7 text-green-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-3">Enterprise Security</h3>
                            <p className="text-slate-400 leading-relaxed">
                                Built with privacy and security first, featuring end-to-end encryption and secure data handling.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-4 gap-8 divide-y md:divide-y-0 md:divide-x divide-slate-800">
                        <div className="text-center px-4 py-4">
                            <div className="text-4xl font-bold text-white mb-2">99.9%</div>
                            <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">Uptime</div>
                        </div>
                        <div className="text-center px-4 py-4">
                            <div className="text-4xl font-bold text-white mb-2">&lt;50ms</div>
                            <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">Latency</div>
                        </div>
                        <div className="text-center px-4 py-4">
                            <div className="text-4xl font-bold text-white mb-2">24/7</div>
                            <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">Monitoring</div>
                        </div>
                        <div className="text-center px-4 py-4">
                            <div className="text-4xl font-bold text-white mb-2">100+</div>
                            <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">Threats Detected</div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
