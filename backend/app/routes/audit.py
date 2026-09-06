"""Manager-only audit log API."""
from flask import Blueprint, g, request

from app import db
from app.middleware.auth_middleware import login_required
from app.models import AuditLog, UserRole


audit_bp = Blueprint('audit', __name__, url_prefix='/api/audit')


def role_value(user):
    return user.role.value if hasattr(user.role, 'value') else user.role


@audit_bp.get('/logs')
@login_required
def list_logs():
    if role_value(g.current_user) != UserRole.IT_MANAGER.value:
        return {'error': 'Insufficient permissions'}, 403

    limit = request.args.get('limit', default=50, type=int)
    if limit is None or limit < 1 or limit > 100:
        return {'error': 'limit must be between 1 and 100'}, 400

    query = AuditLog.query
    action = request.args.get('action')
    entity_type = request.args.get('entity_type')
    if action:
        query = query.filter_by(action=action)
    if entity_type:
        query = query.filter_by(entity_type=entity_type)

    logs = query.order_by(AuditLog.created_at.desc()).limit(limit).all()
    return {'logs': [log.to_dict() for log in logs]}, 200
