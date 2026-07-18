from pydantic import BaseModel, Field

from app.models import BloodGroup
from app.schemas.donor import DonorRead


class RankDonorRequest(BaseModel):
    request_id: int | None = None
    blood_group: BloodGroup
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    city: str | None = None


class RankedDonor(BaseModel):
    donor: DonorRead
    distance_km: float
    estimated_arrival_minutes: int
    priority_score: float
    priority_rank: int


class VerificationResult(BaseModel):
    accepted: bool
    document_type: str
    confidence: float
    extracted_text: str | None = None
    reasons: list[str] = []


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    reply: str


class DemandPrediction(BaseModel):
    blood_group: BloodGroup
    predicted_demand_units: int
    trend: str  # 'increasing', 'decreasing', 'stable'

