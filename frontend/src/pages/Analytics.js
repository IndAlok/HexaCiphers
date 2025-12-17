import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Users, MessageSquare, AlertTriangle, 
  TrendingUp, Bot, Shield, Activity
} from 'lucide-react';

const Analytics = ({ darkMode }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [threads, setThreads] = useState([]);

  useEffect(() => {
    Promise.all([
      fetch('/api/stats').then(r => r.json()),
      fetch('/api/users?limit=10').then(r => r.json()),
      fetch('/api/threads?limit=10').then(r => r.json())
    ]).then(([statsData, usersData, threadsData]) => {
      if (statsData.status === 'success') setStats(statsData.data);
      if (usersData.status === 'success') setUsers(usersData.data || []);
      if (threadsData.status === 'success') setThreads(threadsData.data || []);
    }).catch(() => {})
    .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner h-8 w-8"></div>
      </div>
    );
  }

  const overview = stats?.overview || {};
  const sentiment = stats?.sentiment_distribution || {};
  const classification = stats?.classification_distribution || {};
  const userStance = stats?.user_stance_distribution || {};

  return (
    <div className="space-y-8 fade-in">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white drop-shadow-lg mb-2">Analytics Dashboard</h1>
        <p className="text-xl text-white/80 font-medium">Comprehensive analysis metrics and insights</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="metric-card-blue scale-in">
          <MessageSquare className="h-6 w-6 text-white mb-2" />
          <div className="text-2xl font-bold text-white">{overview.total_posts || 0}</div>
          <div className="text-xs text-white/70">Posts</div>
        </div>
        <div className="metric-card-purple scale-in" style={{animationDelay: '0.05s'}}>
          <Users className="h-6 w-6 text-white mb-2" />
          <div className="text-2xl font-bold text-white">{overview.total_users || 0}</div>
          <div className="text-xs text-white/70">Users</div>
        </div>
        <div className="metric-card-green scale-in" style={{animationDelay: '0.1s'}}>
          <Activity className="h-6 w-6 text-white mb-2" />
          <div className="text-2xl font-bold text-white">{overview.total_threads || 0}</div>
          <div className="text-xs text-white/70">Threads</div>
        </div>
        <div className="metric-card-orange scale-in" style={{animationDelay: '0.15s'}}>
          <TrendingUp className="h-6 w-6 text-white mb-2" />
          <div className="text-2xl font-bold text-white">{overview.total_campaigns || 0}</div>
          <div className="text-xs text-white/70">Campaigns</div>
        </div>
        <div className="metric-card-red scale-in" style={{animationDelay: '0.2s'}}>
          <AlertTriangle className="h-6 w-6 text-white mb-2" />
          <div className="text-2xl font-bold text-white">{overview.high_risk_posts || 0}</div>
          <div className="text-xs text-white/70">High Risk</div>
        </div>
        <div className="metric-card-yellow scale-in" style={{animationDelay: '0.25s'}}>
          <Bot className="h-6 w-6 text-white mb-2" />
          <div className="text-2xl font-bold text-white">{overview.likely_bots || 0}</div>
          <div className="text-xs text-white/70">Likely Bots</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="dashboard-card scale-in" style={{animationDelay: '0.2s'}}>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-blue-400" /> Sentiment Distribution
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-white/70">Positive</span>
                <span className="text-green-400 font-semibold">{sentiment.positive || 0}</span>
              </div>
              <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (sentiment.positive / Math.max(overview.total_posts, 1)) * 100)}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-white/70">Neutral</span>
                <span className="text-yellow-400 font-semibold">{sentiment.neutral || 0}</span>
              </div>
              <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (sentiment.neutral / Math.max(overview.total_posts, 1)) * 100)}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-white/70">Negative</span>
                <span className="text-red-400 font-semibold">{sentiment.negative || 0}</span>
              </div>
              <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (sentiment.negative / Math.max(overview.total_posts, 1)) * 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-card scale-in" style={{animationDelay: '0.25s'}}>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Shield className="h-5 w-5 mr-2 text-purple-400" /> Stance Classification
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-white/70">Pro-India</span>
                <span className="text-green-400 font-semibold">{classification.pro_india || 0}</span>
              </div>
              <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (classification.pro_india / Math.max(overview.total_posts, 1)) * 100)}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-white/70">Neutral</span>
                <span className="text-yellow-400 font-semibold">{classification.neutral || 0}</span>
              </div>
              <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-yellow-500 to-amber-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (classification.neutral / Math.max(overview.total_posts, 1)) * 100)}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-white/70">Anti-India</span>
                <span className="text-red-400 font-semibold">{classification.anti_india || 0}</span>
              </div>
              <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-red-500 to-rose-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (classification.anti_india / Math.max(overview.total_posts, 1)) * 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="dashboard-card scale-in" style={{animationDelay: '0.3s'}}>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Users className="h-5 w-5 mr-2 text-blue-400" /> Recently Analyzed Users
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {users.length > 0 ? users.map((user, i) => (
              <div key={user.id || i} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${
                    user.grade?.startsWith('A') ? 'bg-green-500/20 text-green-400' :
                    user.grade?.startsWith('B') ? 'bg-blue-500/20 text-blue-400' :
                    user.grade?.startsWith('C') ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>{user.grade || '?'}</div>
                  <div>
                    <div className="text-white font-medium">@{user.username}</div>
                    <div className="text-xs text-white/50">{user.tweets_analyzed || 0} tweets analyzed</div>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${
                  user.stance_label === 'Pro-India' ? 'bg-green-900/30 text-green-400' :
                  user.stance_label === 'Anti-India' ? 'bg-red-900/30 text-red-400' :
                  'bg-yellow-900/30 text-yellow-400'
                }`}>{user.stance_label}</span>
              </div>
            )) : (
              <p className="text-white/50 text-center py-4">No users analyzed yet</p>
            )}
          </div>
        </div>

        <div className="dashboard-card scale-in" style={{animationDelay: '0.35s'}}>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <MessageSquare className="h-5 w-5 mr-2 text-purple-400" /> Recent Thread Analyses
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {threads.length > 0 ? threads.map((thread, i) => (
              <div key={thread.id || i} className="p-3 bg-white/5 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/60 text-xs">Thread #{thread.root_tweet_id?.slice(-6)}</span>
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    thread.controversy_score > 0.7 ? 'bg-red-900/30 text-red-400' :
                    thread.controversy_score > 0.4 ? 'bg-yellow-900/30 text-yellow-400' :
                    'bg-green-900/30 text-green-400'
                  }`}>
                    {(thread.controversy_score * 100).toFixed(0)}% controversy
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/70">{thread.tweet_count} tweets, {thread.unique_users} users</span>
                  <span className={`font-medium ${
                    thread.dominant_stance === 'Pro-India' ? 'text-green-400' :
                    thread.dominant_stance === 'Anti-India' ? 'text-red-400' : 'text-yellow-400'
                  }`}>{thread.dominant_stance}</span>
                </div>
              </div>
            )) : (
              <p className="text-white/50 text-center py-4">No threads analyzed yet</p>
            )}
          </div>
        </div>
      </div>

      {Object.keys(userStance).length > 0 && (
        <div className="dashboard-card scale-in" style={{animationDelay: '0.4s'}}>
          <h3 className="text-lg font-semibold text-white mb-4">User Stance Distribution</h3>
          <div className="grid grid-cols-3 gap-4">
            {Object.entries(userStance).map(([stance, count]) => (
              <div key={stance} className={`text-center p-6 rounded-xl ${
                stance === 'Pro-India' ? 'bg-green-900/20' :
                stance === 'Anti-India' ? 'bg-red-900/20' : 'bg-yellow-900/20'
              }`}>
                <div className={`text-4xl font-bold ${
                  stance === 'Pro-India' ? 'text-green-400' :
                  stance === 'Anti-India' ? 'text-red-400' : 'text-yellow-400'
                }`}>{count}</div>
                <div className="text-sm text-white/60 mt-2">{stance}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;