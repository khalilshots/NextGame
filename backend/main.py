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
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timezone, timedelta


TWO_HOURS = timedelta(hours=2)

app = FastAPI()
models.Base.metadata.create_all(bind=engine)
from auth import get_db

db_dependency = Annotated[Session, Depends(get_db)] 

origins = [
    "http://localhost:5173"
    "https://nextgame.me",
    "https://next-game-eml6bikka-khalils-projects-d3e0dabd.vercel.app",#remove this and the button one once the domain is active
    "https://next-game-git-main-khalils-projects-d3e0dabd.vercel.app",

]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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

@app.get("/courts/pending")
def get_pending_courts(db: db_dependency, current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admins only.")
    courts = db.query(Court).filter(Court.status == "pending").all()
    return courts

@app.delete("/courts/{court_id}")
def delete_court(court_id: int, db: db_dependency, current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403)
    court = db.query(Court).filter(Court.id == court_id).first()
    if not court:
        raise HTTPException(status_code=404)
    db.delete(court)
    db.commit()


@app.get("/courts")
def read_courts(db: db_dependency):
    courts = db.query(Court).filter(Court.status == "approved").all()
    return courts
    

@app.get("/courts/{court_id}")
def read_court(court_id: int, db: db_dependency):
    court = db.query(Court).filter(Court.id == court_id).first()
    if court is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)

    cutoff = datetime.now(timezone.utc) - TWO_HOURS

    # Step 1: auto-expire anyone over 2 hours (lazy cleanup)
    stale = db.query(CheckIn).filter(
        CheckIn.court_id == court_id,
        CheckIn.checkedout_time == None,
        CheckIn.checkin_time < cutoff
    ).all()
    for s in stale:
        s.checkedout_time = s.checkin_time + TWO_HOURS
    if stale:
        db.commit()

    # Step 2: fetch remaining active checkins
    active_checkins = db.query(CheckIn).filter(
        CheckIn.court_id == court_id,
        CheckIn.checkedout_time == None
    ).all()

    return {
        "id": court.id,
        "name": court.name,
        "latitude": court.latitude,
        "longitude": court.longitude,
        "status": court.status,
        "players": [c.user.username for c in active_checkins]
    }


@app.post("/courts/{court_id}/checkin")
def check_in(court_id: int, db: db_dependency, current_user: User = Depends(get_current_user)):
    court = db.query(Court).filter(Court.id == court_id).first()
    if court is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)

    cutoff = datetime.now(timezone.utc) - TWO_HOURS

    # Auto-expire any stale checkin for this user
    stale = db.query(CheckIn).filter(
        CheckIn.user_id == current_user.id,
        CheckIn.checkedout_time == None,
        CheckIn.checkin_time < cutoff
    ).first()
    if stale:
        stale.checkedout_time = stale.checkin_time + TWO_HOURS
        db.commit()

    # Now check if still actively checked in somewhere
    existing = db.query(CheckIn).filter(
        CheckIn.user_id == current_user.id,
        CheckIn.checkedout_time == None
    ).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Already checked in.")

    checkin = CheckIn(user_id=current_user.id, court_id=court_id)
    db.add(checkin)
    db.commit()
    return checkin


@app.get("/users/me/checkins")
def get_my_checkins(db: db_dependency, current_user: User = Depends(get_current_user)):
    checkins = db.query(CheckIn).filter(CheckIn.user_id == current_user.id).all()
    return checkins


@app.post("/courts/{court_id}/checkout")
def check_out(court_id: int, db: db_dependency, current_user: User = Depends(get_current_user)):
    checkin = db.query(CheckIn).filter(
        CheckIn.user_id == current_user.id,
        CheckIn.court_id == court_id,
        CheckIn.checkedout_time == None
    ).first()
    if not checkin:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Not currently checked in.")
    checkin.checkedout_time = datetime.now(timezone.utc)
    db.commit()
    return checkin

""" 
@app.post("/courts")
def create_court(name: str, latitude: float, longitude: float, db: db_dependency, current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
    court = Court(name=name, lattitude=latitude, longitude=longitude)
    db.add(court)
    db.commit()
    return court
"""


@app.post("/courts/request")
def request_court(data: schemas.CourtRequest, db: db_dependency, current_user: User = Depends(get_current_user)):
    court = Court(
        name=data.name or "Unnamed Court",
        latitude=data.latitude,
        longitude=data.longitude,
        status="pending"
    )
    db.add(court)
    db.commit()
    return court


@app.patch("/courts/{court_id}/status")
def update_court_status(court_id: int, status: str, db: db_dependency, current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403)
    court = db.query(Court).filter(Court.id == court_id).first()
    if not court:
        raise HTTPException(status_code=404)
    if status not in ("approved", "rejected", "pending"):
        raise HTTPException(status_code=400, detail="Invalid status")
    else:
        court.status = status  # "approved" or "rejected"
    db.commit()
    return court

@app.patch("/users/me", response_model=schemas.UserResponse)
def update_profile(data: schemas.UserUpdate, db: db_dependency, current_user: User = Depends(get_current_user)):
    if data.bio is not None:
        current_user.bio = data.bio
    if data.profile_picture is not None:
        current_user.profile_picture = data.profile_picture
    db.commit()
    return current_user