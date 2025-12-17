import React, { useState, useEffect } from 'react';
import { AlertTriangle, TrendingUp, Users, Activity } from 'lucide-react';
import SentimentChart from './SentimentChart';

const TwitterDashboard = () => {
  const [alerts, setAlerts] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [metrics, setMetrics] = useState({
    totalPosts: 0,
    antiIndiaContent: 0,
    activeCampaigns: 0,
    highRiskPosts: 0
  });
  const [sentimentData, setSentimentData] = useState({
    positive: 0,
    negative: 0,
    neutral: 0
  });

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [postsRes, campaignsRes, statsRes] = await Promise.all([
        fetch('/api/posts?limit=10'),
        fetch('/api/campaigns'),
        fetch('/api/stats')
      ]);

      const postsData = await postsRes.json();
      const campaignsData = await campaignsRes.json();
      const statsData = await statsRes.json();

      if (postsData?.data && Array.isArray(postsData.data)) {
        setAlerts(postsData.data);
      }

      if (campaignsData?.data && Array.isArray(campaignsData.data)) {
        setCampaigns(campaignsData.data);
      }
      
      if (statsData?.data) {
        const stats = statsData.data;
        setMetrics({
          totalPosts: stats.total_posts || 0,
          antiIndiaContent: stats.classification_distribution?.anti_india || 0,
          activeCampaigns: stats.total_campaigns || 0,
          highRiskPosts: stats.high_risk_posts || 0
        });

        setSentimentData({
          positive: stats.sentiment_distribution?.positive || 0,
          negative: stats.sentiment_distribution?.negative || 0,
          neutral: stats.sentiment_distribution?.neutral || 0
        });
      }
    } catch (error) {
      setAlerts([]);
      setCampaigns([]);
    }
  };

  const getSeverityColor = (sentiment) => {
    switch (sentiment) {
      case 'negative': return 'text-red-600 bg-red-100';
      case 'positive': return 'text-green-600 bg-green-100';
      case 'neutral': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-8 fade-in">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white drop-shadow-lg mb-2">
          Anti-India Campaign Monitor
        </h1>
        <p className="text-xl text-white/80 font-medium">
          Real-time monitoring and analysis of Twitter/X
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="metric-card-blue">
          <div className="flex items-center">
            <Activity className="h-8 w-8 text-white" />
            <div className="ml-4">
              <p className="text-sm font-medium text-white/80">Total Posts</p>
              <p className="text-2xl font-bold text-white">{metrics.totalPosts.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="metric-card-red">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-white" />
            <div className="ml-4">
              <p className="text-sm font-medium text-white/80">Anti-India Content</p>
              <p className="text-2xl font-bold text-white">{metrics.antiIndiaContent.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="metric-card-orange">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-white" />
            <div className="ml-4">
              <p className="text-sm font-medium text-white/80">Active Campaigns</p>
              <p className="text-2xl font-bold text-white">{metrics.activeCampaigns}</p>
            </div>
          </div>
        </div>

        <div className="metric-card-purple">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-white" />
            <div className="ml-4">
              <p className="text-sm font-medium text-white/80">High Risk Posts</p>
              <p className="text-2xl font-bold text-white">{metrics.highRiskPosts}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="dashboard-card slide-up">
          <h2 className="text-xl font-bold text-white mb-4">Recent Posts</h2>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {alerts.length > 0 ? alerts.map((alert, index) => (
              <div key={alert.id || index} className="border-l-4 border-blue-500 pl-4 py-2 bg-white/5 rounded-r-lg">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-sm text-white/80 mt-1">
                      {alert.content?.substring(0, 150) || 'Content not available'}
                      {alert.content?.length > 150 ? '...' : ''}
                    </p>
                    <p className="text-xs text-white/50 mt-2">
                      {alert.analyzed_at ? new Date(alert.analyzed_at).toLocaleString() : ''}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded ml-2 ${getSeverityColor(alert.sentiment)}`}>
                    {alert.sentiment || 'unknown'}
                  </span>
                </div>
              </div>
            )) : (
              <p className="text-white/50 text-center py-8">No posts analyzed yet. Use URL Analysis to add posts.</p>
            )}
          </div>
        </div>

        <div className="dashboard-card slide-up" style={{animationDelay: '0.1s'}}>
          <h2 className="text-xl font-bold text-white mb-4">Detected Campaigns</h2>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {campaigns.length > 0 ? campaigns.map((campaign, index) => (
              <div key={campaign.id || index} className="border border-white/10 rounded-xl p-4 bg-white/5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-white">#{campaign.hashtag}</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    campaign.risk_score > 0.7 ? 'text-red-400 bg-red-900/30' :
                    campaign.risk_score > 0.4 ? 'text-yellow-400 bg-yellow-900/30' :
                    'text-green-400 bg-green-900/30'
                  }`}>
                    {(campaign.risk_score * 100).toFixed(0)}% risk
                  </span>
                </div>
                <div className="text-sm text-white/60">
                  <p>Volume: {campaign.volume || 0} posts</p>
                </div>
              </div>
            )) : (
              <p className="text-white/50 text-center py-8">No campaigns detected yet.</p>
            )}
          </div>
        </div>
      </div>

      <div className="dashboard-card scale-in" style={{animationDelay: '0.2s'}}>
        <h2 className="text-xl font-bold text-white mb-4">Sentiment Analysis Overview</h2>
        <SentimentChart data={sentimentData} />
      </div>
    </div>
  );
};

export default TwitterDashboard;