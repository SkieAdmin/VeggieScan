import React from 'react';
import { 
  Card, 
  CardContent, 
  CardMedia, 
  Typography, 
  Box, 
  Chip, 
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { 
  CheckCircle, 
  Warning, 
  Error, 
  AccessTime, 
  Info, 
  Delete, 
  Share, 
  Download
} from '@mui/icons-material';
import moment from 'moment';
import { Link } from 'react-router-dom';

const ScanResultCard = ({ scan, onDelete, onShare, onDownload }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Helper function to determine freshness color
  const getFreshnessColor = (freshness) => {
    if (freshness >= 80) return theme.palette.success.main;
    if (freshness >= 50) return theme.palette.warning.main;
    return theme.palette.error.main;
  };
  
  // Helper function to determine freshness icon
  const getFreshnessIcon = (freshness) => {
    if (freshness >= 80) return <CheckCircle fontSize="small" />;
    if (freshness >= 50) return <Warning fontSize="small" />;
    return <Error fontSize="small" />;
  };
  
  // Helper function to format date
  const formatDate = (date) => {
    return moment(date).format('MMM D, YYYY • h:mm A');
  };
  
  // Helper function to truncate text
  const truncateText = (text, maxLength) => {
    if (!text) return '';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };
  
  return (
    <Card 
      sx={{ 
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        height: '100%',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
        },
      }}
    >
      <CardMedia
        component="img"
        sx={{
          width: isMobile ? '100%' : 140,
          height: isMobile ? 140 : '100%',
          objectFit: 'cover',
        }}
        image={scan.imageUrl || '/placeholder-vegetable.jpg'}
        alt={scan.vegetableName || 'Vegetable scan'}
      />
      
      <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <CardContent sx={{ flex: '1 0 auto', p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Typography component="div" variant="h6" fontWeight="medium">
              {scan.vegetableName || 'Unknown Vegetable'}
            </Typography>
            
            <Chip
              icon={getFreshnessIcon(scan.freshness)}
              label={`${scan.freshness}% Fresh`}
              size="small"
              sx={{
                bgcolor: `${getFreshnessColor(scan.freshness)}22`,
                color: getFreshnessColor(scan.freshness),
                fontWeight: 'medium',
                '& .MuiChip-icon': {
                  color: 'inherit',
                },
              }}
            />
          </Box>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {truncateText(scan.description || 'No description available', 100)}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <AccessTime fontSize="small" color="action" sx={{ mr: 0.5 }} />
            <Typography variant="caption" color="text.secondary">
              {formatDate(scan.timestamp)}
            </Typography>
          </Box>
          
          {scan.contaminants && scan.contaminants.length > 0 && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="caption" color="error" sx={{ display: 'flex', alignItems: 'center' }}>
                <Warning fontSize="small" sx={{ mr: 0.5 }} />
                Contaminants detected
              </Typography>
            </Box>
          )}
        </CardContent>
        
        <Box sx={{ display: 'flex', alignItems: 'center', px: 2, pb: 1, mt: 'auto' }}>
          <Tooltip title="View details">
            <IconButton 
              component={Link} 
              to={`/history/${scan.id}`} 
              size="small" 
              color="primary"
              sx={{ mr: 1 }}
            >
              <Info fontSize="small" />
            </IconButton>
          </Tooltip>
          
          {onShare && (
            <Tooltip title="Share results">
              <IconButton 
                onClick={() => onShare(scan)} 
                size="small" 
                sx={{ mr: 1 }}
              >
                <Share fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          
          {onDownload && (
            <Tooltip title="Download report">
              <IconButton 
                onClick={() => onDownload(scan)} 
                size="small" 
                sx={{ mr: 1 }}
              >
                <Download fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          
          {onDelete && (
            <Tooltip title="Delete scan">
              <IconButton 
                onClick={() => onDelete(scan)} 
                size="small" 
                color="error"
              >
                <Delete fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>
    </Card>
  );
};

export default ScanResultCard;
