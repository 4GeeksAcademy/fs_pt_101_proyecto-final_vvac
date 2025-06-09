from itsdangerous import URLSafeTimedSerializer
from flask import current_app

#This will used to reset passwords by making a temporary token
def get_serializer():
    return URLSafeTimedSerializer(current_app.config['SECRET_KEY'])

#This is the email we will send the URL to reset password
def send_email(to, subject, body):
    # For development, just print the message instead of sending it
    print(f"To: {to}")
    print(f"Subject: {subject}")
    print(f"Body: {body}")