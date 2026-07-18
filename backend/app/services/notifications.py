from sqlalchemy.orm import Session

from app.models import BloodGroup, Donor, Notification, User, UserRole


def create_notification(db: Session, user_id: int, title: str, message: str, channel: str = "dashboard") -> Notification:
    notification = Notification(user_id=user_id, title=title, message=message, channel=channel)
    db.add(notification)
    return notification


def notify_nearby_donors(db: Session, blood_group: BloodGroup, city: str, request_id: int) -> int:
    donors = (
        db.query(Donor)
        .join(Donor.user)
        .filter(Donor.blood_group == blood_group, Donor.city.ilike(city), Donor.available.is_(True))
        .all()
    )
    for donor in donors:
        create_notification(
            db,
            donor.user_id,
            "Emergency blood request",
            f"A {blood_group.value} request is waiting in {city}. Request ID: {request_id}.",
            "dashboard",
        )
    db.commit()
    return len(donors)


def notify_admins(db: Session, title: str, message: str) -> int:
    admins = db.query(User).filter(User.role == UserRole.ADMIN).all()
    for admin in admins:
        create_notification(db, admin.id, title, message)
    db.commit()
    return len(admins)
