from datetime import date

from sqlalchemy.orm import Session, joinedload

from app.models import AIRanking, BloodGroup, BloodRequest, Donor
from app.schemas.ai import RankedDonor
from app.services.geo import distance_km, estimate_arrival_minutes


COMPATIBLE_GROUPS: dict[BloodGroup, set[BloodGroup]] = {
    BloodGroup.A_POS: {BloodGroup.A_POS, BloodGroup.A_NEG, BloodGroup.O_POS, BloodGroup.O_NEG},
    BloodGroup.A_NEG: {BloodGroup.A_NEG, BloodGroup.O_NEG},
    BloodGroup.B_POS: {BloodGroup.B_POS, BloodGroup.B_NEG, BloodGroup.O_POS, BloodGroup.O_NEG},
    BloodGroup.B_NEG: {BloodGroup.B_NEG, BloodGroup.O_NEG},
    BloodGroup.O_POS: {BloodGroup.O_POS, BloodGroup.O_NEG},
    BloodGroup.O_NEG: {BloodGroup.O_NEG},
    BloodGroup.AB_POS: set(BloodGroup),
    BloodGroup.AB_NEG: {BloodGroup.AB_NEG, BloodGroup.A_NEG, BloodGroup.B_NEG, BloodGroup.O_NEG},
}


def days_since_last_donation(donor: Donor) -> int:
    if not donor.last_donation_date:
        return 365
    return max(0, (date.today() - donor.last_donation_date).days)


def calculate_priority_score(donor: Donor, requested_group: BloodGroup, distance: float, eta_minutes: int) -> float:
    blood_score = 30 if donor.blood_group == requested_group else 22
    availability_score = 20 if donor.available else 0
    donation_gap = min(days_since_last_donation(donor), 180) / 180 * 15
    health_score = 12 if donor.health_status.lower() in {"healthy", "fit", "excellent"} else 4
    age_score = 10 if 20 <= donor.age <= 45 else 6
    experience_score = min(donor.previous_donations, 10)
    distance_score = max(0, 15 - distance)
    eta_penalty = max(0, eta_minutes - 30) * 0.25
    return round(min(100, blood_score + availability_score + donation_gap + health_score + age_score + experience_score + distance_score - eta_penalty), 2)


def rank_donors(
    db: Session,
    blood_group: BloodGroup,
    latitude: float,
    longitude: float,
    request: BloodRequest | None = None,
    city: str | None = None,
    limit: int = 25,
) -> list[RankedDonor]:
    compatible = COMPATIBLE_GROUPS[blood_group]
    query = (
        db.query(Donor)
        .options(joinedload(Donor.user))
        .filter(Donor.blood_group.in_(compatible), Donor.latitude.isnot(None), Donor.longitude.isnot(None))
    )
    if city:
        query = query.filter(Donor.city.ilike(city))

    ranked: list[RankedDonor] = []
    for donor in query.all():
        dist = distance_km(latitude, longitude, donor.latitude, donor.longitude)
        eta = estimate_arrival_minutes(dist)
        score = calculate_priority_score(donor, blood_group, dist, eta)
        ranked.append(
            RankedDonor(
                donor=donor,
                distance_km=dist,
                estimated_arrival_minutes=eta,
                priority_score=score,
                priority_rank=0,
            )
        )

    ranked.sort(key=lambda item: item.priority_score, reverse=True)
    ranked = ranked[:limit]
    for index, item in enumerate(ranked, start=1):
        item.priority_rank = index
        if request:
            existing = (
                db.query(AIRanking)
                .filter(AIRanking.request_id == request.id, AIRanking.donor_id == item.donor.id)
                .one_or_none()
            )
            if existing:
                existing.distance_km = item.distance_km
                existing.estimated_arrival_minutes = item.estimated_arrival_minutes
                existing.priority_score = item.priority_score
                existing.priority_rank = item.priority_rank
            else:
                db.add(
                    AIRanking(
                        request_id=request.id,
                        donor_id=item.donor.id,
                        distance_km=item.distance_km,
                        estimated_arrival_minutes=item.estimated_arrival_minutes,
                        priority_score=item.priority_score,
                        priority_rank=item.priority_rank,
                    )
                )
    if request:
        db.commit()
    return ranked
