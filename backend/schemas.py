from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str
    is_admin: Optional[bool] = False

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class ScanResult(BaseModel):
    vegetable_name: str
    safe_to_eat: bool
    disease_name: Optional[str] = None
    recommendation: str
    confidence: Optional[int] = 90
    analysis_date: Optional[str] = None

class ScanHistoryResponse(BaseModel):
    id: int
    vegetable_name: str
    safe_to_eat: bool
    disease_name: Optional[str]
    recommendation: str
    scan_date: datetime
    
    class Config:
        from_attributes = True

class DashboardStats(BaseModel):
    total_good: int
    total_bad: int
    total_users: int
    totalScans: int
    safeVegetables: int
    unsafeVegetables: int
    recentScans: List[ScanHistoryResponse]

class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    is_admin: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class VegetableDatasetResponse(BaseModel):
    id: int
    vegetable_name: str
    safe_to_eat: bool
    disease_name: Optional[str]
    recommendation: str
    created_at: datetime
    usage_count: int
    
    class Config:
        from_attributes = True
