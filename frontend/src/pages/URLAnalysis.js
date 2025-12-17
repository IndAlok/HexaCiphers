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
  Fade,
} from '@mui/material';
import {
  Link as LinkIcon,
  Search,
  ThumbUp,
  Repeat,
  Comment,
  FormatQuote,
  SmartToy,
  Security,
  SentimentSatisfied,
  SentimentDissatisfied,
  SentimentNeutral,
  Verified,
} from '@mui/icons-material';

const URLAnalysis = () => {
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
      const response = await fetch('/api/analyze-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() })
      });
      const data = await response.json();
      if (response.ok) {
        setResult(data.data);
      } else {
        setError(data.message || 'Failed to analyze tweet');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getSentimentIcon = (sentiment) => {
    if (sentiment === 'positive') return <SentimentSatisfied sx={{ color: theme.palette.success.main }} />;
    if (sentiment === 'negative') return <SentimentDissatisfied sx={{ color: theme.palette.error.main }} />;
    return <SentimentNeutral sx={{ color: theme.palette.warning.main }} />;
  };

  return (
    <Fade in timeout={500}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Tweet Analysis
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Analyze individual tweets for sentiment and stance
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
                  startAdornment: <LinkIcon sx={{ mr: 1, color: 'text.secondary' }} />,
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
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3 }}>
                    <Avatar 
                      src={result.user?.profile_image} 
                      sx={{ width: 56, height: 56 }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="h6" fontWeight={600}>
                          {result.user?.display_name}
                        </Typography>
                        {result.user?.verified && (
                          <Verified sx={{ color: theme.palette.primary.main, fontSize: 20 }} />
                        )}
                      </Box>
                      <Typography color="text.secondary">@{result.user?.username}</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="caption" color="text.secondary">
                        {result.user?.followers?.toLocaleString()} followers
                      </Typography>
                    </Box>
                  </Box>

                  <Typography variant="body1" sx={{ mb: 3, fontSize: '1.1rem', lineHeight: 1.6 }}>
                    {result.tweet?.content}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 4, mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ThumbUp sx={{ fontSize: 18, color: 'text.secondary' }} />
                      <Typography variant="body2">{result.engagement?.likes?.toLocaleString()}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Repeat sx={{ fontSize: 18, color: 'text.secondary' }} />
                      <Typography variant="body2">{result.engagement?.retweets?.toLocaleString()}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Comment sx={{ fontSize: 18, color: 'text.secondary' }} />
                      <Typography variant="body2">{result.engagement?.replies?.toLocaleString()}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FormatQuote sx={{ fontSize: 18, color: 'text.secondary' }} />
                      <Typography variant="body2">{result.engagement?.quotes?.toLocaleString()}</Typography>
                    </Box>
                  </Box>

                  {result.metadata?.hashtags?.length > 0 && (
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {result.metadata.hashtags.map((tag, i) => (
                        <Chip key={i} label={`#${tag}`} size="small" variant="outlined" />
                      ))}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ textAlign: 'center', p: 3, height: '100%' }}>
                {getSentimentIcon(result.analysis?.sentiment)}
                <Typography variant="h5" fontWeight={700} sx={{ mt: 1, textTransform: 'capitalize' }}>
                  {result.analysis?.sentiment}
                </Typography>
                <Typography variant="caption" color="text.secondary">Sentiment</Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {(result.analysis?.sentiment_confidence * 100).toFixed(0)}% confidence
                </Typography>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ textAlign: 'center', p: 3, height: '100%' }}>
                <Chip
                  label={result.analysis?.classification}
                  size="large"
                  color={result.analysis?.classification === 'Pro-India' ? 'success' 
                    : result.analysis?.classification === 'Anti-India' ? 'error' : 'warning'}
                  sx={{ mb: 1 }}
                />
                <Typography variant="caption" color="text.secondary" display="block">Classification</Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {(result.analysis?.classification_confidence * 100).toFixed(0)}% confidence
                </Typography>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ textAlign: 'center', p: 3, height: '100%' }}>
                <SmartToy sx={{ fontSize: 40, color: theme.palette.warning.main, mb: 1 }} />
                <Typography variant="h5" fontWeight={700}>
                  {(result.analysis?.bot_probability * 100).toFixed(0)}%
                </Typography>
                <Typography variant="caption" color="text.secondary">Bot Probability</Typography>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ textAlign: 'center', p: 3, height: '100%' }}>
                <Security sx={{ fontSize: 40, color: 
                  result.analysis?.risk_score >= 70 ? theme.palette.error.main :
                  result.analysis?.risk_score >= 40 ? theme.palette.warning.main :
                  theme.palette.success.main, mb: 1 }} />
                <Typography variant="h5" fontWeight={700}>
                  {result.analysis?.risk_score?.toFixed(0)}
                </Typography>
                <Typography variant="caption" color="text.secondary">Risk Score</Typography>
              </Card>
            </Grid>
          </Grid>
        )}
      </Box>
    </Fade>
  );
};

export default URLAnalysis;