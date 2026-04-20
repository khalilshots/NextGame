# schemas.py
from pydantic import BaseModel

class UserResponse(BaseModel):
    id: int
    username: str

    class Config:
        from_attributes = True

class RegisterRequest(BaseModel):
    username: str
    password: str

