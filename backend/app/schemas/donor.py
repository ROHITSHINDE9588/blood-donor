from datetime import date

from pydantic import BaseModel, ConfigDict, Field

from app.models import BloodGroup, VerificationStatus
from app.schemas.user import UserRead


class DonorBase(BaseModel):
    blood_group: BloodGroup
    city: str = Field(min_length=2, max_length=120)
    age: int = Field(ge=18, le=65)
    health_status: str = Field(default="healthy", max_length=120)
    available: bool = True
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)
    last_donation_date: date | None = None
    previous_donations: int = Field(default=0, ge=0)


class DonorCreate(DonorBase):
    pass


class DonorUpdate(BaseModel):
    blood_group: BloodGroup | None = None
    city: str | None = Field(default=None, min_length=2, max_length=120)
    age: int | None = Field(default=None, ge=18, le=65)
    health_status: str | None = Field(default=None, max_length=120)
    available: bool | None = None
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)
    last_donation_date: date | None = None
    previous_donations: int | None = Field(default=None, ge=0)


class DonorRead(DonorBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    verification_status: VerificationStatus
    user: UserRead


class DonorSearchParams(BaseModel):
    blood_group: BloodGroup | None = None
    city: str | None = None
    available: bool | None = True
    latitude: float | None = None
    longitude: float | None = None
    distance_km: float | None = Field(default=25, gt=0)


class NearbyDonor(BaseModel):
    donor: DonorRead
    distance_km: float | None
    estimated_arrival_minutes: int | None
