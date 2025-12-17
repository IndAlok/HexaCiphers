import React, { useState } from 'react';
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
  Divider,
  Paper,
} from '@mui/material';
import {
  Person,
  Search,
  Grade,
  SmartToy,
  TrendingUp,
  Security,
  SentimentSatisfied,
  SentimentDissatisfied,
  SentimentNeutral,
} from '@mui/icons-material';

const GradeDisplay = ({ grade }) => {
  const theme = useTheme();
  const getGradeColor = () => {
    if (grade?.startsWith('A')) return theme.palette.success.main;
    if (grade?.startsWith('B')) return theme.palette.info.main;
    if (grade?.startsWith('C')) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  return (
    <Box
      sx={{
        width: 120,
        height: 120,
        borderRadius: '50%',
        background: `linear-gradient(135deg, ${alpha(getGradeColor(), 0.2)} 0%, ${alpha(getGradeColor(), 0.1)} 100%)`,
        border: `4px solid ${getGradeColor()}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: `0 8px 25px ${alpha(getGradeColor(), 0.3)}`,
      }}
    >
      <Typography variant="h2" sx={{ fontWeight: 800, color: getGradeColor() }}>
        {grade || '?'}
      </Typography>
    </Box>
  );
};

const UserAnalysis = () => {
  const theme = useTheme();
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!username.trim()) return;
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

  return (
    <Fade in timeout={500}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          User Profile Analysis
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Complete analysis of Twitter user stance, influence, and bot probability
        </Typography>

        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="Twitter Username"
                placeholder="@username or profile URL"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
                InputProps={{
                  startAdornment: <Person sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
              <Button
                variant="contained"
                size="large"
                onClick={handleAnalyze}
                disabled={loading || !username.trim()}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Search />}
                sx={{ minWidth: 160 }}
              >
                {loading ? 'Analyzing...' : 'Analyze'}
              </Button>
            </Box>
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          </CardContent>
        </Card>

        {result && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card sx={{ textAlign: 'center', p: 3 }}>
                <Avatar
                  src={result.user?.profile_image_url?.replace('_normal', '_400x400')}
                  sx={{ width: 100, height: 100, mx: 'auto', mb: 2, boxShadow: 3 }}
                />
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {result.user?.display_name}
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 2 }}>
                  @{result.user?.username}
                </Typography>
                {result.user?.verified && (
                  <Chip label="Verified" color="primary" size="small" sx={{ mb: 2 }} />
                )}
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                  <GradeDisplay grade={result.analysis?.grade} />
                </Box>
                <Grid container spacing={1}>
                  <Grid item xs={4}>
                    <Typography variant="h6" fontWeight={700}>{(result.user?.followers / 1000).toFixed(1)}K</Typography>
                    <Typography variant="caption" color="text.secondary">Followers</Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="h6" fontWeight={700}>{(result.user?.following / 1000).toFixed(1)}K</Typography>
                    <Typography variant="caption" color="text.secondary">Following</Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="h6" fontWeight={700}>{result.user?.tweet_count}</Typography>
                    <Typography variant="caption" color="text.secondary">Tweets</Typography>
                  </Grid>
                </Grid>
              </Card>
            </Grid>

            <Grid item xs={12} md={8}>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                    <Grade sx={{ color: theme.palette.primary.main, fontSize: 32, mb: 1 }} />
                    <Typography variant="h5" fontWeight={700}>{result.analysis?.tweets_analyzed}</Typography>
                    <Typography variant="caption" color="text.secondary">Tweets Analyzed</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: alpha(theme.palette.secondary.main, 0.1) }}>
                    <TrendingUp sx={{ color: theme.palette.secondary.main, fontSize: 32, mb: 1 }} />
                    <Typography variant="h5" fontWeight={700}>{result.analysis?.influence_score?.toFixed(0)}</Typography>
                    <Typography variant="caption" color="text.secondary">Influence</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: alpha(theme.palette.warning.main, 0.1) }}>
                    <SmartToy sx={{ color: theme.palette.warning.main, fontSize: 32, mb: 1 }} />
                    <Typography variant="h5" fontWeight={700}>{(result.analysis?.bot_probability * 100).toFixed(0)}%</Typography>
                    <Typography variant="caption" color="text.secondary">Bot Probability</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: alpha(theme.palette.error.main, 0.1) }}>
                    <Security sx={{ color: theme.palette.error.main, fontSize: 32, mb: 1 }} />
                    <Typography variant="h5" fontWeight={700}>{result.analysis?.risk_score?.toFixed(0)}</Typography>
                    <Typography variant="caption" color="text.secondary">Risk Score</Typography>
                  </Paper>
                </Grid>
              </Grid>

              <Card sx={{ mt: 2 }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Stance Analysis</Typography>
                  <Chip
                    label={result.analysis?.stance_label}
                    size="large"
                    color={result.analysis?.stance_label === 'Pro-India' ? 'success' 
                      : result.analysis?.stance_label === 'Anti-India' ? 'error' : 'warning'}
                    sx={{ mb: 2 }}
                  />
                  <LinearProgress
                    variant="determinate"
                    value={((result.analysis?.stance_score || 0) + 1) * 50}
                    sx={{ height: 10, borderRadius: 5 }}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                    <Typography variant="caption">Anti-India</Typography>
                    <Typography variant="caption">Neutral</Typography>
                    <Typography variant="caption">Pro-India</Typography>
                  </Box>
                </CardContent>
              </Card>

              <Card sx={{ mt: 2 }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Sentiment Breakdown</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: alpha(theme.palette.success.main, 0.1), borderRadius: 2 }}>
                        <SentimentSatisfied sx={{ color: theme.palette.success.main, fontSize: 32 }} />
                        <Typography variant="h5" fontWeight={700} color="success.main">
                          {result.analysis?.sentiment_breakdown?.positive || 0}
                        </Typography>
                        <Typography variant="caption">Positive</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: alpha(theme.palette.warning.main, 0.1), borderRadius: 2 }}>
                        <SentimentNeutral sx={{ color: theme.palette.warning.main, fontSize: 32 }} />
                        <Typography variant="h5" fontWeight={700} color="warning.main">
                          {result.analysis?.sentiment_breakdown?.neutral || 0}
                        </Typography>
                        <Typography variant="caption">Neutral</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: alpha(theme.palette.error.main, 0.1), borderRadius: 2 }}>
                        <SentimentDissatisfied sx={{ color: theme.palette.error.main, fontSize: 32 }} />
                        <Typography variant="h5" fontWeight={700} color="error.main">
                          {result.analysis?.sentiment_breakdown?.negative || 0}
                        </Typography>
                        <Typography variant="caption">Negative</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Box>
    </Fade>
  );
};

export default UserAnalysis;
