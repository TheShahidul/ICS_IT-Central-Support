"""Authentication and session helpers."""
from flask import session

from app import db
from app.models import User


def authenticate_user(email, password):
    """Return an active user with valid credentials, otherwise None."""
    if not isinstance(email, str) or not isinstance(password, str):
        return None

    user = User.query.filter_by(email=email.strip().lower()).first()
    if user is None or not user.is_active or not user.check_password(password):
        return None
    return user


def login_user(user):
    """Store the authenticated user's identifier in the Flask session."""
    session.clear()
    session.permanent = True
    session['user_id'] = user.id


def logout_user():
    """Remove the authenticated user from the Flask session."""
    session.clear()


def get_current_user():
    """Return the active user stored in the session, or None."""
    user_id = session.get('user_id')
    if user_id is None:
        return None

    user = db.session.get(User, user_id)
    if user is None or not user.is_active:
        session.clear()
        return None
    return user
