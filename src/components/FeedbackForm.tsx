import { useState } from 'react';
import { Star, ThumbsUp, ThumbsDown, AlertTriangle, Send } from 'lucide-react';

interface FeedbackFormProps {
    analysisId?: string;
    onSubmit?: () => void;
}

export default function FeedbackForm({ analysisId, onSubmit }: FeedbackFormProps) {
    const [rating, setRating] = useState(0);
    const [accuracy, setAccuracy] = useState<'accurate' | 'false_positive' | 'false_negative' | null>(null);
    const [comments, setComments] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0 || !accuracy) {
            setError('Please provide a rating and accuracy assessment.');
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';
            const res = await fetch(`${baseUrl}/feedback`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    analysisId,
                    rating,
                    accuracy,
                    comments
                }),
            });

            if (!res.ok) throw new Error('Failed to submit feedback');

            setSubmitted(true);
            if (onSubmit) onSubmit();
        } catch (err) {
            setError('Failed to submit feedback. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div className="card p-6 bg-[#0f0f13] border border-white/5 rounded-xl text-center animate-fadeIn">
                <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <ThumbsUp className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Thank You!</h3>
                <p className="text-slate-400 text-sm">Your feedback helps improve our AI model.</p>
            </div>
        );
    }

    return (
        <div className="card p-6 bg-[#0f0f13] border border-white/5 rounded-xl">
            <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                <Send className="w-4 h-4 text-blue-400" />
                Rate this Analysis
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Star Rating */}
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-2">Overall Quality</label>
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                className="focus:outline-none transition-transform hover:scale-110"
                            >
                                <Star
                                    className={`w-6 h-6 ${rating >= star ? 'fill-yellow-400 text-yellow-400' : 'text-slate-600'}`}
                                />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Accuracy Selection */}
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-2">Detection Accuracy</label>
                    <div className="grid grid-cols-3 gap-3">
                        <button
                            type="button"
                            onClick={() => setAccuracy('accurate')}
                            className={`p-3 rounded-lg border text-sm font-medium transition-all flex flex-col items-center gap-2 ${accuracy === 'accurate'
                                    ? 'bg-green-500/10 border-green-500/50 text-green-400'
                                    : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'
                                }`}
                        >
                            <ThumbsUp className="w-4 h-4" />
                            Accurate
                        </button>
                        <button
                            type="button"
                            onClick={() => setAccuracy('false_positive')}
                            className={`p-3 rounded-lg border text-sm font-medium transition-all flex flex-col items-center gap-2 ${accuracy === 'false_positive'
                                    ? 'bg-orange-500/10 border-orange-500/50 text-orange-400'
                                    : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'
                                }`}
                        >
                            <AlertTriangle className="w-4 h-4" />
                            False Alarm
                        </button>
                        <button
                            type="button"
                            onClick={() => setAccuracy('false_negative')}
                            className={`p-3 rounded-lg border text-sm font-medium transition-all flex flex-col items-center gap-2 ${accuracy === 'false_negative'
                                    ? 'bg-red-500/10 border-red-500/50 text-red-400'
                                    : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'
                                }`}
                        >
                            <ThumbsDown className="w-4 h-4" />
                            Missed
                        </button>
                    </div>
                </div>

                {/* Comments */}
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-2">Additional Comments (Optional)</label>
                    <textarea
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500/50 min-h-[80px]"
                        placeholder="Describe any issues or specific details..."
                    />
                </div>

                {error && (
                    <div className="text-red-400 text-xs bg-red-500/10 p-2 rounded border border-red-500/20">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {submitting ? 'Submitting...' : 'Submit Feedback'}
                </button>
            </form>
        </div>
    );
}
