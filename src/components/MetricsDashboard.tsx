"use client";

import { useState, useEffect } from "react";
import { Activity, TrendingUp, Clock, AlertCircle, BarChart3, PieChart, RefreshCw, Brain, Sparkles, MessageSquare } from "lucide-react";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface MetricsData {
    totals: {
        count: number;
        p50_ms: number | null;
        p95_ms: number | null;
        p99_ms: number | null;
        statusCounts: Record<number, number>;
    };
    routes: Record<string, {
        count: number;
        p50_ms: number | null;
        p95_ms: number | null;
        p99_ms: number | null;
        statusCounts: Record<number, number>;
    }>;
    liveSessions: {
        active: number;
        total: number;
    };
    model?: {
        avg_confidence: number;
        avg_processing_time_s: number;
    };
    gemini?: {
        success_rate: number;
        total_calls: number;
    };
    feedback?: {
        total: number;
        false_positive_rate: number;
        avg_rating: number;
    };
}

interface HistoricalMetrics {
    history: Array<MetricsData & { timestamp: string }>;
    count: number;
}

export default function MetricsDashboard() {
    const [metrics, setMetrics] = useState<MetricsData | null>(null);
    const [history, setHistory] = useState<HistoricalMetrics | null>(null);
    const [timeRange, setTimeRange] = useState<number>(24); // hours
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [loading, setLoading] = useState(true);

    const fetchMetrics = async () => {
        try {
            const [currentRes, historyRes] = await Promise.all([
                fetch("http://127.0.0.1:8000/metrics"),
                fetch(`http://127.0.0.1:8000/metrics/history?hours=${timeRange}`)
            ]);

            const currentData = await currentRes.json();
            const historyData = await historyRes.json();

            setMetrics(currentData);
            setHistory(historyData);
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch metrics:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMetrics();

        if (autoRefresh) {
            const interval = setInterval(fetchMetrics, 30000); // Refresh every 30 seconds
            return () => clearInterval(interval);
        }
    }, [autoRefresh, timeRange]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
                <div className="text-slate-400">Loading metrics...</div>
            </div>
        );
    }

    if (!metrics) {
        return (
            <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
                <div className="text-slate-400">No metrics available</div>
            </div>
        );
    }

    const errorRate = metrics.totals.count > 0
        ? ((metrics.totals.statusCounts[500] || 0) / metrics.totals.count) * 100
        : 0;

    const successRate = metrics.totals.count > 0
        ? ((metrics.totals.statusCounts[200] || 0) / metrics.totals.count) * 100
        : 0;

    return (
        <div className="min-h-screen bg-[#0a0a0f] p-6">
            <div className="max-w-[1920px] mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-white mb-1">Deployment Metrics</h1>
                        <p className="text-sm text-slate-400">Real-time system performance monitoring</p>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Time Range Selector */}
                        <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(Number(e.target.value))}
                            className="px-4 py-2 bg-[#0f0f13] border border-white/10 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-blue-500"
                        >
                            <option value={1}>Last Hour</option>
                            <option value={24}>Last 24 Hours</option>
                            <option value={168}>Last 7 Days</option>
                        </select>

                        {/* Auto Refresh Toggle */}
                        <button
                            onClick={() => setAutoRefresh(!autoRefresh)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${autoRefresh
                                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                : 'bg-[#0f0f13] text-slate-400 border border-white/10'
                                }`}
                        >
                            <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
                            Auto Refresh
                        </button>

                        {/* Manual Refresh */}
                        <button
                            onClick={fetchMetrics}
                            className="px-4 py-2 bg-[#0f0f13] border border-white/10 rounded-lg text-sm text-slate-300 hover:bg-white/5 transition-colors"
                        >
                            Refresh Now
                        </button>
                    </div>
                </div>

                {/* Overview Cards */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                    {/* Total Requests */}
                    <div className="card p-5 bg-[#0f0f13] border border-white/5 rounded-xl">
                        <div className="flex items-center justify-between mb-3">
                            <div className="p-2 bg-blue-500/10 rounded-lg">
                                <Activity className="w-5 h-5 text-blue-400" />
                            </div>
                            <span className="text-xs text-slate-500">Total</span>
                        </div>
                        <div className="text-2xl font-bold text-white mb-1">{metrics.totals.count.toLocaleString()}</div>
                        <div className="text-xs text-slate-400">Requests</div>
                    </div>

                    {/* Average Response Time */}
                    <div className="card p-5 bg-[#0f0f13] border border-white/5 rounded-xl">
                        <div className="flex items-center justify-between mb-3">
                            <div className="p-2 bg-purple-500/10 rounded-lg">
                                <Clock className="w-5 h-5 text-purple-400" />
                            </div>
                            <span className="text-xs text-slate-500">p50</span>
                        </div>
                        <div className="text-2xl font-bold text-white mb-1">
                            {metrics.totals.p50_ms?.toFixed(0) || 0}ms
                        </div>
                        <div className="text-xs text-slate-400">Avg Response Time</div>
                    </div>

                    {/* Success Rate */}
                    <div className="card p-5 bg-[#0f0f13] border border-white/5 rounded-xl">
                        <div className="flex items-center justify-between mb-3">
                            <div className="p-2 bg-green-500/10 rounded-lg">
                                <TrendingUp className="w-5 h-5 text-green-400" />
                            </div>
                            <span className="text-xs text-slate-500">200s</span>
                        </div>
                        <div className="text-2xl font-bold text-white mb-1">{successRate.toFixed(1)}%</div>
                        <div className="text-xs text-slate-400">Success Rate</div>
                    </div>

                    {/* Error Rate */}
                    <div className="card p-5 bg-[#0f0f13] border border-white/5 rounded-xl">
                        <div className="flex items-center justify-between mb-3">
                            <div className="p-2 bg-red-500/10 rounded-lg">
                                <AlertCircle className="w-5 h-5 text-red-400" />
                            </div>
                            <span className="text-xs text-slate-500">500s</span>
                        </div>
                        <div className="text-2xl font-bold text-white mb-1">{errorRate.toFixed(1)}%</div>
                        <div className="text-xs text-slate-400">Error Rate</div>
                    </div>
                </div>

                {/* AI & Feedback Metrics Row */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    {/* Model Performance */}
                    <div className="card p-5 bg-[#0f0f13] border border-white/5 rounded-xl">
                        <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                            <Brain className="w-4 h-4 text-purple-400" />
                            Model Performance
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <div className="text-2xl font-bold text-white mb-1">
                                    {(metrics.model?.avg_confidence || 0).toFixed(2)}
                                </div>
                                <div className="text-xs text-slate-400">Avg Confidence</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-white mb-1">
                                    {(metrics.model?.avg_processing_time_s || 0).toFixed(1)}s
                                </div>
                                <div className="text-xs text-slate-400">Avg Process Time</div>
                            </div>
                        </div>
                    </div>

                    {/* Gemini API Stats */}
                    <div className="card p-5 bg-[#0f0f13] border border-white/5 rounded-xl">
                        <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-blue-400" />
                            Gemini API
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <div className="text-2xl font-bold text-white mb-1">
                                    {(metrics.gemini?.success_rate || 0).toFixed(1)}%
                                </div>
                                <div className="text-xs text-slate-400">Success Rate</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-white mb-1">
                                    {metrics.gemini?.total_calls || 0}
                                </div>
                                <div className="text-xs text-slate-400">Total Calls</div>
                            </div>
                        </div>
                    </div>

                    {/* User Feedback */}
                    <div className="card p-5 bg-[#0f0f13] border border-white/5 rounded-xl">
                        <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-green-400" />
                            User Feedback
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <div className="text-2xl font-bold text-white mb-1">
                                    {(metrics.feedback?.avg_rating || 0).toFixed(1)}
                                    <span className="text-sm text-slate-500 font-normal ml-1">/ 5</span>
                                </div>
                                <div className="text-xs text-slate-400">Avg Rating</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-white mb-1">
                                    {(metrics.feedback?.false_positive_rate || 0).toFixed(1)}%
                                </div>
                                <div className="text-xs text-slate-400">False Positives</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Trend Charts */}
                {history && history.history.length > 0 && (
                    <div className="grid grid-cols-2 gap-6 mb-6">
                        {/* Response Time Trend */}
                        <div className="card p-5 bg-[#0f0f13] border border-white/5 rounded-xl">
                            <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-blue-400" />
                                Response Time Trend
                            </h3>
                            <ResponsiveContainer width="100%" height={200}>
                                <LineChart data={history.history.slice(-20).map((h, i) => ({
                                    time: new Date(h.timestamp).toLocaleTimeString(),
                                    p50: h.totals.p50_ms || 0,
                                    p95: h.totals.p95_ms || 0,
                                    p99: h.totals.p99_ms || 0,
                                }))}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                    <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
                                    <YAxis stroke="#64748b" fontSize={10} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                                        labelStyle={{ color: '#cbd5e1' }}
                                    />
                                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                                    <Line type="monotone" dataKey="p50" stroke="#3b82f6" strokeWidth={2} name="p50" dot={false} />
                                    <Line type="monotone" dataKey="p95" stroke="#8b5cf6" strokeWidth={2} name="p95" dot={false} />
                                    <Line type="monotone" dataKey="p99" stroke="#f97316" strokeWidth={2} name="p99" dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Request Volume Trend */}
                        <div className="card p-5 bg-[#0f0f13] border border-white/5 rounded-xl">
                            <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                                <Activity className="w-4 h-4 text-green-400" />
                                Request Volume
                            </h3>
                            <ResponsiveContainer width="100%" height={200}>
                                <AreaChart data={history.history.slice(-20).map((h, i) => ({
                                    time: new Date(h.timestamp).toLocaleTimeString(),
                                    requests: h.totals.count,
                                }))}>
                                    <defs>
                                        <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                    <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
                                    <YAxis stroke="#64748b" fontSize={10} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                                        labelStyle={{ color: '#cbd5e1' }}
                                    />
                                    <Area type="monotone" dataKey="requests" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorRequests)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {/* Charts Row */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                    {/* Response Time Percentiles */}
                    <div className="card p-5 bg-[#0f0f13] border border-white/5 rounded-xl">
                        <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                            <BarChart3 className="w-4 h-4 text-blue-400" />
                            Response Time Percentiles
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-xs mb-2">
                                    <span className="text-slate-400">p50 (Median)</span>
                                    <span className="text-white font-mono">{metrics.totals.p50_ms?.toFixed(1) || 0}ms</span>
                                </div>
                                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-blue-500 to-blue-400"
                                        style={{ width: `${Math.min((metrics.totals.p50_ms || 0) / 10, 100)}%` }}
                                    />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs mb-2">
                                    <span className="text-slate-400">p95</span>
                                    <span className="text-white font-mono">{metrics.totals.p95_ms?.toFixed(1) || 0}ms</span>
                                </div>
                                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-purple-500 to-purple-400"
                                        style={{ width: `${Math.min((metrics.totals.p95_ms || 0) / 10, 100)}%` }}
                                    />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs mb-2">
                                    <span className="text-slate-400">p99</span>
                                    <span className="text-white font-mono">{metrics.totals.p99_ms?.toFixed(1) || 0}ms</span>
                                </div>
                                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-orange-500 to-orange-400"
                                        style={{ width: `${Math.min((metrics.totals.p99_ms || 0) / 10, 100)}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Status Code Distribution */}
                    <div className="card p-5 bg-[#0f0f13] border border-white/5 rounded-xl">
                        <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                            <PieChart className="w-4 h-4 text-green-400" />
                            Status Code Distribution
                        </h3>
                        <div className="space-y-3">
                            {Object.entries(metrics.totals.statusCounts).map(([status, count]) => {
                                const percentage = (count / metrics.totals.count) * 100;
                                const color = status.startsWith('2') ? 'green' : status.startsWith('4') ? 'yellow' : 'red';

                                return (
                                    <div key={status}>
                                        <div className="flex justify-between text-xs mb-2">
                                            <span className="text-slate-400">{status}</span>
                                            <span className="text-white font-mono">{count} ({percentage.toFixed(1)}%)</span>
                                        </div>
                                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full bg-gradient-to-r from-${color}-500 to-${color}-400`}
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Routes Table */}
                <div className="card p-5 bg-[#0f0f13] border border-white/5 rounded-xl">
                    <h3 className="text-sm font-semibold text-slate-300 mb-4">Route Performance</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-white/5">
                                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Route</th>
                                    <th className="text-right py-3 px-4 text-slate-400 font-medium">Requests</th>
                                    <th className="text-right py-3 px-4 text-slate-400 font-medium">p50</th>
                                    <th className="text-right py-3 px-4 text-slate-400 font-medium">p95</th>
                                    <th className="text-right py-3 px-4 text-slate-400 font-medium">p99</th>
                                    <th className="text-right py-3 px-4 text-slate-400 font-medium">Success Rate</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(metrics.routes).map(([route, data]) => {
                                    const successCount = data.statusCounts[200] || 0;
                                    const routeSuccessRate = (successCount / data.count) * 100;

                                    return (
                                        <tr key={route} className="border-b border-white/5 hover:bg-white/[0.02]">
                                            <td className="py-3 px-4 text-slate-300 font-mono text-xs">{route}</td>
                                            <td className="py-3 px-4 text-right text-white">{data.count}</td>
                                            <td className="py-3 px-4 text-right text-slate-300 font-mono">{data.p50_ms?.toFixed(0)}ms</td>
                                            <td className="py-3 px-4 text-right text-slate-300 font-mono">{data.p95_ms?.toFixed(0)}ms</td>
                                            <td className="py-3 px-4 text-right text-slate-300 font-mono">{data.p99_ms?.toFixed(0)}ms</td>
                                            <td className="py-3 px-4 text-right">
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${routeSuccessRate >= 95 ? 'bg-green-500/10 text-green-400' :
                                                    routeSuccessRate >= 80 ? 'bg-yellow-500/10 text-yellow-400' :
                                                        'bg-red-500/10 text-red-400'
                                                    }`}>
                                                    {routeSuccessRate.toFixed(1)}%
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Live Sessions */}
                <div className="mt-6 card p-5 bg-[#0f0f13] border border-white/5 rounded-xl">
                    <h3 className="text-sm font-semibold text-slate-300 mb-3">Live Monitoring Sessions</h3>
                    <div className="flex items-center gap-6">
                        <div>
                            <div className="text-2xl font-bold text-white">{metrics.liveSessions.active}</div>
                            <div className="text-xs text-slate-400">Active Sessions</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-slate-400">{metrics.liveSessions.total}</div>
                            <div className="text-xs text-slate-400">Total Sessions</div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}
