"""Department lookup API routes."""
from flask import Blueprint
from app.middleware.auth_middleware import login_required
from app.models import Department

departments_bp = Blueprint('departments', __name__, url_prefix='/api/departments')


@departments_bp.get('')
@login_required
def list_departments():
    """List all departments."""
    departments = Department.query.order_by(Department.name).all()
    return {'departments': [dept.to_dict() for dept in departments]}, 200
