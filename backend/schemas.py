# schemas.py
from pydantic import BaseModel


class RegisterRequest(BaseModel):
    username: str
    password: str


class CourtRequest(BaseModel):
    name: str
    latitude: float
    longitude: float


class UserUpdate(BaseModel):
    bio: str | None = None
    profile_picture: str | None = None


class UserResponse(BaseModel):
    id: int
    username: str
    is_admin: bool
    bio: str | None = None
    profile_picture: str | None = None
    
    class Config:
        from_attributes = True