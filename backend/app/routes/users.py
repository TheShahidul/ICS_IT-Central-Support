"""Small user lookup endpoints used by operational workflows."""
from flask import Blueprint, g, request

from app import db
from app.middleware.auth_middleware import login_required
from app.models import Department, User, UserRole
from app.services.audit_service import record_event


users_bp = Blueprint('users', __name__, url_prefix='/api/users')


def role_value(user):
    return user.role.value if hasattr(user.role, 'value') else user.role


def manager_only():
    return role_value(g.current_user) == UserRole.IT_MANAGER.value


@users_bp.get('/technicians')
@login_required
def technicians():
    if role_value(g.current_user) == UserRole.EMPLOYEE.value:
        return {'error': 'Insufficient permissions'}, 403

    users = User.query.filter(
        User.role.in_([UserRole.IT_SUPPORT.value, UserRole.IT_MANAGER.value]),
        User.is_active.is_(True),
    ).order_by(User.name).all()
    return {'users': [user.to_dict() for user in users]}, 200


@users_bp.get('')
@login_required
def list_users():
    if not manager_only():
        return {'error': 'Insufficient permissions'}, 403
    users = User.query.order_by(User.name).all()
    return {'users': [user.to_dict() for user in users]}, 200


@users_bp.patch('/<int:user_id>')
@login_required
def update_user(user_id):
    if not manager_only():
        return {'error': 'Insufficient permissions'}, 403

    user = db.session.get(User, user_id)
    if user is None:
        return {'error': 'User not found'}, 404
    data = request.get_json(silent=True) or {}

    if 'name' in data and (not isinstance(data['name'], str) or not data['name'].strip()):
        return {'error': 'Name cannot be empty'}, 400
    if 'role' in data and data['role'] not in {item.value for item in UserRole}:
        return {'error': 'Invalid role'}, 400
    if 'department_id' in data and db.session.get(Department, data['department_id']) is None:
        return {'error': 'Department does not exist'}, 400
    if 'is_active' in data and not isinstance(data['is_active'], bool):
        return {'error': 'is_active must be boolean'}, 400
    if user.id == g.current_user.id and data.get('is_active') is False:
        return {'error': 'You cannot deactivate your own account'}, 400

    resulting_role = data.get('role', user.role)
    resulting_active = data.get('is_active', user.is_active)
    removing_manager = (
        user.role == UserRole.IT_MANAGER.value
        and user.is_active
        and (resulting_role != UserRole.IT_MANAGER.value or not resulting_active)
    )
    if removing_manager:
        active_manager_count = User.query.filter_by(
            role=UserRole.IT_MANAGER.value,
            is_active=True,
        ).count()
        if active_manager_count <= 1:
            return {'error': 'At least one active manager is required'}, 400

    if 'name' in data:
        user.name = data['name'].strip()
    for field in ('role', 'department_id', 'is_active'):
        if field in data:
            setattr(user, field, data[field])

    record_event(
        g.current_user.id,
        'user.updated',
        'user',
        user.id,
        {'role': user.role, 'is_active': user.is_active},
    )
    db.session.commit()
    return {'user': user.to_dict()}, 200
