# VeggieScan Mobile App

React Native mobile application for the VeggieScan vegetable analysis system.

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- React Native development environment
- Android Studio (for Android) or Xcode (for iOS)

### Installation
```bash
# Install dependencies
npm install

# For iOS (macOS only)
cd ios && pod install && cd ..

# Run on Android
npx react-native run-android

# Run on iOS
npx react-native run-ios
```

## 📱 Features

### Consumer Features
- **Dashboard**: Personal scan statistics and tips
- **Scanner**: Camera/gallery integration with progress tracking
- **History**: Detailed scan history with results
- **Settings**: Account management and preferences

### Admin Features
- **Admin Dashboard**: System-wide statistics and health monitoring
- **User Management**: View and manage all users
- **System Status**: Monitor backend services and dataset

## 🏗️ Architecture

### Navigation Structure
```
App
├── AuthStack (Unauthenticated)
│   ├── LoginScreen
│   └── RegisterScreen
├── ConsumerTabs (Consumer Users)
│   ├── DashboardScreen
│   ├── ScanScreen
│   ├── HistoryScreen
│   └── SettingsScreen
└── AdminTabs (Admin Users)
    ├── AdminDashboardScreen
    ├── AdminUsersScreen
    ├── AdminSystemScreen
    └── SettingsScreen
```

### State Management
- **AuthContext**: User authentication and session management
- **AsyncStorage**: Persistent storage for tokens and user data

## 📁 Project Structure

```
frontend/
├── src/
│   ├── screens/           # Screen components
│   ├── context/           # React contexts
│   ├── config/            # Configuration files
│   └── components/        # Reusable components (future)
├── App.js                 # Main app component
├── package.json           # Dependencies
└── README.md             # This file
```

## 🎨 UI Components

### Design System
- **React Native Paper**: Material Design components
- **React Native Vector Icons**: Consistent iconography
- **Custom Styling**: Branded color scheme and typography

### Key Components
- **Cards**: Elevated containers for content sections
- **Chips**: Status indicators and tags
- **Progress Bars**: Real-time scan progress
- **Navigation**: Bottom tabs with icons

## 📸 Image Handling

### Image Picker Integration
```javascript
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';

const options = {
  mediaType: 'photo',
  quality: 0.8,
  maxWidth: 1024,
  maxHeight: 1024,
};
```

### Upload Process
1. **Image Selection**: Camera or gallery
2. **Preview**: Show selected image
3. **Upload**: Multipart form data to backend
4. **Progress**: Real-time progress tracking
5. **Results**: Display analysis results

## 🔐 Authentication Flow

### Login Process
```javascript
const login = async (email, password) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  
  if (response.ok) {
    const { access_token, user_id } = await response.json();
    await AsyncStorage.setItem('token', access_token);
    setUser({ id: user_id, email, token: access_token });
  }
};
```

### Token Management
- **Storage**: AsyncStorage for persistence
- **Auto-login**: Check stored token on app start
- **Expiration**: Handle token expiration gracefully

## 🌐 API Integration

### Configuration
```javascript
// src/config/api.js
export const API_BASE_URL = 'http://localhost:8000';
export const makeAuthenticatedRequest = async (endpoint, options, token) => {
  return fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
};
```

### Error Handling
- **Network Errors**: Graceful fallback and retry
- **Authentication Errors**: Automatic logout and redirect
- **Validation Errors**: User-friendly error messages

## 📊 Data Flow

### Scan Process
1. **Image Capture**: Camera/gallery selection
2. **Upload**: Send to backend with progress tracking
3. **Analysis**: Backend processes with LM Studio
4. **Results**: Display formatted results
5. **History**: Save to user's scan history

### Dashboard Updates
- **Real-time Stats**: Fetch latest statistics
- **Pull-to-Refresh**: Manual refresh capability
- **Auto-refresh**: Periodic background updates

## 🎨 Styling & Theming

### Color Scheme
```javascript
const colors = {
  primary: '#4CAF50',      // Green for consumers
  admin: '#FF5722',        // Orange-red for admins
  success: '#4CAF50',      // Success states
  error: '#F44336',        // Error states
  warning: '#FF9800',      // Warning states
  info: '#2196F3',         // Info states
};
```

### Typography
- **Titles**: Bold, larger font sizes
- **Body Text**: Regular weight, readable sizes
- **Captions**: Smaller, muted colors

## 📱 Platform Considerations

### Android
- **Material Design**: Native Android look and feel
- **Permissions**: Camera and storage permissions
- **Navigation**: Hardware back button support

### iOS
- **Human Interface Guidelines**: iOS-specific adaptations
- **Safe Areas**: Proper handling of notches and home indicator
- **Navigation**: iOS-specific navigation patterns

## 🔧 Configuration

### API Configuration
```javascript
// Update src/config/api.js for your backend URL
export const API_BASE_URL = 'http://your-backend-url:8000';
```

### Build Configuration
```json
// package.json scripts
{
  "scripts": {
    "android": "react-native run-android",
    "ios": "react-native run-ios",
    "start": "react-native start",
    "test": "jest",
    "lint": "eslint ."
  }
}
```

## 🧪 Testing

### Running Tests
```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- ScanScreen.test.js
```

### Test Structure
- **Unit Tests**: Individual component testing
- **Integration Tests**: API integration testing
- **E2E Tests**: Full user flow testing (future)

## 📦 Dependencies

### Core Dependencies
- **React Native**: Mobile framework
- **React Navigation**: Navigation library
- **React Native Paper**: UI components
- **AsyncStorage**: Local storage

### Image & Media
- **react-native-image-picker**: Camera/gallery access
- **react-native-progress**: Progress indicators
- **react-native-vector-icons**: Icon library

### Networking
- **axios**: HTTP client (alternative to fetch)

## 🚀 Build & Deployment

### Development Build
```bash
# Debug build
npx react-native run-android --variant=debug
npx react-native run-ios --configuration Debug
```

### Production Build
```bash
# Release build
npx react-native run-android --variant=release
npx react-native run-ios --configuration Release
```

### App Store Deployment
1. **Android**: Generate signed APK/AAB
2. **iOS**: Archive and upload to App Store Connect
3. **Testing**: Internal testing before public release

## 🔍 Debugging

### Common Issues
- **Metro bundler**: Clear cache with `npx react-native start --reset-cache`
- **Android build**: Clean with `cd android && ./gradlew clean`
- **iOS build**: Clean build folder in Xcode

### Debug Tools
- **React Native Debugger**: Enhanced debugging
- **Flipper**: Advanced debugging and profiling
- **Console Logs**: Standard console.log debugging

## 🤝 Contributing

### Code Style
- **ESLint**: Configured linting rules
- **Prettier**: Code formatting
- **TypeScript**: Consider migration for type safety

### Component Guidelines
1. Use functional components with hooks
2. Implement proper error boundaries
3. Follow React Native best practices
4. Add PropTypes or TypeScript types
5. Include accessibility props

## 🔮 Future Enhancements

- **Offline Support**: Cache scans for offline viewing
- **Push Notifications**: Scan completion notifications
- **Batch Processing**: Multiple image scanning
- **Export Features**: Share scan results
- **Multi-language**: Internationalization support
- **Dark Mode**: Theme switching capability

## 📞 Support

For development issues:
1. Check React Native documentation
2. Search existing GitHub issues
3. Create detailed bug reports
4. Include device and OS information
