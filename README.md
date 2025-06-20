# VeggieScan: Visual Diagnosis of Vegetable Freshness and Contamination

A comprehensive system for analyzing vegetable freshness and detecting contamination using AI-powered image analysis.

## 🌟 Features

### For Consumers
- **Dashboard**: View scan statistics (good vs bad vegetables)
- **Vegetable Scanner**: Upload/capture images with real-time progress tracking
- **History**: Track all previous scans with detailed results
- **Settings**: Manage account and app preferences

### For System Administrators
- **Admin Dashboard**: System-wide statistics and user management
- **User Management**: View and manage all registered users
- **System Status**: Monitor API, LM Studio, and database health
- **Dataset Management**: Export and manage the vegetable dataset

## 🏗️ Architecture

- **Backend**: Python FastAPI with SQLite database
- **Frontend**: React Native mobile application
- **AI Engine**: LM Studio (google/gemma-3-4b) for image analysis
- **Dataset**: Automatic dataset creation for reinforcement learning

## 📱 AI Analysis Features

The system provides detailed analysis for each vegetable image:

```json
{
  "vegetable_name": "Potato",
  "safe_to_eat": true,
  "disease_name": null,
  "recommendation": "Just cook it"
}
```

Special handling for:
- Cut/damaged vegetables (marked as "Prone to Bacteria")
- Invalid images (non-vegetable content)
- Disease detection with specific recommendations

## 🚀 Quick Start

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python main.py
```

### Frontend Setup
```bash
cd frontend
npm install
npx react-native run-android  # or run-ios
```

### LM Studio Configuration
- Ensure LM Studio is running at: `http://26.165.143.148:1234`
- Model: `google/gemma-3-4b`

## 📊 Dataset & Reinforcement Learning

The system automatically:
1. Checks existing dataset before calling LM Studio
2. Saves all scan results to build a comprehensive dataset
3. Enables dataset export for sharing and further training
4. Improves accuracy over time through reinforcement learning

## 🔐 User Types

### Consumer Account
- Personal dashboard with individual statistics
- Scan history limited to own scans
- Basic settings and profile management

### Admin Account
- System-wide dashboard and statistics
- User management capabilities
- System health monitoring
- Dataset management and export

## 🛠️ Technology Stack

- **Backend**: FastAPI, SQLAlchemy, SQLite, Python-Jose, Passlib
- **Frontend**: React Native, React Navigation, React Native Paper
- **AI**: LM Studio API integration
- **Authentication**: JWT tokens with bcrypt password hashing
- **Database**: SQLite with automatic migrations

## 📝 API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login

### Core Features
- `POST /scan` - Analyze vegetable image
- `GET /dashboard` - Get dashboard statistics
- `GET /history` - Get scan history

### Admin Only
- `GET /admin/users` - Get all users
- `GET /admin/system-status` - Get system health
- `GET /dataset` - Get vegetable dataset

## 🔧 Configuration

### Environment Variables (.env)
```
SECRET_KEY=your-secret-key-change-this-in-production
LM_STUDIO_BASE_URL=http://26.165.143.148:1234/v1
DATABASE_URL=sqlite:///./veggie_scan.db
```

### Frontend Configuration (src/config/api.js)
```javascript
export const API_BASE_URL = 'http://localhost:8000';
```

## 📱 Mobile App Features

- **Image Capture**: Camera and gallery integration
- **Progress Tracking**: Real-time upload and analysis progress
- **Offline Support**: Basic functionality when network is limited
- **Modern UI**: Material Design with React Native Paper
- **Cross-Platform**: Works on both Android and iOS

## 🎯 Future Enhancements

- Image similarity matching for faster dataset lookups
- Advanced disease classification
- Batch processing for multiple vegetables
- Export functionality for scan reports
- Push notifications for scan completion
- Multi-language support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and questions:
- Email: support@veggiescan.com
- Create an issue in the repository

---

**VeggieScan** - Making food safety accessible through AI-powered visual analysis.
