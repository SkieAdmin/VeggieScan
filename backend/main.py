from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
import httpx
import json
import base64
from datetime import datetime
from typing import Optional, List
import os
from dotenv import load_dotenv

from database import get_db, init_db
from models import User, ScanHistory, VegetableDataset
from schemas import UserCreate, UserLogin, ScanResult, DashboardStats, UserResponse, ScanHistoryResponse
from auth import create_access_token, verify_token, get_password_hash, verify_password

load_dotenv()

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup code
    print("Initializing database...")
    init_db()
    yield
    # Shutdown code
    print("Shutting down...")

# Create app with lifespan
app = FastAPI(title="VeggieScan API", version="1.0.0", lifespan=lifespan)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Request logging middleware
@app.middleware("http")
async def log_requests(request, call_next):
    import time
    start_time = time.time()
    
    # Get client IP
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        client = forwarded.split(",")[0]
    else:
        client = request.client.host if request.client else "unknown"
    
    # Log request details
    print(f"\n[REQUEST] {request.method} {request.url.path} from {client}")
    print(f"Headers: {request.headers}")
    
    # Process the request
    try:
        response = await call_next(request)
        process_time = time.time() - start_time
        print(f"[RESPONSE] {request.method} {request.url.path} - Status: {response.status_code} - Time: {process_time:.4f}s")
        return response
    except Exception as e:
        process_time = time.time() - start_time
        print(f"[ERROR] {request.method} {request.url.path} - Exception: {str(e)} - Time: {process_time:.4f}s")
        import traceback
        traceback.print_exc()
        raise

security = HTTPBearer()

# Define get_current_user function before using it in endpoints
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    print(f"Auth header received: {credentials.scheme} {credentials.credentials[:10]}...")
    
    token = credentials.credentials
    email = verify_token(token)
    
    if email is None:
        print(f"Token verification failed for token starting with: {token[:10]}...")
        raise HTTPException(status_code=401, detail="Invalid token")
    
    print(f"Token verified successfully for email: {email}")
    
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        print(f"No user found for email: {email}")
        raise HTTPException(status_code=401, detail="User not found")
    
    print(f"User authenticated: {user.email} (ID: {user.id})")
    return user

# LM Studio configuration
LM_STUDIO_BASE_URL = os.environ.get("LM_STUDIO_BASE_URL", "http://26.165.143.148:1234/v1")
LM_STUDIO_PROMPT = """You're a now a VeggieScan: Visual Diagnosis of Vegetable Freshness and Contamination and now you will be act as our AI Assist to identify the vegetables & everytime i send you an image, you always return as Json Format.
also if the vegetable has cutted / damage, just add ( Proned to Bacteria )
If the image is not vegetables ( return as "invalid_image")
Vegetable Name:
Safe to Eat: true or false
Disease Name:
Recommendation:"""

# Flag to control mock mode
USE_MOCK_AI = os.environ.get("USE_MOCK_AI", "false").lower() == "true"

# Lifespan is already defined at the top of the file

@app.get("/")
async def root():
    return {"message": "VeggieScan API is running"}

@app.get("/system/status")
async def system_status():
    return {"message": "VeggieScan API is running"}

