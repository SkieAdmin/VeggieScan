import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia,
  Stack,
  Paper,
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { 
  Agriculture, 
  Security, 
  Analytics, 
  Speed, 
  CloudDone, 
  DevicesOther,
  ArrowForward
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Features section data
  const features = [
    {
      icon: <Security fontSize="large" />,
      title: 'Safe Food Detection',
      description: 'Instantly identify vegetable freshness and detect potential contaminants with our advanced AI analysis.'
    },
    {
      icon: <Analytics fontSize="large" />,
      title: 'Detailed Reports',
      description: 'Get comprehensive reports on vegetable quality, freshness percentage, and potential issues.'
    },
    {
      icon: <Speed fontSize="large" />,
      title: 'Fast Results',
      description: 'Receive analysis results in seconds, allowing you to make quick decisions about your produce.'
    },
    {
      icon: <CloudDone fontSize="large" />,
      title: 'Cloud Storage',
      description: 'All your scan history is securely stored in the cloud for easy access and reference.'
    },
    {
      icon: <DevicesOther fontSize="large" />,
      title: 'Multi-device Support',
      description: 'Access VeggieScan from any device with a browser - desktop, tablet, or mobile.'
    },
    {
      icon: <Agriculture fontSize="large" />,
      title: 'Growing Database',
      description: 'Our vegetable database is constantly expanding to provide more accurate and detailed analysis.'
    }
  ];

  return (
    <Box sx={{ bgcolor: 'background.default' }}>
      {/* Hero Section */}
      <Box 
        sx={{ 
          bgcolor: 'primary.dark',
          color: 'white',
          pt: isMobile ? 8 : 12,
          pb: isMobile ? 10 : 16,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: -100,
            right: -100,
            width: 400,
            height: 400,
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -150,
            left: -150,
            width: 500,
            height: 500,
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
          }}
        />
        
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography 
                variant="h2" 
                component="h1" 
                fontWeight="bold"
                sx={{ mb: 2 }}
              >
                Ensure Your Vegetables Are Fresh & Safe
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 4, 
                  opacity: 0.9,
                  maxWidth: '90%'
                }}
              >
                VeggieScan uses advanced AI to analyze vegetable freshness and detect contamination in seconds.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button 
                  variant="contained" 
                  size="large" 
                  component={Link} 
                  to="/register"
                  sx={{ 
                    bgcolor: 'white', 
                    color: 'primary.dark',
                    fontWeight: 'bold',
                    px: 4,
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.9)',
                    }
                  }}
                >
                  Get Started
                </Button>
                <Button 
                  variant="outlined" 
                  size="large" 
                  component={Link} 
                  to="/login"
                  sx={{ 
                    color: 'white', 
                    borderColor: 'white',
                    '&:hover': {
                      borderColor: 'white',
                      bgcolor: 'rgba(255, 255, 255, 0.1)',
                    }
                  }}
                >
                  Sign In
                </Button>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6} sx={{ display: { xs: 'none', md: 'block' } }}>
              <Box
                component="img"
                src="/assets/hero-image.png"
                alt="Fresh vegetables"
                sx={{
                  width: '100%',
                  maxWidth: 500,
                  height: 'auto',
                  borderRadius: 4,
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
                  transform: 'perspective(1000px) rotateY(-10deg)',
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>
      
      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography 
            variant="h3" 
            component="h2" 
            fontWeight="bold"
            color="primary.main"
            sx={{ mb: 2 }}
          >
            Why Choose VeggieScan?
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto' }}>
            Our AI-powered platform provides accurate vegetable analysis to ensure food safety and quality.
          </Typography>
        </Box>
        
        <Grid container spacing={3}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card 
                elevation={0}
                sx={{ 
                  height: '100%', 
                  borderRadius: 3,
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)',
                  },
                  border: '1px solid',
                  borderColor: 'divider'
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      bgcolor: `${theme.palette.primary.main}15`,
                      color: 'primary.main',
                      width: 70,
                      height: 70,
                      borderRadius: '50%',
                      mb: 2
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" component="h3" fontWeight="bold" sx={{ mb: 1 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
      
      {/* How It Works Section */}
      <Box sx={{ bgcolor: 'background.paper', py: 8 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography 
              variant="h3" 
              component="h2" 
              fontWeight="bold"
              color="primary.main"
              sx={{ mb: 2 }}
            >
              How It Works
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto' }}>
              VeggieScan makes vegetable analysis simple and accessible in just three easy steps.
            </Typography>
          </Box>
          
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box
                component="img"
                src="/assets/how-it-works.png"
                alt="VeggieScan process"
                sx={{
                  width: '100%',
                  maxWidth: 500,
                  height: 'auto',
                  borderRadius: 4,
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack spacing={4}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 3, 
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box 
                      sx={{ 
                        bgcolor: 'primary.main', 
                        color: 'white', 
                        width: 36, 
                        height: 36, 
                        borderRadius: '50%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        mr: 2
                      }}
                    >
                      1
                    </Box>
                    <Typography variant="h6" fontWeight="bold">
                      Upload an Image
                    </Typography>
                  </Box>
                  <Typography variant="body1" color="text.secondary" sx={{ pl: 7 }}>
                    Take a photo of your vegetables or upload an existing image to the platform.
                  </Typography>
                </Paper>
                
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 3, 
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box 
                      sx={{ 
                        bgcolor: 'primary.main', 
                        color: 'white', 
                        width: 36, 
                        height: 36, 
                        borderRadius: '50%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        mr: 2
                      }}
                    >
                      2
                    </Box>
                    <Typography variant="h6" fontWeight="bold">
                      AI Analysis
                    </Typography>
                  </Box>
                  <Typography variant="body1" color="text.secondary" sx={{ pl: 7 }}>
                    Our advanced AI analyzes the image to determine freshness, identify contaminants, and assess quality.
                  </Typography>
                </Paper>
                
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 3, 
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box 
                      sx={{ 
                        bgcolor: 'primary.main', 
                        color: 'white', 
                        width: 36, 
                        height: 36, 
                        borderRadius: '50%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        mr: 2
                      }}
                    >
                      3
                    </Box>
                    <Typography variant="h6" fontWeight="bold">
                      Get Results
                    </Typography>
                  </Box>
                  <Typography variant="body1" color="text.secondary" sx={{ pl: 7 }}>
                    Receive a detailed report with freshness scores, safety assessment, and recommendations.
                  </Typography>
                </Paper>
                
                <Button 
                  variant="contained" 
                  size="large" 
                  component={Link} 
                  to="/register"
                  endIcon={<ArrowForward />}
                  sx={{ alignSelf: 'flex-start', px: 4 }}
                >
                  Try It Now
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>
      
      {/* Call to Action */}
      <Box 
        sx={{ 
          bgcolor: 'primary.main',
          color: 'white',
          py: 8,
          textAlign: 'center'
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h3" component="h2" fontWeight="bold" sx={{ mb: 3 }}>
            Ready to Ensure Your Food Safety?
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            Join thousands of users who trust VeggieScan for vegetable freshness and contamination analysis.
          </Typography>
          <Button 
            variant="contained" 
            size="large" 
            component={Link} 
            to="/register"
            sx={{ 
              bgcolor: 'white', 
              color: 'primary.main',
              fontWeight: 'bold',
              px: 6,
              py: 1.5,
              fontSize: '1.1rem',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.9)',
              }
            }}
          >
            Get Started for Free
          </Button>
        </Container>
      </Box>
      
      {/* Footer */}
      <Box sx={{ bgcolor: 'background.paper', py: 6 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Agriculture sx={{ color: 'primary.main', mr: 1, fontSize: 30 }} />
                <Typography variant="h5" fontWeight="bold">
                  VeggieScan
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Advanced AI-powered vegetable freshness and contamination detection platform.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                © {new Date().getFullYear()} VeggieScan. All rights reserved.
              </Typography>
            </Grid>
            
            <Grid item xs={6} sm={3} md={2}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                Product
              </Typography>
              <Stack spacing={1}>
                <Link to="/features" style={{ textDecoration: 'none' }}>
                  <Typography variant="body2" color="text.secondary">Features</Typography>
                </Link>
                <Link to="/pricing" style={{ textDecoration: 'none' }}>
                  <Typography variant="body2" color="text.secondary">Pricing</Typography>
                </Link>
                <Link to="/faq" style={{ textDecoration: 'none' }}>
                  <Typography variant="body2" color="text.secondary">FAQ</Typography>
                </Link>
              </Stack>
            </Grid>
            
            <Grid item xs={6} sm={3} md={2}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                Company
              </Typography>
              <Stack spacing={1}>
                <Link to="/about" style={{ textDecoration: 'none' }}>
                  <Typography variant="body2" color="text.secondary">About Us</Typography>
                </Link>
                <Link to="/contact" style={{ textDecoration: 'none' }}>
                  <Typography variant="body2" color="text.secondary">Contact</Typography>
                </Link>
                <Link to="/careers" style={{ textDecoration: 'none' }}>
                  <Typography variant="body2" color="text.secondary">Careers</Typography>
                </Link>
              </Stack>
            </Grid>
            
            <Grid item xs={6} sm={3} md={2}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                Resources
              </Typography>
              <Stack spacing={1}>
                <Link to="/blog" style={{ textDecoration: 'none' }}>
                  <Typography variant="body2" color="text.secondary">Blog</Typography>
                </Link>
                <Link to="/documentation" style={{ textDecoration: 'none' }}>
                  <Typography variant="body2" color="text.secondary">Documentation</Typography>
                </Link>
                <Link to="/support" style={{ textDecoration: 'none' }}>
                  <Typography variant="body2" color="text.secondary">Support</Typography>
                </Link>
              </Stack>
            </Grid>
            
            <Grid item xs={6} sm={3} md={2}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                Legal
              </Typography>
              <Stack spacing={1}>
                <Link to="/privacy" style={{ textDecoration: 'none' }}>
                  <Typography variant="body2" color="text.secondary">Privacy Policy</Typography>
                </Link>
                <Link to="/terms" style={{ textDecoration: 'none' }}>
                  <Typography variant="body2" color="text.secondary">Terms of Service</Typography>
                </Link>
                <Link to="/cookies" style={{ textDecoration: 'none' }}>
                  <Typography variant="body2" color="text.secondary">Cookie Policy</Typography>
                </Link>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;
