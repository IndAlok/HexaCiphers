import React, { useState } from 'react';
import { 
  Hash, Search, AlertTriangle, Users, 
  TrendingUp, BarChart3, Bot, Zap
} from 'lucide-react';

const CampaignAnalysis = ({ darkMode }) => {
  const [hashtag, setHashtag] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!hashtag.trim()) {
      setError('Please enter a hashtag');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/analyze-campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hashtag: hashtag.trim() })
      });

      const data = await response.json();
      
      if (response.ok) {
        setResult(data.data);
      } else {
        setError(data.message || 'Failed to analyze campaign');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getRiskLabel = (score) => {
    if (score >= 70) return { label: 'High Risk', color: 'text-red-400', bg: 'bg-red-900/30' };
    if (score >= 40) return { label: 'Medium Risk', color: 'text-yellow-400', bg: 'bg-yellow-900/30' };
    return { label: 'Low Risk', color: 'text-green-400', bg: 'bg-green-900/30' };
  };

  return (
    <div className="space-y-8 fade-in">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white drop-shadow-lg mb-2">Campaign Analysis</h1>
        <p className="text-xl text-white/80 font-medium">
          Analyze hashtag campaigns for coordination patterns and bot activity
        </p>
      </div>

      <div className="dashboard-card slide-up">
        <div className="flex items-center space-x-3 mb-6">
          <Hash className="h-6 w-6 text-green-400" />
          <h2 className="text-xl font-bold text-white">Enter Hashtag</h2>
        </div>
        
        <div className="flex space-x-3">
          <input
            type="text"
            value={hashtag}
            onChange={(e) => setHashtag(e.target.value)}
            placeholder="#IndiaFirst or IndiaFirst"
            className="flex-1 input-modern"
            disabled={loading}
            onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
          />
          <button
            onClick={handleAnalyze}
            disabled={loading || !hashtag.trim()}
            className="btn-primary disabled:opacity-50 flex items-center space-x-2"
          >
            {loading ? (
              <><div className="loading-spinner h-4 w-4"></div><span>Analyzing...</span></>
            ) : (
              <><Search className="h-4 w-4" /><span>Analyze Campaign</span></>
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
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-500/20 rounded-xl">
                  <Hash className="h-8 w-8 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">#{result.hashtag}</h3>
                  <p className="text-white/60">{result.analysis.tweet_count} tweets analyzed</p>
                </div>
              </div>
              <div className={`px-4 py-2 rounded-xl ${getRiskLabel(result.analysis.risk_score).bg}`}>
                <div className={`text-2xl font-bold ${getRiskLabel(result.analysis.risk_score).color}`}>
                  {result.analysis.risk_score.toFixed(0)}
                </div>
                <div className="text-xs text-white/60">Risk Score</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="metric-card-blue scale-in">
              <BarChart3 className="h-6 w-6 text-white mb-2" />
              <div className="text-2xl font-bold text-white">{result.analysis.tweet_count}</div>
              <div className="text-sm text-white/70">Tweets</div>
            </div>
            <div className="metric-card-purple scale-in" style={{animationDelay: '0.05s'}}>
              <Users className="h-6 w-6 text-white mb-2" />
              <div className="text-2xl font-bold text-white">{result.analysis.unique_users}</div>
              <div className="text-sm text-white/70">Users</div>
            </div>
            <div className="metric-card-green scale-in" style={{animationDelay: '0.1s'}}>
              <TrendingUp className="h-6 w-6 text-white mb-2" />
              <div className="text-2xl font-bold text-white">{result.analysis.total_engagement?.toLocaleString()}</div>
              <div className="text-sm text-white/70">Engagement</div>
            </div>
            <div className="metric-card-orange scale-in" style={{animationDelay: '0.15s'}}>
              <Zap className="h-6 w-6 text-white mb-2" />
              <div className="text-2xl font-bold text-white">{(result.analysis.coordination_score * 100).toFixed(0)}%</div>
              <div className="text-sm text-white/70">Coordination</div>
            </div>
            <div className="metric-card-red scale-in" style={{animationDelay: '0.2s'}}>
              <Bot className="h-6 w-6 text-white mb-2" />
              <div className="text-2xl font-bold text-white">{(result.analysis.bot_percentage * 100).toFixed(0)}%</div>
              <div className="text-sm text-white/70">Suspicious</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="dashboard-card scale-in" style={{animationDelay: '0.2s'}}>
              <h4 className="font-semibold text-white mb-4">Stance Distribution</h4>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center p-4 bg-green-900/20 rounded-xl">
                  <div className="text-3xl font-bold text-green-400">{result.analysis.stance_breakdown?.pro_india || 0}</div>
                  <div className="text-sm text-white/60">Pro-India</div>
                </div>
                <div className="text-center p-4 bg-yellow-900/20 rounded-xl">
                  <div className="text-3xl font-bold text-yellow-400">{result.analysis.stance_breakdown?.neutral || 0}</div>
                  <div className="text-sm text-white/60">Neutral</div>
                </div>
                <div className="text-center p-4 bg-red-900/20 rounded-xl">
                  <div className="text-3xl font-bold text-red-400">{result.analysis.stance_breakdown?.anti_india || 0}</div>
                  <div className="text-sm text-white/60">Anti-India</div>
                </div>
              </div>
              <div className="p-3 bg-white/5 rounded-lg">
                <span className="text-white/70">Dominant: </span>
                <span className={`font-semibold ${
                  result.analysis.dominant_stance === 'Pro-India' ? 'text-green-400' :
                  result.analysis.dominant_stance === 'Anti-India' ? 'text-red-400' : 'text-yellow-400'
                }`}>{result.analysis.dominant_stance}</span>
              </div>
            </div>

            <div className="dashboard-card scale-in" style={{animationDelay: '0.25s'}}>
              <h4 className="font-semibold text-white mb-4">Top Contributors</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {result.top_users?.map((user, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <span className="text-white/40 text-sm w-6">{i + 1}.</span>
                      <span className="text-white">@{user.username}</span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="text-white/60">{user.tweets} tweets</span>
                      <span className="text-white/40">{(user.followers / 1000).toFixed(1)}K</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="dashboard-card scale-in" style={{animationDelay: '0.3s'}}>
            <h4 className="font-semibold text-white mb-4">Sample Tweets</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
              {result.sample_tweets?.map((tweet, i) => (
                <div key={tweet.tweet_id || i} className="p-3 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-white/60 text-sm">@{tweet.username}</span>
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      tweet.classification === 'Pro-India' ? 'bg-green-900/30 text-green-400' :
                      tweet.classification === 'Anti-India' ? 'bg-red-900/30 text-red-400' :
                      'bg-yellow-900/30 text-yellow-400'
                    }`}>{tweet.classification}</span>
                  </div>
                  <p className="text-white/80 text-sm">{tweet.content}</p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-white/50">
                    <span>❤️ {tweet.likes}</span>
                    <span>🔄 {tweet.retweets}</span>
                    <span className={`px-1 py-0.5 rounded ${
                      tweet.risk_score >= 70 ? 'bg-red-900/30 text-red-400' :
                      tweet.risk_score >= 40 ? 'bg-yellow-900/30 text-yellow-400' :
                      'bg-green-900/30 text-green-400'
                    }`}>Risk: {tweet.risk_score.toFixed(0)}</span>
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

export default CampaignAnalysis;
