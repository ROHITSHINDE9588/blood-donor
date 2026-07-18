from pydantic import BaseModel


class DashboardStats(BaseModel):
    users: int
    donors: int
    recipients: int
    hospitals: int
    blood_requests: int
    completed_donations: int
    active_emergencies: int


class BloodGroupMetric(BaseModel):
    blood_group: str
    count: int


class AnalyticsResponse(BaseModel):
    stats: DashboardStats
    blood_groups: list[BloodGroupMetric]
    request_statuses: dict[str, int]
