import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [dashboardData, setDashboardData] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [keywords, setKeywords] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [monitoring, setMonitoring] = useState(false);
  const [newKeyword, setNewKeyword] = useState({
    keyword: '',
    category: 'political',
    weight: 5
  });

  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchDashboardData();
    fetchAlerts();
    fetchKeywords();
    const interval = setInterval(() => {
      if (activeTab === 'dashboard') fetchDashboardData();
      if (activeTab === 'alerts') fetchAlerts();
    }, 30000);
    return () => clearInterval(interval);
  }, [activeTab]);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/dashboard-data`);
      setDashboardData(response.data);
      setMonitoring(response.data.monitoring_status);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const fetchAlerts = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/alerts`);
      setAlerts(response.data);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  const fetchKeywords = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/keywords`);
      setKeywords(response.data);
    } catch (error) {
      console.error('Error fetching keywords:', error);
    }
  };

  const startMonitoring = async () => {
    try {
      await axios.post(`${API_BASE}/api/start-monitoring`);
      setMonitoring(true);
      alert('Monitoring started successfully');
    } catch (error) {
      alert('Failed to start monitoring. Check API credentials.');
    }
  };

  const stopMonitoring = async () => {
    try {
      await axios.post(`${API_BASE}/api/stop-monitoring`);
      setMonitoring(false);
      alert('Monitoring stopped');
    } catch (error) {
      alert('Failed to stop monitoring');
    }
  };

  const addKeyword = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/api/keywords`, newKeyword);
      setNewKeyword({ keyword: '', category: 'political', weight: 5 });
      fetchKeywords();
      alert('Keyword added successfully');
    } catch (error) {
      alert('Failed to add keyword');
    }
  };

  const getThreatColor = (level) => {
    switch (level) {
      case 'high': return '#ff4444';
      case 'medium': return '#ffaa00';
      case 'low': return '#44ff44';
      default: return '#888';
    }
  };

  const ThreatStats = () => {
    if (!dashboardData?.threat_stats) return <div>Loading...</div>;
    
    const total = Object.values(dashboardData.threat_stats).reduce((a, b) => a + b, 0);
    
    return (
      <div className="threat-stats">
        <h3>24-Hour Threat Summary</h3>
        <div className="stats-grid">
          {Object.entries(dashboardData.threat_stats).map(([level, count]) => (
            <div key={level} className="stat-card" style={{ borderLeft: `4px solid ${getThreatColor(level)}` }}>
              <h4>{level.toUpperCase()}</h4>
              <div className="stat-number">{count}</div>
              <div className="stat-percent">{total > 0 ? ((count / total) * 100).toFixed(1) : 0}%</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const RecentThreats = () => (
    <div className="recent-threats">
      <h3>Recent High-Priority Content</h3>
      <div className="threats-list">
        {dashboardData?.recent_threats?.slice(0, 10).map(threat => (
          <div key={threat.tweet_id} className="threat-item">
            <div className="threat-header">
              <span className={`threat-badge ${threat.threat_level}`}>
                {threat.threat_level.toUpperCase()}
              </span>
              <span className="engagement">
                ❤️ {threat.like_count} 🔄 {threat.retweet_count}
              </span>
            </div>
            <div className="threat-text">{threat.text}</div>
            <div className="threat-meta">
              Score: {threat.sentiment_score.toFixed(2)} | 
              {new Date(threat.created_at).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const AlertsPanel = () => (
    <div className="alerts-panel">
      <h2>Active Alerts</h2>
      <div className="alerts-list">
        {alerts.map(alert => (
          <div key={alert.alert_id} className="alert-item">
            <div className="alert-header">
              <span className={`alert-badge ${alert.threat_level}`}>
                {alert.threat_level.toUpperCase()} THREAT
              </span>
              <span className="alert-time">
                {new Date(alert.created_at).toLocaleString()}
              </span>
            </div>
            <div className="alert-content">
              <div className="alert-text">{alert.text}</div>
              <div className="alert-keywords">
                Keywords: {alert.matched_keywords.join(', ')}
              </div>
              <div className="alert-engagement">
                ❤️ {alert.like_count} | 🔄 {alert.retweet_count} | 
                Score: {alert.sentiment_score.toFixed(2)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const KeywordsPanel = () => (
    <div className="keywords-panel">
      <h2>Keyword Management</h2>
      
      <form onSubmit={addKeyword} className="keyword-form">
        <input
          type="text"
          placeholder="New keyword"
          value={newKeyword.keyword}
          onChange={(e) => setNewKeyword({...newKeyword, keyword: e.target.value})}
          required
        />
        <select
          value={newKeyword.category}
          onChange={(e) => setNewKeyword({...newKeyword, category: e.target.value})}
        >
          <option value="political">Political</option>
          <option value="security">Security</option>
          <option value="propaganda">Propaganda</option>
          <option value="hate">Hate Speech</option>
          <option value="military">Military</option>
          <option value="religious">Religious</option>
          <option value="cultural">Cultural</option>
          <option value="racist">Racist</option>
        </select>
        <input
          type="number"
          min="1"
          max="10"
          value={newKeyword.weight}
          onChange={(e) => setNewKeyword({...newKeyword, weight: parseInt(e.target.value)})}
        />
        <button type="submit">Add Keyword</button>
      </form>

      <div className="keywords-list">
        {keywords.map((kw, idx) => (
          <div key={idx} className="keyword-item">
            <span className="keyword-text">"{kw.keyword}"</span>
            <span className="keyword-category">{kw.category}</span>
            <span className="keyword-weight">Weight: {kw.weight}</span>
            <span className={`keyword-status ${kw.active ? 'active' : 'inactive'}`}>
              {kw.active ? 'Active' : 'Inactive'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="App">
      <header className="app-header">
        <h1>🛡️ HexaCiphers - Anti-India Content Detection</h1>
        <div className="monitoring-controls">
          <span className={`status-indicator ${monitoring ? 'active' : 'inactive'}`}>
            {monitoring ? '🟢 MONITORING' : '🔴 STOPPED'}
          </span>
          {monitoring ? (
            <button onClick={stopMonitoring} className="btn-stop">Stop Monitoring</button>
          ) : (
            <button onClick={startMonitoring} className="btn-start">Start Monitoring</button>
          )}
        </div>
      </header>

      <nav className="nav-tabs">
        <button 
          className={activeTab === 'dashboard' ? 'active' : ''}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
        <button 
          className={activeTab === 'alerts' ? 'active' : ''}
          onClick={() => setActiveTab('alerts')}
        >
          Alerts ({alerts.length})
        </button>
        <button 
          className={activeTab === 'keywords' ? 'active' : ''}
          onClick={() => setActiveTab('keywords')}
        >
          Keywords ({keywords.length})
        </button>
      </nav>

      <main className="main-content">
        {activeTab === 'dashboard' && (
          <div className="dashboard">
            <ThreatStats />
            <RecentThreats />
          </div>
        )}
        {activeTab === 'alerts' && <AlertsPanel />}
        {activeTab === 'keywords' && <KeywordsPanel />}
      </main>
    </div>
  );
}

export default App;