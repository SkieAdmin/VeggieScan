# VeggieScan Backend

FastAPI backend for the VeggieScan vegetable analysis system.

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- LM Studio running at `http://26.165.143.148:1234`

### Installation
```bash
# Install dependencies
pip install -r requirements.txt

# Run the server
python main.py
```

The API will be available at `http://localhost:8000`

## 📚 API Documentation

Once running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## 🗃️ Database

The system uses SQLite with automatic table creation on first run.

### Models
- **User**: User accounts (consumers and admins)
- **ScanHistory**: Individual vegetable scan records
- **VegetableDataset**: Dataset for reinforcement learning

## 🔐 Authentication

JWT-based authentication with:
- Password hashing using bcrypt
- Token expiration (30 minutes default)
- Role-based access control (user/admin)

## 🤖 LM Studio Integration

### Configuration
```python
LM_STUDIO_BASE_URL = "http://26.165.143.148:1234/v1"
```

### AI Prompt
The system uses a specialized prompt for vegetable analysis:
```
You're a now a VeggieScan: Visual Diagnosis of Vegetable Freshness and Contamination and now you will be act as our AI Assist to identify the vegetables & everytime i send you an image, you always return as Json Format.
also if the vegetable has cutted / damage, just add ( Proned to Bacteria )
If the image is not vegetables ( return as "invalid_image")
Vegetable Name:
Safe to Eat: true or false
Disease Name:
Recommendation:
```

## 📊 Dataset Features

### Automatic Dataset Creation
- Every scan result is saved to the dataset
- Enables future reinforcement learning
- Supports dataset export for sharing

### Dataset Structure
```python
{
    "vegetable_name": str,
    "safe_to_eat": bool,
    "disease_name": str | None,
    "recommendation": str,
    "image_hash": str,
    "usage_count": int
}
```

## 🛡️ Security Features

- Password hashing with bcrypt
- JWT token authentication
- Role-based access control
- Input validation with Pydantic
- CORS configuration for frontend access

## 📁 Project Structure

```
backend/
├── main.py              # FastAPI application
├── database.py          # Database configuration
├── models.py            # SQLAlchemy models
├── schemas.py           # Pydantic schemas
├── auth.py              # Authentication utilities
├── requirements.txt     # Python dependencies
├── .env                 # Environment variables
└── README.md           # This file
```

## 🔧 Configuration

### Environment Variables (.env)
```
SECRET_KEY=your-secret-key-change-this-in-production
LM_STUDIO_BASE_URL=http://26.165.143.148:1234/v1
DATABASE_URL=sqlite:///./veggie_scan.db
```

### Key Settings
- **JWT_ALGORITHM**: HS256
- **ACCESS_TOKEN_EXPIRE_MINUTES**: 30
- **DATABASE**: SQLite (veggie_scan.db)

## 📈 API Endpoints

### Public Endpoints
- `GET /` - Health check
- `POST /auth/register` - User registration
- `POST /auth/login` - User authentication

### Authenticated Endpoints
- `POST /scan` - Analyze vegetable image
- `GET /dashboard` - Get user/admin dashboard stats
- `GET /history` - Get scan history
- `GET /dataset` - Get vegetable dataset

### Admin Only Endpoints
- `GET /admin/users` - Get all users
- `GET /admin/system-status` - Get system health status

## 🔄 Scan Process Flow

1. **Image Upload**: Receive multipart form data with image
2. **Dataset Check**: Look for similar vegetables in existing dataset
3. **LM Studio Call**: If not found in dataset, call AI analysis
4. **Result Processing**: Parse and validate AI response
5. **History Save**: Store scan result in user history
6. **Dataset Update**: Add result to dataset for future reference

## 🚨 Error Handling

The API includes comprehensive error handling:
- **400**: Bad Request (validation errors)
- **401**: Unauthorized (invalid/missing token)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found (resource doesn't exist)
- **500**: Internal Server Error (system errors)
- **504**: Gateway Timeout (LM Studio timeout)

## 🧪 Testing

```bash
# Run with development settings
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Test endpoints
curl -X GET http://localhost:8000/
curl -X GET http://localhost:8000/docs
```

## 📦 Dependencies

### Core
- **FastAPI**: Modern web framework
- **Uvicorn**: ASGI server
- **SQLAlchemy**: ORM for database operations
- **Pydantic**: Data validation

### Authentication
- **python-jose**: JWT token handling
- **passlib**: Password hashing
- **python-multipart**: File upload support

### External APIs
- **httpx**: Async HTTP client for LM Studio
- **aiofiles**: Async file operations

## 🔍 Monitoring

The system provides:
- Health check endpoint (`/`)
- System status monitoring (`/admin/system-status`)
- Database connection status
- LM Studio connectivity check

## 🚀 Deployment

### Production Setup
1. Change `SECRET_KEY` in `.env`
2. Configure proper CORS origins
3. Use production ASGI server
4. Set up proper logging
5. Configure database backups

### Docker (Optional)
```dockerfile
FROM python:3.9
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## 🤝 Contributing

1. Follow PEP 8 style guidelines
2. Add type hints to all functions
3. Include docstrings for complex functions
4. Test all endpoints thoroughly
5. Update this README for new features
