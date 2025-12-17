import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Button,
  Alert,
  CircularProgress,
  useTheme,
  alpha,
  Fade,
  Chip,
  Grid
} from '@mui/material';
import {
  Palette,
  Notifications,
  Storage,
  Dns,
  Save,
  Cached,
  CheckCircle,
  Error as ErrorIcon
} from '@mui/icons-material';
import { useThemeMode } from '../ThemeContext';

const Settings = () => {
  const theme = useTheme();
  const { mode, setMode } = useThemeMode();
  
  // Local state for settings that might be stored in localStorage
  const [settings, setSettings] = useState({
    notifications: true,
    autoRefresh: true,
    highContrast: false,
  });
  
  const [healthStatus, setHealthStatus] = useState(null);
  const [checkingHealth, setCheckingHealth] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
    checkSystemHealth();
  }, []);

  const handleSettingChange = (setting) => (event) => {
    setSettings((prev) => ({
      ...prev,
      [setting]: event.target.checked,
    }));
  };

  const saveSettings = () => {
    localStorage.setItem('appSettings', JSON.stringify(settings));
    setMessage({ type: 'success', text: 'Settings saved successfully' });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const checkSystemHealth = async () => {
    setCheckingHealth(true);
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      setHealthStatus(data);
    } catch (error) {
      setHealthStatus({ status: 'error', error: 'Failed to connect' });
    } finally {
      setCheckingHealth(false);
    }
  };

  const clearCache = () => {
    // In a real app this might call an API endpoint or clear specific local storage keys
    localStorage.removeItem('user_cache'); // Example
    setMessage({ type: 'info', text: 'Local cache cleared' });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  return (
    <Fade in timeout={500}>
      <Box maxWidth="md">
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Settings
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Manage application preferences and system status
        </Typography>

        {message.text && (
          <Alert severity={message.type} sx={{ mb: 3 }}>
            {message.text}
          </Alert>
        )}

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Palette sx={{ mr: 1.5, color: theme.palette.primary.main }} />
              <Typography variant="h6" fontWeight={600}>Appearance</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            <List disablePadding>
              <ListItem>
                <ListItemText 
                  primary="Dark Mode" 
                  secondary="Use dark theme for low-light environments" 
                />
                <ListItemSecondaryAction>
                  <Switch
                    edge="end"
                    checked={mode === 'dark'}
                    onChange={() => setMode(mode === 'dark' ? 'light' : 'dark')}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Notifications sx={{ mr: 1.5, color: theme.palette.secondary.main }} />
              <Typography variant="h6" fontWeight={600}>Notifications & Behavior</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            <List disablePadding>
              <ListItem>
                <ListItemText 
                  primary="Enable Notifications" 
                  secondary="Receive alerts for high-risk campaigns" 
                />
                <ListItemSecondaryAction>
                  <Switch
                    edge="end"
                    checked={settings.notifications}
                    onChange={handleSettingChange('notifications')}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <Divider component="li" />
              <ListItem>
                <ListItemText 
                  primary="Auto-Refresh Data" 
                  secondary="Automatically update dashboard statistics every minute" 
                />
                <ListItemSecondaryAction>
                  <Switch
                    edge="end"
                    checked={settings.autoRefresh}
                    onChange={handleSettingChange('autoRefresh')}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Dns sx={{ mr: 1.5, color: theme.palette.info.main }} />
              <Typography variant="h6" fontWeight={600}>System Status</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box>
                <Typography variant="subtitle1" fontWeight={500}>API Connection</Typography>
                <Typography variant="caption" color="text.secondary">Status of the backend server</Typography>
              </Box>
              {checkingHealth ? (
                <CircularProgress size={20} />
              ) : healthStatus?.status === 'healthy' ? (
                <Chip icon={<CheckCircle />} label="Healthy" color="success" size="small" />
              ) : (
                <Chip icon={<ErrorIcon />} label="Error" color="error" size="small" />
              )}
            </Box>

            {healthStatus && (
              <Box sx={{ bgcolor: alpha(theme.palette.background.default, 0.5), p: 2, borderRadius: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Database</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {healthStatus.checks?.database ? 'Connected' : 'Disconnected'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Twitter API</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {healthStatus.checks?.twitter_api ? 'Configured' : 'Missing Config'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">Environment</Typography>
                    <Typography variant="body2">{healthStatus.environment || 'Production'}</Typography>
                  </Grid>
                </Grid>
              </Box>
            )}
            
            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
              <Button 
                variant="outlined" 
                startIcon={<Cached />} 
                onClick={checkSystemHealth}
                disabled={checkingHealth}
                size="small"
              >
                Refresh Status
              </Button>
            </Box>
          </CardContent>
        </Card>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button 
            variant="outlined" 
            color="error" 
            startIcon={<Storage />} 
            onClick={clearCache}
          >
            Clear Local Cache
          </Button>
          <Button 
            variant="contained" 
            startIcon={<Save />} 
            onClick={saveSettings}
          >
            Save Changes
          </Button>
        </Box>
      </Box>
    </Fade>
  );
};

export default Settings;