import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Database, Shield, Bell, Check, RefreshCw } from 'lucide-react';

const Settings = ({ darkMode }) => {
  const [settings, setSettings] = useState({
    collectionInterval: 5,
    riskThreshold: 0.7,
    minCampaignVolume: 5,
    highRiskAlerts: true,
    botDetectionAlerts: true,
    dailySummary: false
  });
  
  const [systemStatus, setSystemStatus] = useState({
    database: 'checking',
    mlModels: 'checking',
    version: '1.0.0',
    lastUpdate: new Date().toLocaleDateString()
  });
  
  const [saved, setSaved] = useState(false);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    const savedSettings = localStorage.getItem('hexaciphers_settings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (e) {}
    }
    checkSystemStatus();
  }, []);

  const checkSystemStatus = async () => {
    setChecking(true);
    try {
      const response = await fetch('/api/health');
      if (response.ok) {
        setSystemStatus(prev => ({ ...prev, database: 'connected', mlModels: 'loaded' }));
      } else {
        setSystemStatus(prev => ({ ...prev, database: 'disconnected', mlModels: 'unavailable' }));
      }
    } catch (error) {
      setSystemStatus(prev => ({ ...prev, database: 'disconnected', mlModels: 'unavailable' }));
    } finally {
      setChecking(false);
    }
  };

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const saveSettings = () => {
    localStorage.setItem('hexaciphers_settings', JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected':
      case 'loaded':
        return 'text-green-400';
      case 'disconnected':
      case 'unavailable':
        return 'text-red-400';
      default:
        return 'text-yellow-400';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'connected':
        return 'Connected';
      case 'loaded':
        return 'Loaded';
      case 'disconnected':
        return 'Disconnected';
      case 'unavailable':
        return 'Unavailable';
      default:
        return 'Checking...';
    }
  };

  return (
    <div className="space-y-8 fade-in">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white drop-shadow-lg mb-2">
          Settings
        </h1>
        <p className="text-xl text-white/80 font-medium">
          Configure system parameters and monitoring settings
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className={`${darkMode ? 'dashboard-card-dark' : 'dashboard-card'} slide-up`}>
          <div className="flex items-center space-x-3 mb-6">
            <Database className="h-6 w-6 text-blue-400" />
            <h3 className="text-xl font-bold text-white">Data Collection</h3>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-white/80 mb-2">
                Collection Interval (minutes)
              </label>
              <input
                type="number"
                value={settings.collectionInterval}
                onChange={(e) => handleSettingChange('collectionInterval', parseInt(e.target.value) || 5)}
                min="1"
                max="60"
                className={`${darkMode ? 'input-modern-dark' : 'input-modern'}`}
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-white/80 mb-3">
                Platform Configuration
              </label>
              <div className="space-y-3">
                <label className="flex items-center p-3 bg-white/5 rounded-xl border border-white/10 cursor-not-allowed">
                  <input type="checkbox" checked disabled className="mr-3 h-4 w-4" />
                  <span className="text-sm text-white/80">Twitter/X</span>
                  <span className="ml-auto text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-lg">Active</span>
                </label>
              </div>
              <p className="text-xs text-white/50 mt-3">
                Currently monitoring Twitter/X for anti-India campaigns and sentiment analysis.
              </p>
            </div>
          </div>
        </div>

        <div className={`${darkMode ? 'dashboard-card-dark' : 'dashboard-card'} slide-up`} style={{animationDelay: '0.1s'}}>
          <div className="flex items-center space-x-3 mb-6">
            <Shield className="h-6 w-6 text-red-400" />
            <h3 className="text-xl font-bold text-white">Detection Settings</h3>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-white/80 mb-2">
                Risk Threshold: {Math.round(settings.riskThreshold * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={settings.riskThreshold}
                onChange={(e) => handleSettingChange('riskThreshold', parseFloat(e.target.value))}
                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
              <div className="flex justify-between text-xs text-white/50 mt-1">
                <span>Low (More alerts)</span>
                <span>High (Fewer alerts)</span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-white/80 mb-2">
                Minimum Campaign Volume
              </label>
              <input
                type="number"
                value={settings.minCampaignVolume}
                onChange={(e) => handleSettingChange('minCampaignVolume', parseInt(e.target.value) || 5)}
                min="1"
                max="100"
                className={`${darkMode ? 'input-modern-dark' : 'input-modern'}`}
              />
            </div>
          </div>
        </div>

        <div className={`${darkMode ? 'dashboard-card-dark' : 'dashboard-card'} slide-up`} style={{animationDelay: '0.2s'}}>
          <div className="flex items-center space-x-3 mb-6">
            <Bell className="h-6 w-6 text-yellow-400" />
            <h3 className="text-xl font-bold text-white">Alert Settings</h3>
          </div>
          
          <div className="space-y-4">
            <label className="flex items-center p-3 bg-white/5 rounded-xl border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
              <input 
                type="checkbox" 
                checked={settings.highRiskAlerts}
                onChange={(e) => handleSettingChange('highRiskAlerts', e.target.checked)}
                className="mr-3 h-4 w-4 accent-purple-500" 
              />
              <span className="text-sm text-white/80">High risk campaign alerts</span>
            </label>
            
            <label className="flex items-center p-3 bg-white/5 rounded-xl border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
              <input 
                type="checkbox" 
                checked={settings.botDetectionAlerts}
                onChange={(e) => handleSettingChange('botDetectionAlerts', e.target.checked)}
                className="mr-3 h-4 w-4 accent-purple-500" 
              />
              <span className="text-sm text-white/80">Bot detection alerts</span>
            </label>
            
            <label className="flex items-center p-3 bg-white/5 rounded-xl border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
              <input 
                type="checkbox" 
                checked={settings.dailySummary}
                onChange={(e) => handleSettingChange('dailySummary', e.target.checked)}
                className="mr-3 h-4 w-4 accent-purple-500" 
              />
              <span className="text-sm text-white/80">Daily summary reports</span>
            </label>
          </div>
        </div>

        <div className={`${darkMode ? 'dashboard-card-dark' : 'dashboard-card'} slide-up`} style={{animationDelay: '0.3s'}}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <SettingsIcon className="h-6 w-6 text-gray-400" />
              <h3 className="text-xl font-bold text-white">System Information</h3>
            </div>
            <button
              onClick={checkSystemStatus}
              disabled={checking}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            >
              <RefreshCw className={`h-4 w-4 text-white/60 ${checking ? 'animate-spin' : ''}`} />
            </button>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between p-3 bg-white/5 rounded-xl border border-white/10">
              <span className="text-sm text-white/60">Version</span>
              <span className="text-sm font-semibold text-white">{systemStatus.version}</span>
            </div>
            <div className="flex justify-between p-3 bg-white/5 rounded-xl border border-white/10">
              <span className="text-sm text-white/60">API Status</span>
              <span className={`text-sm font-semibold ${getStatusColor(systemStatus.database)}`}>
                {getStatusText(systemStatus.database)}
              </span>
            </div>
            <div className="flex justify-between p-3 bg-white/5 rounded-xl border border-white/10">
              <span className="text-sm text-white/60">ML Models</span>
              <span className={`text-sm font-semibold ${getStatusColor(systemStatus.mlModels)}`}>
                {getStatusText(systemStatus.mlModels)}
              </span>
            </div>
            <div className="flex justify-between p-3 bg-white/5 rounded-xl border border-white/10">
              <span className="text-sm text-white/60">Last Update</span>
              <span className="text-sm font-semibold text-white">{systemStatus.lastUpdate}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button 
          onClick={saveSettings}
          className="btn-primary flex items-center space-x-2"
        >
          {saved ? (
            <>
              <Check className="h-5 w-5" />
              <span>Saved!</span>
            </>
          ) : (
            <span>Save Settings</span>
          )}
        </button>
      </div>
    </div>
  );
};

export default Settings;