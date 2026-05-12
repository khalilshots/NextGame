# schemas.py
from pydantic import BaseModel
from pydantic import field_validator


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