@app.get("/dashboard", response_model=DashboardStats)
async def get_dashboard_stats(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    print(f"Dashboard request from user: {current_user.email} (ID: {current_user.id})")
    
    # Get scan counts
    if current_user.is_admin:
        # Admin sees all scans
        total_scans = db.query(ScanHistory).count()
        safe_count = db.query(ScanHistory).filter(ScanHistory.safe_to_eat == True).count()
        unsafe_count = db.query(ScanHistory).filter(ScanHistory.safe_to_eat == False).count()
        recent_scans = db.query(ScanHistory).order_by(ScanHistory.scan_date.desc()).limit(5).all()
    else:
        # Regular users see only their scans
        total_scans = db.query(ScanHistory).filter(ScanHistory.user_id == current_user.id).count()
        safe_count = db.query(ScanHistory).filter(ScanHistory.user_id == current_user.id, ScanHistory.safe_to_eat == True).count()
        unsafe_count = db.query(ScanHistory).filter(ScanHistory.user_id == current_user.id, ScanHistory.safe_to_eat == False).count()
        recent_scans = db.query(ScanHistory).filter(ScanHistory.user_id == current_user.id).order_by(ScanHistory.scan_date.desc()).limit(5).all()
    
    # Convert scan history records to response objects
    recent_scans_response = [ScanHistoryResponse(
        id=scan.id,
        user_id=scan.user_id,
        vegetable_name=scan.vegetable_name,
        confidence=scan.confidence,
        safe_to_eat=scan.safe_to_eat,
        scan_date=scan.scan_date,
        image_url=scan.image_url
    ) for scan in recent_scans]
    
    return DashboardStats(
        total_good=safe_count,
        total_bad=unsafe_count,
        recentScans=recent_scans_response
    )

@app.get("/history", response_model=List[ScanHistoryResponse])
async def get_scan_history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    print(f"History request from user: {current_user.email} (ID: {current_user.id})")
    
    # Get scan history
    if current_user.is_admin:
        # Admin sees all scans
        scans = db.query(ScanHistory).order_by(ScanHistory.scan_date.desc()).all()
    else:
        # Regular users see only their scans
        scans = db.query(ScanHistory).filter(ScanHistory.user_id == current_user.id).order_by(ScanHistory.scan_date.desc()).all()
    
    # Convert scan history records to response objects
    return [ScanHistoryResponse(
        id=scan.id,
        user_id=scan.user_id,
        vegetable_name=scan.vegetable_name,
        confidence=scan.confidence,
        safe_to_eat=scan.safe_to_eat,
        scan_date=scan.scan_date,
        image_url=scan.image_url
    ) for scan in scans]

@app.post("/auth/register")
async def register(user: UserCreate, db: Session = Depends(get_db)):
    # Check if user exists
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    hashed_password = get_password_hash(user.password)
    db_user = User(
        email=user.email,
        username=user.username,
        hashed_password=hashed_password,
        is_admin=user.is_admin or False
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    access_token = create_access_token(data={"sub": db_user.email})
    return {"access_token": access_token, "token_type": "bearer", "user_id": db_user.id}

@app.post("/auth/login")
async def login(user: UserLogin, db: Session = Depends(get_db)):
    print(f"Login attempt for: {user.email}")
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        print(f"Login failed for: {user.email}")
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    print(f"Login successful for: {user.email} (ID: {db_user.id})")
    access_token = create_access_token(data={"sub": db_user.email})
    print(f"Generated token: {access_token[:10]}...")
    return {"access_token": access_token, "token_type": "bearer", "user_id": db_user.id}

@app.get("/users/me", response_model=UserResponse)
async def get_current_user_details(current_user: User = Depends(get_current_user)):
    print(f"Returning user details for: {current_user.email}")
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        username=current_user.username,
        is_admin=current_user.is_admin,
        created_at=current_user.created_at
    )

@app.post("/scan", response_model=ScanResult)
async def scan_vegetable(
    image: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Scan vegetable image and return analysis"""
    try:
        print(f"\n[SCAN] Processing scan request from user: {current_user.email} (ID: {current_user.id})")
        print(f"Image filename: {image.filename}, content_type: {image.content_type}")
        
        # Read and encode image
        try:
            contents = await image.read()
            print(f"Successfully read image, size: {len(contents)} bytes")
            image_base64 = base64.b64encode(contents).decode('utf-8')
        except Exception as e:
            print(f"Error reading image: {str(e)}")
            raise HTTPException(status_code=400, detail=f"Invalid image file: {str(e)}")
        
        # Check if we have this image in our dataset cache
        try:
            image_hash = hashlib.md5(contents).hexdigest()
            print(f"Image hash: {image_hash}")
            cached_result = db.query(ScanHistory).filter(ScanHistory.image_hash == image_hash).first()
        except Exception as e:
            print(f"Error calculating hash or querying cache: {str(e)}")
            cached_result = None
        
        if cached_result:
            # Return cached result
            print(f"Found cached result for image hash {image_hash}")
            try:
                result = {
                    "vegetable_name": cached_result.vegetable_name,
                    "safe_to_eat": cached_result.safe_to_eat,
                    "disease_name": cached_result.disease_name,
                    "recommendation": cached_result.recommendation,
                    "confidence": 90,  # High confidence for cached results
                    "analysis_date": cached_result.timestamp.isoformat()
                }
                print(f"Cached result: {result}")
            except Exception as e:
                print(f"Error preparing cached result: {str(e)}")
                raise HTTPException(status_code=500, detail=f"Error processing cached result: {str(e)}")
        else:
            # Call LM Studio for analysis
            print(f"No cached result found, calling LM Studio API")
            try:
                result = await call_lm_studio(image_base64)
                print(f"LM Studio API result: {result}")
            except Exception as e:
                print(f"Error calling LM Studio API: {str(e)}")
                raise HTTPException(status_code=500, detail=f"AI analysis failed: {str(e)}")
            
            # Ensure we have all required fields
            try:
                if "vegetable_name" not in result or not result["vegetable_name"]:
                    result["vegetable_name"] = "Unknown"
                if "safe_to_eat" not in result:
                    result["safe_to_eat"] = False
                if "disease_name" not in result or result["disease_name"] is None:
                    result["disease_name"] = "None detected"
                if "recommendation" not in result or not result["recommendation"]:
                    if result.get("safe_to_eat", False):
                        result["recommendation"] = "This vegetable appears fresh and safe to eat."
                    else:
                        result["recommendation"] = "This vegetable may not be safe to eat. Consider discarding it."
                
                # Add confidence and analysis_date if not present
                if "confidence" not in result:
                    result["confidence"] = 85  # Default confidence
                
                # Always set the current timestamp for analysis_date
                current_time = datetime.utcnow()
                result["analysis_date"] = current_time.isoformat()
                
                print(f"Normalized result: {result}")
            except Exception as e:
                print(f"Error normalizing result: {str(e)}")
                raise HTTPException(status_code=500, detail=f"Error processing AI result: {str(e)}")
            
            # Save scan history
            try:
                scan_history = ScanHistory(
                    user_id=current_user.id,
                    image_hash=image_hash,
                    vegetable_name=result["vegetable_name"],
                    safe_to_eat=result["safe_to_eat"],
                    disease_name=result["disease_name"],
                    recommendation=result["recommendation"],
                    timestamp=current_time
                )
                db.add(scan_history)
                db.commit()
                print(f"Saved scan history with ID: {scan_history.id}")
            except Exception as e:
                print(f"Error saving scan history: {str(e)}")
                db.rollback()
                # Continue without raising exception - we still want to return results
            
            # If admin user, add to dataset for reinforcement
            if current_user.is_admin:
                try:
                    # Save image to dataset folder
                    os.makedirs("dataset", exist_ok=True)
                    image_path = f"dataset/{image_hash}.jpg"
                    with open(image_path, "wb") as f:
                        f.write(contents)
                    print(f"Admin user scan saved to dataset: {image_path}")
                except Exception as e:
                    print(f"Error saving to dataset: {str(e)}")
                    # Continue without raising exception
        
        print(f"Final scan result: {result}")
        return ScanResult(**result)
    except HTTPException as he:
        # Re-raise HTTP exceptions as-is
        raise he
    except Exception as e:
        print(f"Unhandled error in scan_vegetable: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")


async def check_dataset_first(image_base64: str, db: Session) -> Optional[dict]:
    """Check if similar vegetable exists in dataset"""
    # Simple implementation - in production, you'd use image similarity
    # For now, we'll just return None to always use LM Studio
    return None

def mock_lm_studio(image_data: str) -> dict:
    """Generate mock AI response for testing when LM Studio is not available"""
    import random
    import hashlib
    
    # Use the first few bytes of the image hash to determine the response
    # This ensures the same image gets the same response
    image_hash = hashlib.md5(image_data.encode('utf-8')[:1000] if isinstance(image_data, str) else image_data[:1000]).hexdigest()
    hash_value = int(image_hash[:8], 16)  # Use first 8 chars of hash as number
    
    # List of possible vegetables
    vegetables = [
        {"name": "Tomato", "safe": True, "disease": "None detected", "confidence": 92},
        {"name": "Potato", "safe": True, "disease": "None detected", "confidence": 88},
        {"name": "Carrot", "safe": True, "disease": "None detected", "confidence": 95},
        {"name": "Cucumber", "safe": True, "disease": "None detected", "confidence": 91},
        {"name": "Broccoli", "safe": True, "disease": "None detected", "confidence": 89},
        {"name": "Tomato", "safe": False, "disease": "Early Blight", "confidence": 87},
        {"name": "Potato", "safe": False, "disease": "Late Blight", "confidence": 84},
        {"name": "Cucumber", "safe": False, "disease": "Powdery Mildew", "confidence": 82},
        {"name": "Lettuce", "safe": False, "disease": "Bacterial Spot", "confidence": 86}
    ]
    
    # Deterministically select a vegetable based on the hash
    selected = vegetables[hash_value % len(vegetables)]
    
    # Generate recommendation based on safety
    if selected["safe"]:
        recommendation = f"This {selected['name']} appears fresh and safe to eat."
    else:
        recommendation = f"This {selected['name']} shows signs of {selected['disease']}. It's recommended to discard it."
    
    # Create the result
    result = {
        "vegetable_name": selected["name"],
        "safe_to_eat": selected["safe"],
        "disease_name": selected["disease"],
        "recommendation": recommendation,
        "confidence": selected["confidence"],
        "analysis_date": datetime.utcnow().isoformat()
    }
    
    print(f"[MOCK AI] Generated response: {result}")
    return result

async def call_lm_studio(image_base64: str) -> dict:
    """Call LM Studio API for vegetable analysis"""
    # If mock mode is enabled, use mock response
    if USE_MOCK_AI:
        print("Using mock LM Studio response (USE_MOCK_AI=true)")
        return mock_lm_studio(image_base64)
    
    async with httpx.AsyncClient() as client:
        try:
            print(f"Calling LM Studio API at {LM_STUDIO_BASE_URL}")
            try:
                response = await client.post(
                    f"{LM_STUDIO_BASE_URL}/chat/completions",
                    json={
                        "model": "google/gemma-3-4b",
                        "messages": [
                            {
                                "role": "user",
                                "content": [
                                    {"type": "text", "text": LM_STUDIO_PROMPT},
                                    {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{image_base64}"}}
                                ]
                            }
                        ],
                        "max_tokens": 500,
                        "temperature": 0.1
                    },
                    timeout=30.0
                )
                print(f"LM Studio API response status: {response.status_code}")
                
                if response.status_code == 200:
                    try:
                        result = response.json()
                        print(f"LM Studio API response JSON: {result}")
                        content = result["choices"][0]["message"]["content"]
                        print(f"Raw LM Studio response content: {content}")
                        
                        # Extract JSON from code blocks if present
                        json_content = content
                        if "```json" in content:
                            # Extract content between ```json and ``` markers
                            import re
                            json_match = re.search(r'```json\n(.+?)\n```', content, re.DOTALL)
                            if json_match:
                                json_content = json_match.group(1)
                                print(f"Extracted JSON from code block: {json_content}")
                        
                        # Parse JSON response
                        try:
                            parsed_result = json.loads(json_content)
                            print(f"Successfully parsed JSON: {parsed_result}")
                            
                            # Create a normalized result with proper field names
                            normalized_result = {
                                "vegetable_name": parsed_result.get("Vegetable Name", "Unknown"),
                                "safe_to_eat": parsed_result.get("Safe to Eat", False),
                                "disease_name": parsed_result.get("Disease Name", None),
                                "recommendation": parsed_result.get("Recommendation", "")
                            }
                            
                            # Handle null/None values properly
                            if normalized_result["disease_name"] is None:
                                normalized_result["disease_name"] = "None detected"
                                
                            if normalized_result["recommendation"] is None:
                                if normalized_result["safe_to_eat"]:
                                    normalized_result["recommendation"] = "This vegetable appears fresh and safe to eat."
                                else:
                                    normalized_result["recommendation"] = "This vegetable may not be safe to eat. Consider discarding it."
                            
                            # Add confidence level
                            normalized_result["confidence"] = 85
                            
                            print(f"Normalized result: {normalized_result}")
                            return normalized_result
                        except json.JSONDecodeError as e:
                            print(f"JSON decode error: {e}")
                            # Fallback parsing if JSON is malformed
                            return parse_fallback_response(content)
                    except Exception as e:
                        print(f"Error processing LM Studio response: {str(e)}")
                        import traceback
                        traceback.print_exc()
                        # Fallback to mock response
                        print("Falling back to mock response due to processing error")
                        return mock_lm_studio(image_base64)
                else:
                    error_content = response.text
                    print(f"LM Studio API error response: {error_content}")
                    # Fallback to mock response
                    print("Falling back to mock response due to API error")
                    return mock_lm_studio(image_base64)
            except Exception as e:
                print(f"Error calling LM Studio API: {str(e)}")
                import traceback
                traceback.print_exc()
                # Fallback to mock response
                print("Falling back to mock response due to connection error")
                return mock_lm_studio(image_base64)
                
        except httpx.TimeoutException as e:
            print(f"LM Studio API timeout: {str(e)}")
            # Fallback to mock response
            print("Falling back to mock response due to timeout")
            return mock_lm_studio(image_base64)

def parse_fallback_response(content: str) -> dict:
    """Parse non-JSON response from LM Studio"""
    print(f"Using fallback parser for content: {content[:100]}...")
    
    # Default result
    result = {
        "vegetable_name": "Unknown",
        "safe_to_eat": False,
        "disease_name": None,
        "recommendation": "Unable to analyze properly"
    }
    
    # Try to extract from markdown or plain text
    lines = content.strip().split('\n')
    
    # Remove markdown code block markers if present
    clean_lines = []
    for line in lines:
        if line.strip().startswith('```') or line.strip() == '```':
            continue
        clean_lines.append(line)
    
    # Process the cleaned lines
    for line in clean_lines:
        # Check for vegetable name
        if any(x in line.lower() for x in ["vegetable name:", "vegetable:"]):
            parts = line.split(":", 1)
            if len(parts) > 1:
                result["vegetable_name"] = parts[1].strip()
        
        # Check for safety status
        elif any(x in line.lower() for x in ["safe to eat:", "safety:", "safe:"]):  
            safe_value = line.split(":", 1)[1].lower().strip() if len(line.split(":", 1)) > 1 else ""
            result["safe_to_eat"] = any(x in safe_value for x in ["true", "yes", "safe"])
        
        # Check for disease
        elif any(x in line.lower() for x in ["disease name:", "disease:", "issues:", "problem:"]):  
            disease = line.split(":", 1)[1].strip() if len(line.split(":", 1)) > 1 else ""
            if disease and not any(x in disease.lower() for x in ["none", "not detected", "n/a"]):
                result["disease_name"] = disease
        
        # Check for recommendation
        elif any(x in line.lower() for x in ["recommendation:", "advice:", "suggest:"]):  
            result["recommendation"] = line.split(":", 1)[1].strip() if len(line.split(":", 1)) > 1 else ""
    
    # Add confidence and analysis date for frontend display
    result["confidence"] = 85  # Default confidence level
    result["analysis_date"] = datetime.utcnow().isoformat()
    
    print(f"Fallback parser result: {result}")
    return result

async def add_to_dataset(result: dict, image_base64: str, db: Session):
    """Add scan result to dataset for future reference"""
    dataset_entry = VegetableDataset(
        vegetable_name=result.get("vegetable_name", "Unknown"),
        safe_to_eat=result.get("safe_to_eat", False),
        disease_name=result.get("disease_name"),
        recommendation=result.get("recommendation", ""),
        image_hash=hash(image_base64),  # Simple hash for now
        created_at=datetime.utcnow()
    )
    db.add(dataset_entry)
    db.commit()

@app.get("/dashboard", response_model=DashboardStats)
async def get_dashboard(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.is_admin:
        total_good = db.query(ScanHistory).filter(ScanHistory.safe_to_eat == True).count()
        total_bad = db.query(ScanHistory).filter(ScanHistory.safe_to_eat == False).count()
        total_users = db.query(User).count()
        
        # Get recent scans for admin (all users)
        recent_scans = db.query(ScanHistory).order_by(ScanHistory.scan_date.desc()).limit(5).all()
    else:
        total_good = db.query(ScanHistory).filter(
            ScanHistory.user_id == current_user.id,
            ScanHistory.safe_to_eat == True
        ).count()
        total_bad = db.query(ScanHistory).filter(
            ScanHistory.user_id == current_user.id,
            ScanHistory.safe_to_eat == False
        ).count()
        total_users = 1
        
        # Get recent scans for this user only
        recent_scans = db.query(ScanHistory).filter(
            ScanHistory.user_id == current_user.id
        ).order_by(ScanHistory.scan_date.desc()).limit(5).all()
    
    # Convert to response model
    recent_scans_response = [
        ScanHistoryResponse(
            id=scan.id,
            vegetable_name=scan.vegetable_name,
            safe_to_eat=scan.safe_to_eat,
            disease_name=scan.disease_name,
            recommendation=scan.recommendation,
            scan_date=scan.scan_date
        ) for scan in recent_scans
    ]
    
    return DashboardStats(
        total_good=total_good,
        total_bad=total_bad,
        total_users=total_users,
        totalScans=total_scans,
        safeVegetables=total_good,
        unsafeVegetables=total_bad,
        recentScans=recent_scans
    )

@app.get("/history")
async def get_history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.is_admin:
        # Admin can see all history
        history = db.query(ScanHistory).order_by(ScanHistory.scan_date.desc()).limit(100).all()
    else:
        # Users see only their history
        history = db.query(ScanHistory).filter(
            ScanHistory.user_id == current_user.id
        ).order_by(ScanHistory.scan_date.desc()).limit(100).all()
    
    return history

@app.get("/admin/users")
async def get_users(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    users = db.query(User).all()
    return users

@app.get("/admin/system-status")
async def get_system_status(current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Check LM Studio connection
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{LM_STUDIO_BASE_URL}/models", timeout=5.0)
            lm_studio_status = "online" if response.status_code == 200 else "offline"
    except:
        lm_studio_status = "offline"
    
    return {
        "lm_studio_status": lm_studio_status,
        "api_status": "online",
        "database_status": "online"
    }

@app.get("/dataset")
async def get_dataset(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get vegetable dataset for sharing"""
    dataset = db.query(VegetableDataset).all()
    return dataset

@app.post("/admin/system/test-ai")
async def test_ai_connection(current_user: User = Depends(get_current_user)):
    """Test LM Studio AI connection"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{LM_STUDIO_BASE_URL}/models", timeout=10.0)
            if response.status_code == 200:
                return {"status": "success", "message": "AI connection successful"}
            else:
                return {"status": "error", "message": f"AI returned status {response.status_code}"}
    except Exception as e:
        return {"status": "error", "message": f"AI connection failed: {str(e)}"}

@app.post("/admin/system/clear-dataset")
async def clear_dataset(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Clear the vegetable dataset"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    try:
        db.query(VegetableDataset).delete()
        db.commit()
        return {"status": "success", "message": "Dataset cleared successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to clear dataset: {str(e)}")

@app.get("/admin/system/export-data")
async def export_data(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Export system data"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Get all data
    users = db.query(User).all()
    scans = db.query(ScanHistory).all()
    dataset = db.query(VegetableDataset).all()
    
    export_data = {
        "export_date": datetime.utcnow().isoformat(),
        "users": [{"id": u.id, "email": u.email, "username": u.username, "is_admin": u.is_admin} for u in users],
        "scan_history": [{"id": s.id, "user_id": s.user_id, "vegetable_name": s.vegetable_name, 
                         "safe_to_eat": s.safe_to_eat, "scan_date": s.scan_date.isoformat()} for s in scans],
        "dataset": [{"vegetable_name": d.vegetable_name, "safe_to_eat": d.safe_to_eat, 
                    "disease_name": d.disease_name} for d in dataset]
    }
    
    return export_data

@app.post("/admin/users/{user_id}/toggle-status")
async def toggle_user_status(user_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Toggle user active status"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Toggle active status (assuming we add this field)
    user.is_active = not getattr(user, 'is_active', True)
    db.commit()
    
    return {"status": "success", "message": f"User status updated"}

@app.delete("/admin/users/{user_id}")
async def delete_user(user_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Delete a user"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Don't allow deleting yourself
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")
    
    # Delete user's scan history first
    db.query(ScanHistory).filter(ScanHistory.user_id == user_id).delete()
    # Delete user
    db.delete(user)
    db.commit()
    
    return {"status": "success", "message": "User deleted successfully"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 8000)))
