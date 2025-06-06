from app import app
from api.models import db

#Steps to properly wipe database from all data - Paste this on terminal:
##Step1:
# psql -U gitpod -h localhost postgres
##Step2:
#SELECT pg_terminate_backend(pid) 
#FROM pg_stat_activity 
#WHERE datname = 'example' AND pid <> pg_backend_pid();
##Step3:
#\q
##Step4:
#dropdb -U gitpod -h localhost example
#createdb -U gitpod -h localhost example

#After the wipe is done we need to run reset_db with command: pipenv run python src/reset_db.py

with app.app_context():
    print("⚠️ Dropping all tables...")
    db.drop_all()

    print("✅ Creating all tables from models...")
    db.create_all()

    print("🎉 Database has been reset.")

##!!Only use this if we need to erase all data from our databse and start from scratch!!
