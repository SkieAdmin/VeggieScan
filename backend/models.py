from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    username = Column(String, index=True)
    hashed_password = Column(String)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationship
    scan_history = relationship("ScanHistory", back_populates="user")

class ScanHistory(Base):
    __tablename__ = "scan_history"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    vegetable_name = Column(String, index=True)
    safe_to_eat = Column(Boolean)
    disease_name = Column(String, nullable=True)
    recommendation = Column(Text)
    image_data = Column(Text, nullable=True)  # Base64 encoded image
    image_hash = Column(String, index=True)  # MD5 hash of image for quick lookups
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    # Relationship
    user = relationship("User", back_populates="scan_history")

class VegetableDataset(Base):
    __tablename__ = "vegetable_dataset"
    
    id = Column(Integer, primary_key=True, index=True)
    vegetable_name = Column(String, index=True)
    safe_to_eat = Column(Boolean)
    disease_name = Column(String, nullable=True)
    recommendation = Column(Text)
    image_hash = Column(String, index=True)  # For similarity matching
    created_at = Column(DateTime, default=datetime.utcnow)
    usage_count = Column(Integer, default=0)  # Track how often this entry is used
