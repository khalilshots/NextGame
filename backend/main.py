from fastapi import FastAPI, status, Depends, HTTPException
from models import User, Court, CheckIn
from database import engine, SessionLocal
from typing import Annotated
from auth import hash_password, verify_password, create_access_token, get_current_user
from fastapi.security import OAuth2PasswordRequestForm
from schemas import RegisterRequest, UserResponse
from models import Base
import schemas
import models
import datetime
from database import SessionLocal
from sqlalchemy.orm import Session
from datetime import datetime, timezone

app = FastAPI()
models.Base.metadata.create_all(bind=engine)
from auth import get_db

db_dependency = Annotated[Session, Depends(get_db)] 


@app.post("/auth/register")
def register(data: RegisterRequest, db: db_dependency): 
    hashed = hash_password(data.password)
    user = User(username=data.username, hashed_password=hashed)
    db.add(user)
    db.commit()

@app.post("/auth/token")
def login(db: db_dependency, form_data: OAuth2PasswordRequestForm = Depends()):
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
    token = create_access_token({"sub": user.username})
    return {"access_token": token, "token_type": "bearer"}


@app.get("/users/me", response_model=schemas.UserResponse)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

@app.get("/users/{user_id}", response_model=schemas.UserResponse)
def read_user(user_id: int, db: db_dependency):
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    return user

@app.get("/courts")
def read_courts(db: db_dependency):
    courts = db.query(Court).all()
    return courts

@app.get("/courts/{court_id}")
def read_court(court_id: int, db: db_dependency):
    court = db.query(Court).filter(Court.id == court_id).first()
    if court is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    return court

@app.post("/courts")
def create_court(name: str, latitude: float, longitude: float, db: db_dependency, current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
    court = Court(name=name, lattitude=latitude, longitude=longitude)
    db.add(court)
    db.commit()
    return court

@app.post("/courts/{court_id}/checkin")
def check_in(court_id: int, db: db_dependency, current_user: User = Depends(get_current_user)):
    court = db.query(Court).filter(Court.id == court_id).first()
    if court is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    existing = db.query(CheckIn).filter(CheckIn.user_id == current_user.id, CheckIn.checkedout_time == None).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Already checked in.")
    
    checkin = CheckIn(user_id=current_user.id, court_id=court_id)
    db.add(checkin)
    db.commit()
    return checkin

@app.post("/courts/{court_id}/checkout")
def check_out(court_id: int, db: db_dependency, current_user: User = Depends(get_current_user)):
    checkin = db.query(CheckIn).filter(
        CheckIn.user_id == current_user.id,
        CheckIn.checkedout_time == None
    ).first()
    if checkin is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Not checked in.")
    
    checkin.checkedout_time = datetime.now(timezone.utc)
    db.commit()
    return checkin


@app.get("/users/me/checkins")
def get_my_checkins(db: db_dependency, current_user: User = Depends(get_current_user)):
    checkins = db.query(CheckIn).filter(CheckIn.user_id == current_user.id).all()
    return checkins