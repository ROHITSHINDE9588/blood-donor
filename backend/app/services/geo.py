from geopy.distance import geodesic


def distance_km(origin_lat: float, origin_lng: float, target_lat: float, target_lng: float) -> float:
    return round(geodesic((origin_lat, origin_lng), (target_lat, target_lng)).km, 2)


def estimate_arrival_minutes(distance: float, average_speed_kmph: int = 28) -> int:
    if distance <= 0:
        return 1
    return max(1, round((distance / average_speed_kmph) * 60))
