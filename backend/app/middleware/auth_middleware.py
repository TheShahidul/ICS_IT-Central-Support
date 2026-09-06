"""Decorators for authentication and role-based authorization."""
from functools import wraps

from flask import g

from app.services.auth_service import get_current_user


def login_required(view):
    """Require an active session before calling a route."""
    @wraps(view)
    def wrapped_view(*args, **kwargs):
        user = get_current_user()
        if user is None:
            return {'error': 'Authentication required'}, 401
        g.current_user = user
        return view(*args, **kwargs)

    return wrapped_view


def role_required(*allowed_roles):
    """Require an authenticated user whose role matches an allowed value."""
    allowed_values = {
        role.value if hasattr(role, 'value') else str(role)
        for role in allowed_roles
    }

    def decorator(view):
        @wraps(view)
        def wrapped_view(*args, **kwargs):
            user = get_current_user()
            if user is None:
                return {'error': 'Authentication required'}, 401

            user_role = user.role.value if hasattr(user.role, 'value') else str(user.role)
            if user_role not in allowed_values:
                return {'error': 'Insufficient permissions'}, 403

            g.current_user = user
            return view(*args, **kwargs)

        return wrapped_view

    return decorator
