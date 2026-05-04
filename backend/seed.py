import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from database import SessionLocal, engine
from models import Court, Base

Base.metadata.create_all(bind=engine)

courts = [
    {"name": "Ouled Mtaa", "latitude": 33.94101, "longitude": -6.89757},
    {"name": "Karakchouat", "latitude": 33.96813, "longitude": -6.88544},
    {"name": "agdal", "latitude": 33.98592, "longitude": -6.84854},
    {"name": "beachside one", "latitude": 33.99653, "longitude": -6.87933},
    {"name": "beachside two", "latitude": 33.98602, "longitude": -6.89091},
    {"name": "beachside three", "latitude": 33.96938, "longitude": -6.90962},
    {"name": "beachside circle", "latitude": 33.97509, "longitude": -6.90107},
]

db = SessionLocal()

for court in courts:
    db.add(Court(**court))

db.commit()
db.close()
print("Courts seeded successfully")