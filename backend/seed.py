import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from database import SessionLocal, engine
from models import Court, Base

Base.metadata.create_all(bind=engine)

courts = courts = [
    {"name": "Ouled Mtaa", "latitude": 33.94101, "longitude": -6.89757, "status": "approved"},
    {"name": "Karakchouat", "latitude": 33.96813, "longitude": -6.88544, "status": "approved"},
    # ... rest with "status": "approved"
]

db = SessionLocal()

for court in courts:
    db.add(Court(**court))

db.commit()
db.close()
print("Courts seeded successfully")