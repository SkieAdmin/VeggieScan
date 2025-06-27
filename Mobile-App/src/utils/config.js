// Configuration for the VeggieScan mobile app

// Backend API URL - change this to your actual backend URL when deploying
export const API_URL = 'http://10.0.2.2:5000/api'; // Android emulator uses 10.0.2.2 to access localhost

// Authentication token storage key
export const AUTH_TOKEN_KEY = 'veggie_scan_auth_token';

// App settings
export const APP_SETTINGS = {
  // Camera settings
  camera: {
    aspectRatio: '4:3',
    quality: 0.7,
    maxWidth: 800,
  },
  
  // Image upload settings
  upload: {
    compressionQuality: 0.7,
    maxSizeInMB: 10,
  },
  
  // UI settings
  ui: {
    animationDuration: 300,
    refreshInterval: 60000, // 1 minute
  }
};

// Freshness level mapping
export const FRESHNESS_LEVELS = {
  GOOD: {
    label: 'Fresh',
    color: '#4caf50', // success green
    icon: 'leaf',
    description: 'The vegetable is fresh and in optimal condition for consumption.'
  },
  ACCEPTABLE: {
    label: 'Fair',
    color: '#ff9800', // warning orange
    icon: 'alert',
    description: 'The vegetable is still edible but not at its peak freshness.'
  },
  NOT_RECOMMENDED: {
    label: 'Poor',
    color: '#f44336', // error red
    icon: 'alert-circle',
    description: 'The vegetable is not fresh and consumption is not recommended.'
  }
};
