import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  BarChart3, Shield, TrendingUp, Settings, Hash,
  X, Link as LinkIcon, User, MessageSquare, Activity
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
  { name: 'User Analysis', href: '/user-analysis', icon: User },
  { name: 'Thread Analysis', href: '/thread-analysis', icon: MessageSquare },
  { name: 'Campaign Analysis', href: '/campaign-analysis', icon: Hash },
  { name: 'Tweet Analysis', href: '/url-analysis', icon: LinkIcon },
  { name: 'Analytics', href: '/analytics', icon: TrendingUp },
  { name: 'Settings', href: '/settings', icon: Settings },
];

const Sidebar = ({ sidebarOpen, setSidebarOpen, darkMode }) => {
  const location = useLocation();
  const [stats, setStats] = useState({ posts: 0, users: 0, campaigns: 0 });

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success' && data.data) {
          setStats({
            posts: data.data.overview?.total_posts || 0,
            users: data.data.overview?.total_users || 0,
            campaigns: data.data.overview?.total_campaigns || 0
          });
        }
      })
      .catch(() => {});
  }, []);

  return (
    <>
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 ${darkMode ? 'glass-dark' : 'glass-card'} shadow-xl transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 border-r border-white/20
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-between px-4 border-b border-white/20">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Shield className="h-6 w-6 text-white drop-shadow-lg" />
                <div className="absolute inset-0 h-6 w-6 bg-white/20 rounded-full blur-lg"></div>
              </div>
              <span className="text-lg font-bold text-white drop-shadow-sm">HexaCiphers</span>
            </div>
            <button
              type="button"
              className="lg:hidden text-white/80 hover:text-white transition-colors duration-200"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href || 
                (item.href === '/dashboard' && location.pathname === '/');
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 relative overflow-hidden
                    ${isActive
                      ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm border border-white/30'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                    }
                  `}
                  onClick={() => setSidebarOpen(false)}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-500/20 rounded-lg"></div>
                  )}
                  <item.icon className={`mr-3 h-5 w-5 relative z-10 ${isActive ? 'text-white' : 'text-white/60'}`} />
                  <span className="relative z-10">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="px-3 py-3">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-white">Statistics</span>
                <Activity className="h-3 w-3 text-green-400 pulse-status" />
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-white/70">Posts Analyzed</span>
                  <span className="text-blue-400 font-semibold">{stats.posts}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-white/70">Users Profiled</span>
                  <span className="text-purple-400 font-semibold">{stats.users}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-white/70">Campaigns</span>
                  <span className="text-orange-400 font-semibold">{stats.campaigns}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-white/20 p-3">
            <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg p-3 border border-white/10">
              <div className="text-xs text-white/80 mb-1">Powered by</div>
              <div className="text-sm font-semibold text-white">Twitter API v2</div>
              <div className="text-xs text-white/60 mt-1">Real-time analysis</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;