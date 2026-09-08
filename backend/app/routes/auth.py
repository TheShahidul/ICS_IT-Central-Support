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


@auth_bp.post('/demo-login')
def demo_login():
    """1-click demo persona login without requiring manual credentials."""
    from app.models import User, UserRole
    data = request.get_json(silent=True) or {}
    role = data.get('role', 'EMPLOYEE')

    valid_roles = {r.value for r in UserRole}
    target_role = role if role in valid_roles else UserRole.EMPLOYEE.value

    # Find the demo user for this role
    user = User.query.filter_by(role=target_role, is_active=True).first()
    if user is None:
        # Fallback to any active user
        user = User.query.filter_by(is_active=True).first()
    if user is None:
        return {'error': 'No demo accounts available'}, 404

    login_user(user)
    return {'user': user.to_dict(), 'message': f'Logged in as demo {target_role}'}, 200
