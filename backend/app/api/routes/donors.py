from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.orm import Session, joinedload

from app.api.deps import get_current_user, require_roles
from app.database.session import get_db
from app.models import BloodGroup, Donor, User, UserRole
from app.schemas.common import MessageResponse
from app.schemas.donor import DonorCreate, DonorRead, DonorUpdate, NearbyDonor
from app.services.geo import distance_km, estimate_arrival_minutes

router = APIRouter(prefix="/donors", tags=["Donor"])


@router.post("", response_model=DonorRead, status_code=status.HTTP_201_CREATED)
def create_donor_profile(
    payload: DonorCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.DONOR, UserRole.ADMIN)),
):
    existing = db.query(Donor).filter(Donor.user_id == current_user.id).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Donor profile already exists")
    donor = Donor(user_id=current_user.id, **payload.model_dump())
    db.add(donor)
    db.commit()
    db.refresh(donor)
    return donor


@router.get("", response_model=list[NearbyDonor])
def list_donors(
    blood_group: BloodGroup | None = None,
    city: str | None = None,
    available: bool | None = None,
    latitude: float | None = Query(default=None, ge=-90, le=90),
    longitude: float | None = Query(default=None, ge=-180, le=180),
    distance: float = Query(default=25, gt=0),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    query = db.query(Donor).options(joinedload(Donor.user))
    if blood_group:
        query = query.filter(Donor.blood_group == blood_group)
    if city:
        query = query.filter(Donor.city.ilike(city))
    if available is not None:
        query = query.filter(Donor.available.is_(available))

    results: list[NearbyDonor] = []
    for donor in query.limit(100).all():
        donor_distance = None
        eta = None
        if latitude is not None and longitude is not None and donor.latitude is not None and donor.longitude is not None:
            donor_distance = distance_km(latitude, longitude, donor.latitude, donor.longitude)
            if donor_distance > distance:
                continue
            eta = estimate_arrival_minutes(donor_distance)
        results.append(NearbyDonor(donor=donor, distance_km=donor_distance, estimated_arrival_minutes=eta))
    return results


class DonorStatusUpdate(BaseModel):
    available: bool

@router.put("/me/status", response_model=DonorRead)
def update_my_status(
    payload: DonorStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.DONOR)),
):
    donor = db.query(Donor).filter(Donor.user_id == current_user.id).first()
    if not donor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Donor profile not found")
    donor.available = payload.available
    db.commit()
    db.refresh(donor)
    return donor


@router.put("/{donor_id}", response_model=DonorRead)
def update_donor(
    donor_id: int,
    payload: DonorUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    donor = db.get(Donor, donor_id)
    if not donor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Donor not found")
    if current_user.role != UserRole.ADMIN and donor.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot update this donor")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(donor, field, value)
    db.commit()
    db.refresh(donor)
    return donor


@router.delete("/{donor_id}", response_model=MessageResponse)
def delete_donor(
    donor_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    donor = db.get(Donor, donor_id)
    if not donor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Donor not found")
    if current_user.role != UserRole.ADMIN and donor.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot delete this donor")
    db.delete(donor)
    db.commit()
    return MessageResponse(message="Donor profile deleted")


class DonorVerificationUpdate(BaseModel):
    verification_status: str  # "pending", "approved", "rejected"

@router.put("/{donor_id}/verification", response_model=DonorRead)
def update_donor_verification(
    donor_id: int,
    payload: DonorVerificationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.HOSPITAL)),
):
    """Admin or Hospital can approve/reject a donor's verification status."""
    from app.models.entities import VerificationStatus
    donor = db.get(Donor, donor_id)
    if not donor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Donor not found")
    try:
        donor.verification_status = VerificationStatus(payload.verification_status)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid status: {payload.verification_status}")
    db.commit()
    db.refresh(donor)
    return donor
