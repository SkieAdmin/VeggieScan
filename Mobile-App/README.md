# VeggieScan Mobile App

A React Native mobile application for vegetable freshness and contamination analysis.

## Overview

This mobile app is the Android version of VeggieScan, converted from the React.js web application. It uses the device camera to capture vegetable images for analysis instead of file uploads.

## Features

- Native camera integration for vegetable scanning
- AI-powered analysis of vegetable freshness and safety
- Freshness level classification (Good, Acceptable, Not Recommended)
- Contamination detection
- Scan history and statistics
- User authentication

## Project Structure

```
Mobile-App/
├── src/
│   ├── assets/          # Images, fonts, and other static assets
│   ├── components/      # Reusable components
│   ├── navigation/      # Navigation configuration
│   ├── screens/         # Screen components
│   ├── services/        # API services
│   ├── store/           # State management
│   └── utils/           # Utility functions
├── App.js               # Entry point
└── README.md            # Documentation
```

## Setup Instructions

1. Install React Native CLI: `npm install -g react-native-cli`
2. Install dependencies: `npm install`
3. Start Metro bundler: `npx react-native start`
4. Run on Android: `npx react-native run-android`

## Backend Integration

This mobile app connects to the same VeggieScan backend API as the web version.
