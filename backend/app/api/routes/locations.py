from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field

from app.api.deps import get_current_user
from app.database.session import get_db
from app.models import Donor, User, UserRole, Location
from app.schemas.common import MessageResponse

router = APIRouter(prefix="/locations", tags=["Location"])

class LocationUpdate(BaseModel):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)

@router.put("/update", response_model=MessageResponse)
def update_location(
    payload: LocationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Update Location table for history/tracking
    location = db.query(Location).filter(Location.user_id == current_user.id).first()
    if not location:
        location = Location(user_id=current_user.id, latitude=payload.latitude, longitude=payload.longitude)
        db.add(location)
    else:
        location.latitude = payload.latitude
        location.longitude = payload.longitude

    # Update specific role tables if needed (e.g. Donor)
    if current_user.role == UserRole.DONOR:
        donor = db.query(Donor).filter(Donor.user_id == current_user.id).first()
        if donor:
            donor.latitude = payload.latitude
            donor.longitude = payload.longitude

    db.commit()
    return MessageResponse(message="Location updated successfully")
