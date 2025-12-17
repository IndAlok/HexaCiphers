import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Chip,
  LinearProgress,
  Avatar,
  useTheme,
  alpha,
  Fade,
  Zoom,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  People,
  Article,
  Campaign,
  Security,
  Search,
  Analytics,
} from '@mui/icons-material';

const StatCard = ({ title, value, icon: Icon, color, trend, delay = 0 }) => {
  const theme = useTheme();
  
  return (
    <Zoom in timeout={300 + delay}>
      <Card
        sx={{
          height: '100%',
          background: `linear-gradient(135deg, ${alpha(color, 0.1)} 0%, ${alpha(color, 0.05)} 100%)`,
          border: `1px solid ${alpha(color, 0.2)}`,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: `0 8px 25px ${alpha(color, 0.25)}`,
          },
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {title}
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color }}>
                {value}
              </Typography>
              {trend && (
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, gap: 0.5 }}>
                  {trend > 0 ? (
                    <TrendingUp sx={{ fontSize: 16, color: theme.palette.success.main }} />
                  ) : (
                    <TrendingDown sx={{ fontSize: 16, color: theme.palette.error.main }} />
                  )}
                  <Typography 
                    variant="caption" 
                    sx={{ color: trend > 0 ? theme.palette.success.main : theme.palette.error.main }}
                  >
                    {Math.abs(trend)}% this week
                  </Typography>
                </Box>
              )}
            </Box>
            <Avatar
              sx={{
                width: 56,
                height: 56,
                background: `linear-gradient(135deg, ${color} 0%, ${alpha(color, 0.7)} 100%)`,
                boxShadow: `0 4px 14px ${alpha(color, 0.4)}`,
              }}
            >
              <Icon sx={{ color: 'white' }} />
            </Avatar>
          </Box>
        </CardContent>
      </Card>
    </Zoom>
  );
};

const Dashboard = () => {
  const theme = useTheme();
  const [stats, setStats] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    Promise.all([
      fetch('/api/stats').then(r => r.json()),
      fetch('/api/posts?limit=5').then(r => r.json()),
    ]).then(([statsData, postsData]) => {
      if (statsData.status === 'success') setStats(statsData.data);
      if (postsData.status === 'success') setPosts(postsData.data || []);
    }).catch(console.error)
    .finally(() => setLoading(false));
  }, []);

  const overview = stats?.overview || {};
  const sentiment = stats?.sentiment_distribution || {};

  const navigate = useNavigate();

  const handleAnalyze = () => {
    if (!searchQuery.trim()) return;

    const query = searchQuery.trim();
    // Simple heuristic: if it contains http or twitter.com or x.com, it's a URL
    if (query.match(/^(http|https:\/\/|www\.|twitter\.com|x\.com)/)) {
      navigate(`/url-analysis?url=${encodeURIComponent(query)}`);
    } else {
      // Otherwise treat as username
      navigate(`/user-analysis?username=${encodeURIComponent(query.replace('@', ''))}`);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAnalyze();
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress size={48} />
      </Box>
    );
  }

  const totalSentiment = (sentiment.positive || 0) + (sentiment.neutral || 0) + (sentiment.negative || 0) || 1;

  return (
    <Fade in timeout={500}>
      <Box>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Real-time Twitter sentiment analysis and monitoring
          </Typography>
        </Box>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Posts Analyzed"
              value={overview.total_posts || 0}
              icon={Article}
              color={theme.palette.primary.main}
              trend={12}
              delay={0}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Users Profiled"
              value={overview.total_users || 0}
              icon={People}
              color={theme.palette.secondary.main}
              trend={8}
              delay={100}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Active Campaigns"
              value={overview.total_campaigns || 0}
              icon={Campaign}
              color={theme.palette.warning.main}
              trend={-3}
              delay={200}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="High Risk"
              value={overview.high_risk_posts || 0}
              icon={Security}
              color={theme.palette.error.main}
              delay={300}
            />
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Sentiment Distribution
                </Typography>
                
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Positive</Typography>
                    <Typography variant="body2" color="success.main" fontWeight={600}>
                      {sentiment.positive || 0} ({((sentiment.positive || 0) / totalSentiment * 100).toFixed(1)}%)
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(sentiment.positive || 0) / totalSentiment * 100}
                    sx={{
                      bgcolor: alpha(theme.palette.success.main, 0.1),
                      '& .MuiLinearProgress-bar': {
                        background: `linear-gradient(90deg, ${theme.palette.success.main} 0%, ${theme.palette.success.light} 100%)`,
                      },
                    }}
                  />
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Neutral</Typography>
                    <Typography variant="body2" color="warning.main" fontWeight={600}>
                      {sentiment.neutral || 0} ({((sentiment.neutral || 0) / totalSentiment * 100).toFixed(1)}%)
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(sentiment.neutral || 0) / totalSentiment * 100}
                    sx={{
                      bgcolor: alpha(theme.palette.warning.main, 0.1),
                      '& .MuiLinearProgress-bar': {
                        background: `linear-gradient(90deg, ${theme.palette.warning.main} 0%, ${theme.palette.warning.light} 100%)`,
                      },
                    }}
                  />
                </Box>

                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Negative</Typography>
                    <Typography variant="body2" color="error.main" fontWeight={600}>
                      {sentiment.negative || 0} ({((sentiment.negative || 0) / totalSentiment * 100).toFixed(1)}%)
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(sentiment.negative || 0) / totalSentiment * 100}
                    sx={{
                      bgcolor: alpha(theme.palette.error.main, 0.1),
                      '& .MuiLinearProgress-bar': {
                        background: `linear-gradient(90deg, ${theme.palette.error.main} 0%, ${theme.palette.error.light} 100%)`,
                      },
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Quick Analysis
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Enter tweet URL or username..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyPress}
                  sx={{ mb: 2 }}
                  InputProps={{
                    startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  startIcon={<Analytics />}
                  onClick={handleAnalyze}
                  disabled={!searchQuery.trim()}
                >
                  Analyze
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Recent Analyses
                </Typography>
                {posts.length > 0 ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {posts.map((post, i) => (
                      <Box
                        key={post.id || i}
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          bgcolor: alpha(theme.palette.primary.main, 0.05),
                          border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                        }}
                      >
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          {post.content?.substring(0, 150)}...
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Chip 
                            label={post.sentiment || 'unknown'} 
                            size="small"
                            color={post.sentiment === 'positive' ? 'success' : post.sentiment === 'negative' ? 'error' : 'warning'}
                          />
                          <Chip 
                            label={post.classification || 'Neutral'} 
                            size="small"
                            variant="outlined"
                            color={post.classification === 'Pro-India' ? 'success' : post.classification === 'Anti-India' ? 'error' : 'default'}
                          />
                        </Box>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Alert severity="info">No posts analyzed yet. Start by analyzing a tweet URL.</Alert>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Fade>
  );
};

export default Dashboard;
