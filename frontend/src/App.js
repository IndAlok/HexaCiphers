import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import { ThemeProvider, useThemeMode } from './ThemeContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import UserAnalysis from './pages/UserAnalysis';
import ThreadAnalysis from './pages/ThreadAnalysis';
import CampaignAnalysis from './pages/CampaignAnalysis';
import URLAnalysis from './pages/URLAnalysis';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';

const DRAWER_WIDTH = 280;

const AppContent = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { mode } = useThemeMode();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Navbar 
        drawerWidth={DRAWER_WIDTH} 
        onDrawerToggle={handleDrawerToggle} 
      />
      <Sidebar 
        drawerWidth={DRAWER_WIDTH}
        mobileOpen={mobileOpen}
        onDrawerToggle={handleDrawerToggle}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          mt: '64px',
          minHeight: 'calc(100vh - 64px)',
          background: mode === 'dark' 
            ? 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)'
            : 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 50%, #f8fafc 100%)',
          p: { xs: 2, sm: 3 },
        }}
      >
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/user-analysis" element={<UserAnalysis />} />
          <Route path="/thread-analysis" element={<ThreadAnalysis />} />
          <Route path="/campaign-analysis" element={<CampaignAnalysis />} />
          <Route path="/url-analysis" element={<URLAnalysis />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Box>
    </Box>
  );
};

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}

export default App;