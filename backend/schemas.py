# schemas.py
from pydantic import BaseModel
from pydantic import field_validator
import datetime

class RegisterRequest(BaseModel):
    username: str
    password: str

    @field_validator('password')
    def password_length(cls, v):
        if len(v) < 6:
            raise ValueError('Password must be at least 6 characters')
        return v


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


class PasswordChange(BaseModel):
    current_password: str
    new_password: str

    @field_validator('new_password')
    def password_length(cls, v):
        if len(v) < 6:
            raise ValueError('Password must be at least 6 characters')
        return v
    
class FeedbackCreate(BaseModel):
    type: str
    message: str

class FeedbackResponse(BaseModel):
    id: int
    type: str
    message: str
    user_id: int
    username: str
    resolved: bool
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class FeedbackUpdate(BaseModel):
    resolved: bool