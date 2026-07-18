from pydantic import BaseModel, ConfigDict, Field

from app.models import VerificationStatus


class HospitalBase(BaseModel):
    name: str = Field(min_length=2, max_length=180)
    registration_number: str = Field(min_length=3, max_length=120)
    city: str = Field(min_length=2, max_length=120)
    address: str = Field(min_length=5)
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)
    phone: str | None = Field(default=None, max_length=40)


class HospitalCreate(HospitalBase):
    pass


class HospitalUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=180)
    city: str | None = Field(default=None, min_length=2, max_length=120)
    address: str | None = Field(default=None, min_length=5)
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)
    phone: str | None = Field(default=None, max_length=40)
    verification_status: VerificationStatus | None = None


class HospitalRead(HospitalBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int | None
    verification_status: VerificationStatus
