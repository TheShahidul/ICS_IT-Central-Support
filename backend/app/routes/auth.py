"""Authentication API routes."""
from flask import Blueprint, request

from app.services.auth_service import (
    authenticate_user,
    get_current_user,
    login_user,
    logout_user,
)


auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')


@auth_bp.post('/login')
def login():
    data = request.get_json(silent=True) or {}
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return {'error': 'Email and password are required'}, 400

    user = authenticate_user(email, password)
    if user is None:
        return {'error': 'Invalid email or password'}, 401

    login_user(user)
    return {'user': user.to_dict()}, 200


@auth_bp.post('/logout')
def logout():
    logout_user()
    return {'message': 'Logged out successfully'}, 200


@auth_bp.get('/me')
def me():
    user = get_current_user()
    if user is None:
        return {'error': 'Authentication required'}, 401
    return {'user': user.to_dict()}, 200
