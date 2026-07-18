from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models import BloodGroup, RequestStatus


class BloodRequestBase(BaseModel):
    blood_group: BloodGroup
    units_required: int = Field(default=1, ge=1, le=10)
    urgency: str = Field(default="normal", pattern="^(normal|urgent|critical|emergency)$")
    patient_name: str = Field(min_length=2, max_length=160)
    city: str = Field(min_length=2, max_length=120)
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    notes: str | None = None


class BloodRequestCreate(BloodRequestBase):
    hospital_id: int | None = None


class BloodRequestUpdate(BaseModel):
    status: RequestStatus | None = None
    units_required: int | None = Field(default=None, ge=1, le=10)
    urgency: str | None = Field(default=None, pattern="^(normal|urgent|critical|emergency)$")
    notes: str | None = None


class BloodRequestRead(BloodRequestBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    recipient_id: int | None
    hospital_id: int | None
    status: RequestStatus
    created_at: datetime
