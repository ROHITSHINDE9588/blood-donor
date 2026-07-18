from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.deps import require_roles
from app.database.session import get_db
from app.models import BloodRequest, DonationHistory, Donor, Hospital, Recipient, RequestStatus, User, UserRole
from app.schemas.analytics import AnalyticsResponse, BloodGroupMetric, DashboardStats

router = APIRouter(tags=["Analytics"])


@router.get("/dashboard", response_model=DashboardStats)
def dashboard(
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(UserRole.ADMIN, UserRole.HOSPITAL)),
):
    return DashboardStats(
        users=db.query(User).count(),
        donors=db.query(Donor).count(),
        recipients=db.query(Recipient).count(),
        hospitals=db.query(Hospital).count(),
        blood_requests=db.query(BloodRequest).count(),
        completed_donations=db.query(DonationHistory).count(),
        active_emergencies=db.query(BloodRequest).filter(BloodRequest.status.in_([RequestStatus.PENDING, RequestStatus.VERIFIED])).count(),
    )


@router.get("/analytics", response_model=AnalyticsResponse)
def analytics(
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(UserRole.ADMIN, UserRole.HOSPITAL)),
):
    stats = dashboard(db=db)
    blood_groups = [
        BloodGroupMetric(blood_group=row[0].value, count=row[1])
        for row in db.query(Donor.blood_group, func.count(Donor.id)).group_by(Donor.blood_group).all()
    ]
    request_statuses = {
        row[0].value: row[1]
        for row in db.query(BloodRequest.status, func.count(BloodRequest.id)).group_by(BloodRequest.status).all()
    }
    return AnalyticsResponse(stats=stats, blood_groups=blood_groups, request_statuses=request_statuses)
