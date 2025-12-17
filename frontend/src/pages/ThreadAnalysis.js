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
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from '@mui/material';
import {
  Forum,
  Search,
  Group,
  Whatshot,
  TrendingUp,
  Comment,
  ThumbUp,
} from '@mui/icons-material';

const ThreadAnalysis = () => {
  const theme = useTheme();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/analyze-thread', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() })
      });
      const data = await response.json();
      if (response.ok) {
        setResult(data.data);
      } else {
        setError(data.message || 'Failed to analyze thread');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getControversyColor = (score) => {
    if (score >= 0.7) return theme.palette.error.main;
    if (score >= 0.4) return theme.palette.warning.main;
    return theme.palette.success.main;
  };

  return (
    <Fade in timeout={500}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Thread Analysis
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Analyze entire Twitter conversations and replies
        </Typography>

        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="Tweet URL"
                placeholder="https://twitter.com/user/status/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
                InputProps={{
                  startAdornment: <Forum sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
              <Button
                variant="contained"
                size="large"
                onClick={handleAnalyze}
                disabled={loading || !url.trim()}
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
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Root Tweet</Typography>
                  <Box sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar>{result.root_tweet?.username?.[0]?.toUpperCase()}</Avatar>
                      <Box>
                        <Typography fontWeight={600}>{result.root_tweet?.display_name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          @{result.root_tweet?.username}
                        </Typography>
                      </Box>
                      <Chip
                        label={result.root_tweet?.classification}
                        size="small"
                        color={result.root_tweet?.classification === 'Pro-India' ? 'success' 
                          : result.root_tweet?.classification === 'Anti-India' ? 'error' : 'warning'}
                        sx={{ ml: 'auto' }}
                      />
                    </Box>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {result.root_tweet?.content}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <ThumbUp sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="caption">{result.root_tweet?.likes?.toLocaleString()}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Comment sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="caption">{result.root_tweet?.replies?.toLocaleString()}</Typography>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={2.4}>
              <Card sx={{ textAlign: 'center', p: 2 }}>
                <Forum sx={{ fontSize: 40, color: theme.palette.primary.main, mb: 1 }} />
                <Typography variant="h5" fontWeight={700}>{result.thread_analysis?.tweet_count}</Typography>
                <Typography variant="caption" color="text.secondary">Total Tweets</Typography>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card sx={{ textAlign: 'center', p: 2 }}>
                <Group sx={{ fontSize: 40, color: theme.palette.secondary.main, mb: 1 }} />
                <Typography variant="h5" fontWeight={700}>{result.thread_analysis?.unique_users}</Typography>
                <Typography variant="caption" color="text.secondary">Participants</Typography>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card sx={{ textAlign: 'center', p: 2 }}>
                <TrendingUp sx={{ fontSize: 40, color: theme.palette.success.main, mb: 1 }} />
                <Typography variant="h5" fontWeight={700}>{result.thread_analysis?.total_engagement?.toLocaleString()}</Typography>
                <Typography variant="caption" color="text.secondary">Engagement</Typography>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card sx={{ textAlign: 'center', p: 2 }}>
                <Whatshot sx={{ fontSize: 40, color: getControversyColor(result.thread_analysis?.controversy_score), mb: 1 }} />
                <Typography variant="h5" fontWeight={700} sx={{ color: getControversyColor(result.thread_analysis?.controversy_score) }}>
                  {(result.thread_analysis?.controversy_score * 100).toFixed(0)}%
                </Typography>
                <Typography variant="caption" color="text.secondary">Controversy</Typography>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card sx={{ textAlign: 'center', p: 2 }}>
                <Comment sx={{ fontSize: 40, color: theme.palette.info.main, mb: 1 }} />
                <Typography variant="h5" fontWeight={700}>{result.thread_analysis?.reply_count}</Typography>
                <Typography variant="caption" color="text.secondary">Replies</Typography>
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
                          {result.thread_analysis?.pro_india_count}
                        </Typography>
                        <Typography variant="caption">Pro-India</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: alpha(theme.palette.warning.main, 0.1), borderRadius: 2 }}>
                        <Typography variant="h4" fontWeight={700} color="warning.main">
                          {result.thread_analysis?.neutral_count}
                        </Typography>
                        <Typography variant="caption">Neutral</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: alpha(theme.palette.error.main, 0.1), borderRadius: 2 }}>
                        <Typography variant="h4" fontWeight={700} color="error.main">
                          {result.thread_analysis?.anti_india_count}
                        </Typography>
                        <Typography variant="caption">Anti-India</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Sentiment Distribution</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: alpha(theme.palette.success.main, 0.1), borderRadius: 2 }}>
                        <Typography variant="h4" fontWeight={700} color="success.main">
                          {result.thread_analysis?.sentiment_breakdown?.positive || 0}
                        </Typography>
                        <Typography variant="caption">Positive</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: alpha(theme.palette.warning.main, 0.1), borderRadius: 2 }}>
                        <Typography variant="h4" fontWeight={700} color="warning.main">
                          {result.thread_analysis?.sentiment_breakdown?.neutral || 0}
                        </Typography>
                        <Typography variant="caption">Neutral</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: alpha(theme.palette.error.main, 0.1), borderRadius: 2 }}>
                        <Typography variant="h4" fontWeight={700} color="error.main">
                          {result.thread_analysis?.sentiment_breakdown?.negative || 0}
                        </Typography>
                        <Typography variant="caption">Negative</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                    Replies ({result.replies?.length || 0})
                  </Typography>
                  <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                    {result.replies?.map((reply, i) => (
                      <ListItem 
                        key={reply.tweet_id || i}
                        sx={{ 
                          bgcolor: alpha(theme.palette.primary.main, 0.02),
                          borderRadius: 2,
                          mb: 1,
                          border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                            {reply.username?.[0]?.toUpperCase()}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2" fontWeight={600}>@{reply.username}</Typography>
                              <Chip 
                                label={reply.classification} 
                                size="small"
                                color={reply.classification === 'Pro-India' ? 'success' 
                                  : reply.classification === 'Anti-India' ? 'error' : 'warning'}
                              />
                            </Box>
                          }
                          secondary={reply.content}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Box>
    </Fade>
  );
};

export default ThreadAnalysis;
