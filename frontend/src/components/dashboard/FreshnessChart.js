import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Chip,
  useTheme
} from '@mui/material';
import {
  CheckCircle,
  Warning,
  Cancel,
  TrendingUp,
  Spa
} from '@mui/icons-material';

const FreshnessChart = ({ freshnessStats }) => {
  const theme = useTheme();

  if (!freshnessStats) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Freshness Analysis
          </Typography>
          <Typography variant="body2" color="text.secondary">
            No freshness data available
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const { good, acceptable, notRecommended, averageScore } = freshnessStats;
  const total = good + acceptable + notRecommended;

  const freshnessData = [
    {
      level: 'GOOD',
      label: 'Fresh',
      count: good,
      percentage: total > 0 ? Math.round((good / total) * 100) : 0,
      color: theme.palette.success.main,
      icon: <Spa color="success" />
    },
    {
      level: 'ACCEPTABLE',
      label: 'Fair',
      count: acceptable,
      percentage: total > 0 ? Math.round((acceptable / total) * 100) : 0,
      color: theme.palette.warning.main,
      icon: <Warning fontSize="small" />
    },
    {
      level: 'NOT_RECOMMENDED',
      label: 'Poor',
      count: notRecommended,
      percentage: total > 0 ? Math.round((notRecommended / total) * 100) : 0,
      color: theme.palette.error.main,
      icon: <Cancel fontSize="small" />
    }
  ];

  const getScoreColor = (score) => {
    if (score >= 80) return theme.palette.success.main;
    if (score >= 50) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Freshness Analysis
          </Typography>
          <Chip
            icon={<TrendingUp fontSize="small" />}
            label={`Avg: ${averageScore}%`}
            size="small"
            sx={{
              bgcolor: `${getScoreColor(averageScore)}22`,
              color: getScoreColor(averageScore),
              fontWeight: 'medium',
              '& .MuiChip-icon': {
                color: 'inherit',
              },
            }}
          />
        </Box>

        {total === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No scans available yet
          </Typography>
        ) : (
          <Box sx={{ space: 2 }}>
            {freshnessData.map((item) => (
              <Box key={item.level} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ color: item.color, mr: 1, display: 'flex' }}>
                      {item.icon}
                    </Box>
                    <Typography variant="body2" fontWeight="medium">
                      {item.label}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {item.count} ({item.percentage}%)
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={item.percentage}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: `${item.color}22`,
                    '& .MuiLinearProgress-bar': {
                      bgcolor: item.color,
                      borderRadius: 4,
                    },
                  }}
                />
              </Box>
            ))}

            <Box sx={{ mt: 3, p: 2, bgcolor: theme.palette.grey[50], borderRadius: 2 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                Freshness Levels:
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                • <strong>Fresh:</strong> Ideal for consumption
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                • <strong>Fair:</strong> Still safe, but not optimal
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                • <strong>Poor:</strong> Stale or spoiled, avoid use
              </Typography>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default FreshnessChart;
