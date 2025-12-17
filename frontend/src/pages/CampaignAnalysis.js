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
  Avatar,
  useTheme,
  alpha,
  Fade,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Tag,
  Search,
  Group,
  TrendingUp,
  SmartToy,
  Whatshot,
} from '@mui/icons-material';

const CampaignAnalysis = () => {
  const theme = useTheme();
  const [hashtag, setHashtag] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!hashtag.trim()) return;
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/analyze-campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hashtag: hashtag.trim() })
      });
      const data = await response.json();
      if (response.ok) {
        setResult(data.data);
      } else {
        setError(data.message || 'Failed to analyze campaign');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (score) => {
    if (score >= 70) return theme.palette.error.main;
    if (score >= 40) return theme.palette.warning.main;
    return theme.palette.success.main;
  };

  return (
    <Fade in timeout={500}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Campaign Analysis
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Detect coordinated hashtag campaigns and bot activity
        </Typography>

        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="Hashtag"
                placeholder="#DigitalIndia or DigitalIndia"
                value={hashtag}
                onChange={(e) => setHashtag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
                InputProps={{
                  startAdornment: <Tag sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
              <Button
                variant="contained"
                size="large"
                onClick={handleAnalyze}
                disabled={loading || !hashtag.trim()}
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
            <Grid item xs={12}>
              <Card sx={{ background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)` }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ width: 64, height: 64, bgcolor: theme.palette.primary.main }}>
                        <Tag sx={{ fontSize: 32 }} />
                      </Avatar>
                      <Box>
                        <Typography variant="h4" fontWeight={700}>#{result.hashtag}</Typography>
                        <Typography color="text.secondary">{result.analysis?.tweet_count} tweets analyzed</Typography>
                      </Box>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="h3" fontWeight={800} sx={{ color: getRiskColor(result.analysis?.risk_score) }}>
                        {result.analysis?.risk_score?.toFixed(0)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">Risk Score</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={6} sm={4} md={2.4}>
              <Card sx={{ textAlign: 'center', p: 2 }}>
                <Tag sx={{ fontSize: 32, color: theme.palette.primary.main, mb: 1 }} />
                <Typography variant="h5" fontWeight={700}>{result.analysis?.tweet_count}</Typography>
                <Typography variant="caption" color="text.secondary">Tweets</Typography>
              </Card>
            </Grid>
            <Grid item xs={6} sm={4} md={2.4}>
              <Card sx={{ textAlign: 'center', p: 2 }}>
                <Group sx={{ fontSize: 32, color: theme.palette.secondary.main, mb: 1 }} />
                <Typography variant="h5" fontWeight={700}>{result.analysis?.unique_users}</Typography>
                <Typography variant="caption" color="text.secondary">Users</Typography>
              </Card>
            </Grid>
            <Grid item xs={6} sm={4} md={2.4}>
              <Card sx={{ textAlign: 'center', p: 2 }}>
                <TrendingUp sx={{ fontSize: 32, color: theme.palette.success.main, mb: 1 }} />
                <Typography variant="h5" fontWeight={700}>{result.analysis?.total_engagement?.toLocaleString()}</Typography>
                <Typography variant="caption" color="text.secondary">Engagement</Typography>
              </Card>
            </Grid>
            <Grid item xs={6} sm={4} md={2.4}>
              <Card sx={{ textAlign: 'center', p: 2 }}>
                <Whatshot sx={{ fontSize: 32, color: theme.palette.warning.main, mb: 1 }} />
                <Typography variant="h5" fontWeight={700}>{(result.analysis?.coordination_score * 100).toFixed(0)}%</Typography>
                <Typography variant="caption" color="text.secondary">Coordination</Typography>
              </Card>
            </Grid>
            <Grid item xs={6} sm={4} md={2.4}>
              <Card sx={{ textAlign: 'center', p: 2 }}>
                <SmartToy sx={{ fontSize: 32, color: theme.palette.error.main, mb: 1 }} />
                <Typography variant="h5" fontWeight={700}>{(result.analysis?.bot_percentage * 100).toFixed(0)}%</Typography>
                <Typography variant="caption" color="text.secondary">Suspicious</Typography>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Stance Distribution</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: alpha(theme.palette.success.main, 0.1), borderRadius: 2 }}>
                        <Typography variant="h4" fontWeight={700} color="success.main">
                          {result.analysis?.stance_breakdown?.pro_india || 0}
                        </Typography>
                        <Typography variant="caption">Pro-India</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: alpha(theme.palette.warning.main, 0.1), borderRadius: 2 }}>
                        <Typography variant="h4" fontWeight={700} color="warning.main">
                          {result.analysis?.stance_breakdown?.neutral || 0}
                        </Typography>
                        <Typography variant="caption">Neutral</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: alpha(theme.palette.error.main, 0.1), borderRadius: 2 }}>
                        <Typography variant="h4" fontWeight={700} color="error.main">
                          {result.analysis?.stance_breakdown?.anti_india || 0}
                        </Typography>
                        <Typography variant="caption">Anti-India</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Top Contributors</Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>User</TableCell>
                          <TableCell align="right">Tweets</TableCell>
                          <TableCell align="right">Followers</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {result.top_users?.slice(0, 5).map((user, i) => (
                          <TableRow key={i}>
                            <TableCell>@{user.username}</TableCell>
                            <TableCell align="right">{user.tweets}</TableCell>
                            <TableCell align="right">{(user.followers / 1000).toFixed(1)}K</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Sample Tweets</Typography>
                  <Grid container spacing={2}>
                    {result.sample_tweets?.slice(0, 6).map((tweet, i) => (
                      <Grid item xs={12} sm={6} key={tweet.tweet_id || i}>
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            bgcolor: alpha(theme.palette.primary.main, 0.03),
                            border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                          }}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="caption" color="text.secondary">@{tweet.username}</Typography>
                            <Chip
                              label={tweet.classification}
                              size="small"
                              color={tweet.classification === 'Pro-India' ? 'success' 
                                : tweet.classification === 'Anti-India' ? 'error' : 'warning'}
                            />
                          </Box>
                          <Typography variant="body2">{tweet.content}</Typography>
                        </Box>
                      </Grid>
                    ))}
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

export default CampaignAnalysis;
