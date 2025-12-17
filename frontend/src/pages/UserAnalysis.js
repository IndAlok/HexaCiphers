import React, { useState } from 'react';
import { 
  User, Search, Shield, TrendingUp, AlertTriangle, 
  BarChart3, MessageCircle, Users, Award, Bot
} from 'lucide-react';

const UserAnalysis = ({ darkMode }) => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/analyze-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim() })
      });

      const data = await response.json();
      
      if (response.ok) {
        setResult(data.data);
      } else {
        setError(data.message || 'Failed to analyze user');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade) => {
    if (grade?.startsWith('A')) return 'text-green-400';
    if (grade?.startsWith('B')) return 'text-blue-400';
    if (grade?.startsWith('C')) return 'text-yellow-400';
    if (grade?.startsWith('D')) return 'text-orange-400';
    return 'text-red-400';
  };

  const getStanceColor = (stance) => {
    if (stance === 'Pro-India') return 'text-green-400 bg-green-900/30';
    if (stance === 'Anti-India') return 'text-red-400 bg-red-900/30';
    return 'text-yellow-400 bg-yellow-900/30';
  };

  return (
    <div className="space-y-8 fade-in">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white drop-shadow-lg mb-2">User Profile Analysis</h1>
        <p className="text-xl text-white/80 font-medium">
          Complete analysis of a Twitter user's stance, influence, and bot probability
        </p>
      </div>

      <div className="dashboard-card slide-up">
        <div className="flex items-center space-x-3 mb-6">
          <User className="h-6 w-6 text-blue-400" />
          <h2 className="text-xl font-bold text-white">Enter Username</h2>
        </div>
        
        <div className="flex space-x-3">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="@username or profile URL"
            className="flex-1 input-modern"
            disabled={loading}
            onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
          />
          <button
            onClick={handleAnalyze}
            disabled={loading || !username.trim()}
            className="btn-primary disabled:opacity-50 flex items-center space-x-2"
          >
            {loading ? (
              <><div className="loading-spinner h-4 w-4"></div><span>Analyzing...</span></>
            ) : (
              <><Search className="h-4 w-4" /><span>Analyze Profile</span></>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="dashboard-card scale-in text-center">
              <img 
                src={result.user.profile_image_url?.replace('_normal', '_400x400') || '/logo192.png'} 
                alt={result.user.username}
                className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-white/20"
              />
              <h3 className="text-xl font-bold text-white">{result.user.display_name}</h3>
              <p className="text-white/60">@{result.user.username}</p>
              {result.user.verified && (
                <span className="inline-block mt-2 px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">Verified</span>
              )}
              
              <div className="mt-6 text-center">
                <div className={`text-6xl font-black ${getGradeColor(result.analysis.grade)}`}>
                  {result.analysis.grade}
                </div>
                <p className="text-white/60 mt-2">Overall Grade</p>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="p-2 bg-white/5 rounded-lg">
                  <div className="text-lg font-bold text-white">{(result.user.followers / 1000).toFixed(1)}K</div>
                  <div className="text-xs text-white/60">Followers</div>
                </div>
                <div className="p-2 bg-white/5 rounded-lg">
                  <div className="text-lg font-bold text-white">{(result.user.following / 1000).toFixed(1)}K</div>
                  <div className="text-xs text-white/60">Following</div>
                </div>
                <div className="p-2 bg-white/5 rounded-lg">
                  <div className="text-lg font-bold text-white">{result.user.tweet_count}</div>
                  <div className="text-xs text-white/60">Tweets</div>
                </div>
              </div>
            </div>

            <div className="dashboard-card scale-in" style={{animationDelay: '0.1s'}}>
              <h4 className="font-semibold text-white mb-4 flex items-center">
                <Award className="h-5 w-5 mr-2 text-yellow-400" /> Stance Analysis
              </h4>
              <div className={`text-center p-4 rounded-xl ${getStanceColor(result.analysis.stance_label)}`}>
                <div className="text-2xl font-bold">{result.analysis.stance_label}</div>
                <div className="text-sm opacity-80">
                  Score: {(result.analysis.stance_score * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="metric-card-blue scale-in" style={{animationDelay: '0.1s'}}>
                <BarChart3 className="h-6 w-6 text-white mb-2" />
                <div className="text-2xl font-bold text-white">{result.analysis.tweets_analyzed}</div>
                <div className="text-sm text-white/70">Tweets Analyzed</div>
              </div>
              <div className="metric-card-purple scale-in" style={{animationDelay: '0.15s'}}>
                <TrendingUp className="h-6 w-6 text-white mb-2" />
                <div className="text-2xl font-bold text-white">{result.analysis.influence_score.toFixed(0)}</div>
                <div className="text-sm text-white/70">Influence Score</div>
              </div>
              <div className="metric-card-orange scale-in" style={{animationDelay: '0.2s'}}>
                <Bot className="h-6 w-6 text-white mb-2" />
                <div className="text-2xl font-bold text-white">{(result.analysis.bot_probability * 100).toFixed(0)}%</div>
                <div className="text-sm text-white/70">Bot Probability</div>
              </div>
              <div className="metric-card-red scale-in" style={{animationDelay: '0.25s'}}>
                <Shield className="h-6 w-6 text-white mb-2" />
                <div className="text-2xl font-bold text-white">{result.analysis.risk_score.toFixed(0)}</div>
                <div className="text-sm text-white/70">Risk Score</div>
              </div>
            </div>

            <div className="dashboard-card scale-in" style={{animationDelay: '0.2s'}}>
              <h4 className="font-semibold text-white mb-4 flex items-center">
                <MessageCircle className="h-5 w-5 mr-2 text-purple-400" /> Sentiment Breakdown
              </h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-900/20 rounded-xl">
                  <div className="text-2xl font-bold text-green-400">{result.analysis.sentiment_breakdown.positive}</div>
                  <div className="text-sm text-white/60">Positive</div>
                </div>
                <div className="text-center p-4 bg-yellow-900/20 rounded-xl">
                  <div className="text-2xl font-bold text-yellow-400">{result.analysis.sentiment_breakdown.neutral}</div>
                  <div className="text-sm text-white/60">Neutral</div>
                </div>
                <div className="text-center p-4 bg-red-900/20 rounded-xl">
                  <div className="text-2xl font-bold text-red-400">{result.analysis.sentiment_breakdown.negative}</div>
                  <div className="text-sm text-white/60">Negative</div>
                </div>
              </div>
            </div>

            <div className="dashboard-card scale-in" style={{animationDelay: '0.25s'}}>
              <h4 className="font-semibold text-white mb-4 flex items-center">
                <Users className="h-5 w-5 mr-2 text-blue-400" /> Stance Breakdown
              </h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-900/20 rounded-xl">
                  <div className="text-2xl font-bold text-green-400">{result.analysis.stance_breakdown['Pro-India']}</div>
                  <div className="text-sm text-white/60">Pro-India</div>
                </div>
                <div className="text-center p-4 bg-yellow-900/20 rounded-xl">
                  <div className="text-2xl font-bold text-yellow-400">{result.analysis.stance_breakdown['Neutral']}</div>
                  <div className="text-sm text-white/60">Neutral</div>
                </div>
                <div className="text-center p-4 bg-red-900/20 rounded-xl">
                  <div className="text-2xl font-bold text-red-400">{result.analysis.stance_breakdown['Anti-India']}</div>
                  <div className="text-sm text-white/60">Anti-India</div>
                </div>
              </div>
            </div>

            <div className="dashboard-card scale-in" style={{animationDelay: '0.3s'}}>
              <h4 className="font-semibold text-white mb-4">Recent Tweets</h4>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {result.recent_tweets?.map((tweet, i) => (
                  <div key={tweet.tweet_id || i} className="p-3 bg-white/5 rounded-lg border border-white/10">
                    <p className="text-white/80 text-sm">{tweet.content}</p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-white/50">
                      <span className={tweet.sentiment === 'positive' ? 'text-green-400' : tweet.sentiment === 'negative' ? 'text-red-400' : 'text-yellow-400'}>
                        {tweet.sentiment}
                      </span>
                      <span className={tweet.classification === 'Pro-India' ? 'text-green-400' : tweet.classification === 'Anti-India' ? 'text-red-400' : 'text-yellow-400'}>
                        {tweet.classification}
                      </span>
                      <span>❤️ {tweet.likes}</span>
                      <span>🔄 {tweet.retweets}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserAnalysis;
