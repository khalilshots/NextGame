from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.orm import DeclarativeBase
import os


DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./NEXTGAME.db")

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}#if using backup sqlite database
engine = create_engine(DATABASE_URL, connect_args=connect_args)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class Base(DeclarativeBase):
    pass

