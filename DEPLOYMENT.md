# VeggieScan Deployment Guide

## 🚀 Quick Start

### Prerequisites
- **Python 3.8+** for backend
- **Node.js 16+** for frontend
- **LM Studio** running at `http://26.165.143.148:1234`
- **Android Studio** (for Android development)

### Automated Setup
```bash
# Run the setup script
setup.bat

# Or manually:
cd backend && pip install -r requirements.txt
cd ../frontend && npm install
```

## 🔧 Configuration

### 1. Backend Configuration
Edit `backend/.env`:
```env
SECRET_KEY=your-secret-key-change-this-in-production
LM_STUDIO_BASE_URL=http://26.165.143.148:1234/v1
DATABASE_URL=sqlite:///./veggie_scan.db
```

### 2. Frontend Configuration
Edit `frontend/src/config/api.js`:
```javascript
export const API_BASE_URL = 'http://localhost:8000';
// For production: export const API_BASE_URL = 'https://your-domain.com';
```

### 3. LM Studio Setup
- Ensure LM Studio is running
- Model: `google/gemma-3-4b`
- Endpoint: `http://26.165.143.148:1234`
- Test connectivity: `curl http://26.165.143.148:1234/v1/models`

## 🏃‍♂️ Running the System

### Method 1: Using Scripts
```bash
# Start backend
start-backend.bat

# Start frontend (in new terminal)
start-frontend.bat
```

### Method 2: Manual Start
```bash
# Terminal 1: Backend
cd backend
python main.py

# Terminal 2: Frontend
cd frontend
npx react-native run-android
```

## 🌐 Production Deployment

### Backend Deployment

#### Option 1: Traditional Server
```bash
# Install dependencies
pip install -r requirements.txt

# Set production environment variables
export SECRET_KEY="your-production-secret-key"
export LM_STUDIO_BASE_URL="http://your-lm-studio-server:1234/v1"

# Run with production server
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

#### Option 2: Docker
```dockerfile
FROM python:3.9
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Frontend Deployment

#### Android APK Build
```bash
cd frontend/android
./gradlew assembleRelease

# APK location: android/app/build/outputs/apk/release/app-release.apk
```

#### iOS Build (macOS only)
```bash
cd frontend/ios
xcodebuild -workspace VeggieScan.xcworkspace -scheme VeggieScan -configuration Release
```

## 🔐 Security Considerations

### Production Checklist
- [ ] Change `SECRET_KEY` in `.env`
- [ ] Use HTTPS for API endpoints
- [ ] Configure proper CORS origins
- [ ] Set up database backups
- [ ] Enable API rate limiting
- [ ] Use environment variables for sensitive data
- [ ] Set up monitoring and logging

### Database Security
```python
# Use PostgreSQL for production
DATABASE_URL = "postgresql://user:password@localhost/veggiescan"

# Enable SSL connections
DATABASE_URL = "postgresql://user:password@localhost/veggiescan?sslmode=require"
```

## 📊 Monitoring & Maintenance

### Health Checks
- Backend: `GET http://localhost:8000/`
- System Status: `GET http://localhost:8000/admin/system-status`
- LM Studio: `GET http://26.165.143.148:1234/v1/models`

### Log Monitoring
```bash
# Backend logs
tail -f backend.log

# System logs
journalctl -u veggiescan-backend -f
```

### Database Maintenance
```bash
# Backup database
cp veggie_scan.db veggie_scan_backup_$(date +%Y%m%d).db

# Check database size
ls -lh veggie_scan.db
```

## 🔧 Troubleshooting

### Common Issues

#### Backend Issues
```bash
# Port already in use
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Dependencies issues
pip install --upgrade -r requirements.txt

# Database issues
rm veggie_scan.db  # Recreates on next start
```

#### Frontend Issues
```bash
# Metro bundler cache
npx react-native start --reset-cache

# Android build issues
cd android && ./gradlew clean && cd ..

# Node modules issues
rm -rf node_modules && npm install
```

#### LM Studio Issues
- Check if LM Studio is running
- Verify model is loaded
- Test endpoint connectivity
- Check firewall settings

### Performance Optimization

#### Backend Optimization
```python
# Add caching
from functools import lru_cache

@lru_cache(maxsize=100)
def get_similar_vegetable(image_hash):
    # Cache dataset lookups
    pass

# Database connection pooling
engine = create_engine(DATABASE_URL, pool_size=20, max_overflow=0)
```

#### Frontend Optimization
```javascript
// Image compression
const compressImage = (uri) => {
  return ImageResizer.createResizedImage(uri, 800, 600, 'JPEG', 80);
};

// Lazy loading
const LazyScreen = React.lazy(() => import('./screens/HistoryScreen'));
```

## 📈 Scaling Considerations

### Horizontal Scaling
- Use load balancer (nginx, HAProxy)
- Multiple backend instances
- Shared database (PostgreSQL)
- Redis for session storage

### Database Scaling
```sql
-- Add indexes for performance
CREATE INDEX idx_scan_history_user_id ON scan_history(user_id);
CREATE INDEX idx_scan_history_created_at ON scan_history(created_at);
CREATE INDEX idx_vegetable_dataset_hash ON vegetable_dataset(image_hash);
```

### CDN Integration
- Store images in cloud storage (AWS S3, Google Cloud)
- Use CDN for static assets
- Implement image caching

## 🔄 CI/CD Pipeline

### GitHub Actions Example
```yaml
name: Deploy VeggieScan
on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to server
        run: |
          ssh user@server 'cd /app && git pull && pip install -r requirements.txt && systemctl restart veggiescan'

  build-android:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Build APK
        run: |
          cd frontend/android
          ./gradlew assembleRelease
```

## 📞 Support & Maintenance

### Regular Maintenance Tasks
- [ ] Weekly database backups
- [ ] Monthly dependency updates
- [ ] Quarterly security audits
- [ ] Performance monitoring
- [ ] Log rotation and cleanup

### Monitoring Alerts
- API response time > 5 seconds
- Database size > 1GB
- Error rate > 5%
- LM Studio connectivity issues

### Update Procedures
1. Test updates in staging environment
2. Create database backup
3. Deploy backend updates
4. Deploy frontend updates
5. Verify system functionality
6. Monitor for issues

---

For additional support, refer to the individual README files in the `backend/` and `frontend/` directories.
