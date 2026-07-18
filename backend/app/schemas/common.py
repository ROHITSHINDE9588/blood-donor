from datetime import datetime

from pydantic import BaseModel, ConfigDict


class MessageResponse(BaseModel):
    message: str


class Pagination(BaseModel):
    page: int = 1
    page_size: int = 20


class NotificationRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    message: str
    channel: str
    is_read: bool
    created_at: datetime
