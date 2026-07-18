from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_roles
from app.database.session import get_db
from app.models import Hospital, User, UserRole
from app.schemas.hospital import HospitalCreate, HospitalRead, HospitalUpdate

router = APIRouter(prefix="/hospitals", tags=["Hospital"])


@router.get("", response_model=list[HospitalRead])
def list_hospitals(db: Session = Depends(get_db)):
    return db.query(Hospital).limit(100).all()


@router.post("", response_model=HospitalRead, status_code=status.HTTP_201_CREATED)
def create_hospital(
    payload: HospitalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.HOSPITAL, UserRole.ADMIN)),
):
    hospital = Hospital(user_id=current_user.id if current_user.role == UserRole.HOSPITAL else None, **payload.model_dump())
    db.add(hospital)
    db.commit()
    db.refresh(hospital)
    return hospital


@router.put("/{hospital_id}", response_model=HospitalRead)
def update_hospital(
    hospital_id: int,
    payload: HospitalUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    hospital = db.get(Hospital, hospital_id)
    if not hospital:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hospital not found")
    if current_user.role != UserRole.ADMIN and hospital.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot update this hospital")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(hospital, field, value)
    db.commit()
    db.refresh(hospital)
    return hospital
