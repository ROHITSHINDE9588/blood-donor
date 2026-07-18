from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_roles
from app.database.session import get_db
from app.models import BloodRequest, Donor, Recipient, RequestStatus, User, UserRole
from app.schemas.blood_request import BloodRequestCreate, BloodRequestRead, BloodRequestUpdate
from app.schemas.common import MessageResponse
from app.services.notifications import create_notification, notify_nearby_donors
from app.services.ranking import rank_donors

router = APIRouter(prefix="/requests", tags=["Blood Request"])


@router.post("", response_model=BloodRequestRead, status_code=status.HTTP_201_CREATED)
def create_request(
    payload: BloodRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.RECIPIENT, UserRole.HOSPITAL, UserRole.ADMIN)),
):
    recipient_id = None
    if current_user.role == UserRole.RECIPIENT:
        recipient = db.query(Recipient).filter(Recipient.user_id == current_user.id).first()
        if not recipient:
            recipient = Recipient(user_id=current_user.id, city=payload.city, latitude=payload.latitude, longitude=payload.longitude)
            db.add(recipient)
            db.flush()
        recipient_id = recipient.id

    request = BloodRequest(recipient_id=recipient_id, **payload.model_dump())
    db.add(request)
    db.commit()
    db.refresh(request)
    notify_nearby_donors(db, request.blood_group, request.city, request.id)
    rank_donors(db, request.blood_group, request.latitude, request.longitude, request=request, city=request.city)
    return request


@router.get("", response_model=list[BloodRequestRead])
def list_requests(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return db.query(BloodRequest).order_by(BloodRequest.created_at.desc()).limit(100).all()


@router.put("/{request_id}", response_model=BloodRequestRead)
def update_request(
    request_id: int,
    payload: BloodRequestUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    request = db.get(BloodRequest, request_id)
    if not request:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")
    if current_user.role not in {UserRole.ADMIN, UserRole.HOSPITAL} and request.recipient and request.recipient.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot update this request")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(request, field, value)
    db.commit()
    db.refresh(request)
    return request


@router.post("/{request_id}/accept", response_model=MessageResponse)
def accept_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.DONOR)),
):
    donor = db.query(Donor).filter(Donor.user_id == current_user.id).first()
    request = db.get(BloodRequest, request_id)
    if not donor or not request:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Donor profile or request not found")
    request.status = RequestStatus.ACCEPTED
    create_notification(db, current_user.id, "Request accepted", f"You accepted blood request #{request_id}")
    db.commit()
    return MessageResponse(message="Blood request accepted")


@router.delete("/{request_id}", response_model=MessageResponse)
def delete_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.RECIPIENT)),
):
    request = db.get(BloodRequest, request_id)
    if not request:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")
    db.delete(request)
    db.commit()
    return MessageResponse(message="Blood request deleted")
