import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  LinearProgress,
  useTheme,
  alpha,
  Fade,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Analytics as AnalyticsIcon,
  Article,
  People,
  Forum,
  Campaign,
  Warning,
  SmartToy,
  TrendingUp,
} from '@mui/icons-material';

const StatCard = ({ title, value, icon: Icon, color, delay = 0 }) => {
  return (
    <Card sx={{ 
      textAlign: 'center', 
      p: 2,
      background: `linear-gradient(135deg, ${alpha(color, 0.1)} 0%, ${alpha(color, 0.05)} 100%)`,
      border: `1px solid ${alpha(color, 0.2)}`,
      transition: 'all 0.3s',
      '&:hover': { transform: 'translateY(-4px)', boxShadow: `0 8px 25px ${alpha(color, 0.2)}` },
    }}>
      <Icon sx={{ fontSize: 32, color, mb: 1 }} />
      <Typography variant="h5" fontWeight={700}>{value}</Typography>
      <Typography variant="caption" color="text.secondary">{title}</Typography>
    </Card>
  );
};

const Analytics = () => {
  const theme = useTheme();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/stats').then(r => r.json()),
      fetch('/api/users?limit=10').then(r => r.json()),
      fetch('/api/threads?limit=5').then(r => r.json()),
    ]).then(([statsData, usersData, threadsData]) => {
      if (statsData.status === 'success') setStats(statsData.data);
      if (usersData.status === 'success') setUsers(usersData.data || []);
      if (threadsData.status === 'success') setThreads(threadsData.data || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress size={48} />
      </Box>
    );
  }

  const overview = stats?.overview || {};
  const sentiment = stats?.sentiment_distribution || {};
  const classification = stats?.classification_distribution || {};
  const totalSentiment = (sentiment.positive || 0) + (sentiment.neutral || 0) + (sentiment.negative || 0) || 1;
  const totalClass = (classification.pro_india || 0) + (classification.neutral || 0) + (classification.anti_india || 0) || 1;

  return (
    <Fade in timeout={500}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Analytics Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Comprehensive analysis metrics and insights
        </Typography>

        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={6} sm={4} md={2}><StatCard title="Posts" value={overview.total_posts || 0} icon={Article} color={theme.palette.primary.main} /></Grid>
          <Grid item xs={6} sm={4} md={2}><StatCard title="Users" value={overview.total_users || 0} icon={People} color={theme.palette.secondary.main} /></Grid>
          <Grid item xs={6} sm={4} md={2}><StatCard title="Threads" value={overview.total_threads || 0} icon={Forum} color={theme.palette.info.main} /></Grid>
          <Grid item xs={6} sm={4} md={2}><StatCard title="Campaigns" value={overview.total_campaigns || 0} icon={Campaign} color={theme.palette.warning.main} /></Grid>
          <Grid item xs={6} sm={4} md={2}><StatCard title="High Risk" value={overview.high_risk_posts || 0} icon={Warning} color={theme.palette.error.main} /></Grid>
          <Grid item xs={6} sm={4} md={2}><StatCard title="Bots" value={overview.likely_bots || 0} icon={SmartToy} color={theme.palette.error.dark} /></Grid>
        </Grid>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
                  <AnalyticsIcon sx={{ mr: 1, verticalAlign: 'middle' }} /> Sentiment Distribution
                </Typography>
                {['positive', 'neutral', 'negative'].map((type) => (
                  <Box key={type} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>{type}</Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {sentiment[type] || 0} ({((sentiment[type] || 0) / totalSentiment * 100).toFixed(1)}%)
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(sentiment[type] || 0) / totalSentiment * 100}
                      sx={{
                        height: 10,
                        bgcolor: alpha(type === 'positive' ? theme.palette.success.main : 
                          type === 'negative' ? theme.palette.error.main : theme.palette.warning.main, 0.1),
                        '& .MuiLinearProgress-bar': {
                          bgcolor: type === 'positive' ? theme.palette.success.main : 
                            type === 'negative' ? theme.palette.error.main : theme.palette.warning.main,
                        },
                      }}
                    />
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
                  <TrendingUp sx={{ mr: 1, verticalAlign: 'middle' }} /> Stance Classification
                </Typography>
                {[
                  { key: 'pro_india', label: 'Pro-India', color: theme.palette.success.main },
                  { key: 'neutral', label: 'Neutral', color: theme.palette.warning.main },
                  { key: 'anti_india', label: 'Anti-India', color: theme.palette.error.main },
                ].map(({ key, label, color }) => (
                  <Box key={key} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2">{label}</Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {classification[key] || 0} ({((classification[key] || 0) / totalClass * 100).toFixed(1)}%)
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(classification[key] || 0) / totalClass * 100}
                      sx={{ height: 10, bgcolor: alpha(color, 0.1), '& .MuiLinearProgress-bar': { bgcolor: color } }}
                    />
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                  <People sx={{ mr: 1, verticalAlign: 'middle' }} /> Recent Users
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>User</TableCell>
                        <TableCell>Grade</TableCell>
                        <TableCell>Stance</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {users.slice(0, 5).map((user, i) => (
                        <TableRow key={i}>
                          <TableCell>@{user.username}</TableCell>
                          <TableCell>
                            <Chip label={user.grade || '?'} size="small" color={
                              user.grade?.startsWith('A') ? 'success' :
                              user.grade?.startsWith('B') ? 'info' :
                              user.grade?.startsWith('C') ? 'warning' : 'error'
                            } />
                          </TableCell>
                          <TableCell>
                            <Chip label={user.stance_label || 'Unknown'} size="small" variant="outlined" color={
                              user.stance_label === 'Pro-India' ? 'success' :
                              user.stance_label === 'Anti-India' ? 'error' : 'warning'
                            } />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                  <Forum sx={{ mr: 1, verticalAlign: 'middle' }} /> Recent Threads
                </Typography>
                {threads.length > 0 ? threads.map((thread, i) => (
                  <Box key={i} sx={{ p: 2, mb: 1, bgcolor: alpha(theme.palette.primary.main, 0.03), borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="caption">Thread #{thread.root_tweet_id?.slice(-6)}</Typography>
                      <Chip 
                        label={`${(thread.controversy_score * 100).toFixed(0)}% controversy`}
                        size="small"
                        color={thread.controversy_score > 0.7 ? 'error' : thread.controversy_score > 0.4 ? 'warning' : 'success'}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {thread.tweet_count} tweets • {thread.unique_users} users • {thread.dominant_stance}
                    </Typography>
                  </Box>
                )) : <Typography color="text.secondary">No threads analyzed yet</Typography>}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Fade>
  );
};

export default Analytics;