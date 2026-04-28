from sqlalchemy import Column, String, Float, Integer, JSON, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Dataset(Base):
    __tablename__ = "datasets"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, index=True) # Firebase UID
    filename = Column(String)
    row_count = Column(Integer)
    column_info = Column(JSON)  # List of ColumnInfo objects
    created_at = Column(DateTime, default=datetime.utcnow)

    analyses = relationship("Analysis", back_populates="dataset")

class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, index=True) # Firebase UID
    dataset_id = Column(String, ForeignKey("datasets.id"))
    metrics = Column(JSON)  # FairnessMetrics object
    risk_score = Column(Float)
    risk_level = Column(String)
    model_accuracy = Column(Float)
    feature_importance = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)

    dataset = relationship("Dataset", back_populates="analyses")
