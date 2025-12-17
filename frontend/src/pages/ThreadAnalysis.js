import React, { useState } from 'react';
import { 
  MessageSquare, Search, AlertTriangle, Users, 
  TrendingUp, BarChart3, MessageCircle, Zap
} from 'lucide-react';

const ThreadAnalysis = ({ darkMode }) => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!url.trim()) {
      setError('Please enter a tweet URL');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/analyze-thread', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() })
      });

      const data = await response.json();
      
      if (response.ok) {
        setResult(data.data);
      } else {
        setError(data.message || 'Failed to analyze thread');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getControversyLabel = (score) => {
    if (score >= 0.7) return { label: 'Highly Controversial', color: 'text-red-400' };
    if (score >= 0.4) return { label: 'Moderately Controversial', color: 'text-yellow-400' };
    return { label: 'Low Controversy', color: 'text-green-400' };
  };

  return (
    <div className="space-y-8 fade-in">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white drop-shadow-lg mb-2">Thread Analysis</h1>
        <p className="text-xl text-white/80 font-medium">
          Analyze entire Twitter conversations including all replies and engagement
        </p>
      </div>

      <div className="dashboard-card slide-up">
        <div className="flex items-center space-x-3 mb-6">
          <MessageSquare className="h-6 w-6 text-purple-400" />
          <h2 className="text-xl font-bold text-white">Enter Tweet URL</h2>
        </div>
        
        <div className="flex space-x-3">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://twitter.com/user/status/..."
            className="flex-1 input-modern"
            disabled={loading}
            onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
          />
          <button
            onClick={handleAnalyze}
            disabled={loading || !url.trim()}
            className="btn-primary disabled:opacity-50 flex items-center space-x-2"
          >
            {loading ? (
              <><div className="loading-spinner h-4 w-4"></div><span>Analyzing...</span></>
            ) : (
              <><Search className="h-4 w-4" /><span>Analyze Thread</span></>
            )}
          </button>
        </div>

        {error && (
          <div className="alert-high mt-4">
            <AlertTriangle className="h-4 w-4 inline mr-2" />
            {error}
          </div>
        )}
      </div>

      {result && (
        <>
          <div className="dashboard-card scale-in">
            <h3 className="text-lg font-semibold text-white mb-4">Root Tweet</h3>
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-start space-x-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-semibold text-white">{result.root_tweet.display_name}</span>
                    <span className="text-white/50">@{result.root_tweet.username}</span>
                  </div>
                  <p className="text-white/80">{result.root_tweet.content}</p>
                  <div className="flex items-center space-x-6 mt-3 text-sm text-white/60">
                    <span>❤️ {result.root_tweet.likes?.toLocaleString()}</span>
                    <span>🔄 {result.root_tweet.retweets?.toLocaleString()}</span>
                    <span>💬 {result.root_tweet.replies?.toLocaleString()}</span>
                    <span>📝 {result.root_tweet.quotes?.toLocaleString()}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-lg text-sm font-medium ${
                    result.root_tweet.classification === 'Pro-India' ? 'bg-green-900/30 text-green-400' :
                    result.root_tweet.classification === 'Anti-India' ? 'bg-red-900/30 text-red-400' :
                    'bg-yellow-900/30 text-yellow-400'
                  }`}>
                    {result.root_tweet.classification}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="metric-card-blue scale-in">
              <MessageSquare className="h-6 w-6 text-white mb-2" />
              <div className="text-2xl font-bold text-white">{result.thread_analysis.tweet_count}</div>
              <div className="text-sm text-white/70">Total Tweets</div>
            </div>
            <div className="metric-card-purple scale-in" style={{animationDelay: '0.05s'}}>
              <Users className="h-6 w-6 text-white mb-2" />
              <div className="text-2xl font-bold text-white">{result.thread_analysis.unique_users}</div>
              <div className="text-sm text-white/70">Participants</div>
            </div>
            <div className="metric-card-green scale-in" style={{animationDelay: '0.1s'}}>
              <TrendingUp className="h-6 w-6 text-white mb-2" />
              <div className="text-2xl font-bold text-white">{result.thread_analysis.total_engagement?.toLocaleString()}</div>
              <div className="text-sm text-white/70">Engagement</div>
            </div>
            <div className="metric-card-orange scale-in" style={{animationDelay: '0.15s'}}>
              <Zap className="h-6 w-6 text-white mb-2" />
              <div className={`text-2xl font-bold ${getControversyLabel(result.thread_analysis.controversy_score).color}`}>
                {(result.thread_analysis.controversy_score * 100).toFixed(0)}%
              </div>
              <div className="text-sm text-white/70">Controversy</div>
            </div>
            <div className="metric-card-red scale-in" style={{animationDelay: '0.2s'}}>
              <BarChart3 className="h-6 w-6 text-white mb-2" />
              <div className="text-2xl font-bold text-white">{result.thread_analysis.reply_count}</div>
              <div className="text-sm text-white/70">Replies</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="dashboard-card scale-in" style={{animationDelay: '0.2s'}}>
              <h4 className="font-semibold text-white mb-4 flex items-center">
                <MessageCircle className="h-5 w-5 mr-2 text-purple-400" /> Sentiment Distribution
              </h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-900/20 rounded-xl">
                  <div className="text-3xl font-bold text-green-400">
                    {result.thread_analysis.sentiment_breakdown?.positive || 0}
                  </div>
                  <div className="text-sm text-white/60">Positive</div>
                </div>
                <div className="text-center p-4 bg-yellow-900/20 rounded-xl">
                  <div className="text-3xl font-bold text-yellow-400">
                    {result.thread_analysis.sentiment_breakdown?.neutral || 0}
                  </div>
                  <div className="text-sm text-white/60">Neutral</div>
                </div>
                <div className="text-center p-4 bg-red-900/20 rounded-xl">
                  <div className="text-3xl font-bold text-red-400">
                    {result.thread_analysis.sentiment_breakdown?.negative || 0}
                  </div>
                  <div className="text-sm text-white/60">Negative</div>
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-white/5 rounded-xl">
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Dominant Sentiment:</span>
                  <span className={`font-semibold ${
                    result.thread_analysis.dominant_sentiment === 'positive' ? 'text-green-400' :
                    result.thread_analysis.dominant_sentiment === 'negative' ? 'text-red-400' :
                    'text-yellow-400'
                  }`}>
                    {result.thread_analysis.dominant_sentiment?.charAt(0).toUpperCase() + 
                     result.thread_analysis.dominant_sentiment?.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            <div className="dashboard-card scale-in" style={{animationDelay: '0.25s'}}>
              <h4 className="font-semibold text-white mb-4 flex items-center">
                <Users className="h-5 w-5 mr-2 text-blue-400" /> Stance Distribution
              </h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-900/20 rounded-xl">
                  <div className="text-3xl font-bold text-green-400">{result.thread_analysis.pro_india_count}</div>
                  <div className="text-sm text-white/60">Pro-India</div>
                </div>
                <div className="text-center p-4 bg-yellow-900/20 rounded-xl">
                  <div className="text-3xl font-bold text-yellow-400">{result.thread_analysis.neutral_count}</div>
                  <div className="text-sm text-white/60">Neutral</div>
                </div>
                <div className="text-center p-4 bg-red-900/20 rounded-xl">
                  <div className="text-3xl font-bold text-red-400">{result.thread_analysis.anti_india_count}</div>
                  <div className="text-sm text-white/60">Anti-India</div>
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-white/5 rounded-xl">
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Dominant Stance:</span>
                  <span className={`font-semibold ${
                    result.thread_analysis.dominant_stance === 'Pro-India' ? 'text-green-400' :
                    result.thread_analysis.dominant_stance === 'Anti-India' ? 'text-red-400' :
                    'text-yellow-400'
                  }`}>
                    {result.thread_analysis.dominant_stance}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="dashboard-card scale-in" style={{animationDelay: '0.3s'}}>
            <h4 className="font-semibold text-white mb-4">Replies ({result.replies?.length || 0})</h4>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {result.replies?.map((reply, i) => (
                <div key={reply.tweet_id || i} className="p-3 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <span className="text-white/60 text-sm">@{reply.username}</span>
                      <p className="text-white/80 text-sm mt-1">{reply.content}</p>
                    </div>
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${
                      reply.classification === 'Pro-India' ? 'bg-green-900/30 text-green-400' :
                      reply.classification === 'Anti-India' ? 'bg-red-900/30 text-red-400' :
                      'bg-yellow-900/30 text-yellow-400'
                    }`}>
                      {reply.classification}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-white/50">
                    <span className={reply.sentiment === 'positive' ? 'text-green-400' : reply.sentiment === 'negative' ? 'text-red-400' : ''}>
                      {reply.sentiment}
                    </span>
                    <span>❤️ {reply.likes}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ThreadAnalysis;
