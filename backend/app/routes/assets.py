"""Asset inventory API routes."""
from datetime import date

from flask import Blueprint, g, request

from app import db
from app.middleware.auth_middleware import login_required
from app.services.audit_service import record_event
from app.models import Asset, AssetStatus, AssetType, Department, User, UserRole
from app.utils.generators import generate_asset_tag


assets_bp = Blueprint('assets', __name__, url_prefix='/api/assets')


def role_value(user):
    return user.role.value if hasattr(user.role, 'value') else user.role


def can_manage_assets():
    return role_value(g.current_user) in {
        UserRole.IT_SUPPORT.value,
        UserRole.IT_MANAGER.value,
    }


def validation_error(message):
    return {'error': message}, 400


def parse_date(value, field_name):
    if value is None:
        return None, None
    try:
        return date.fromisoformat(value), None
    except (TypeError, ValueError):
        return None, f'{field_name} must use YYYY-MM-DD format'


def validate_assignment(status, assigned_to):
    if status == AssetStatus.ASSIGNED.value and assigned_to is None:
        return 'Assigned assets require an assigned user'
    if status == AssetStatus.AVAILABLE.value and assigned_to is not None:
        return 'Available assets cannot have an assigned user'
    if assigned_to is not None:
        user = db.session.get(User, assigned_to)
        if user is None or not user.is_active:
            return 'Assigned user does not exist or is inactive'
    return None


@assets_bp.get('')
@login_required
def list_assets():
    query = Asset.query
    if role_value(g.current_user) == UserRole.EMPLOYEE.value:
        query = query.filter_by(assigned_to=g.current_user.id)

    status = request.args.get('status')
    if status:
        if status not in {item.value for item in AssetStatus}:
            return validation_error('Invalid status')
        query = query.filter_by(status=status)

    asset_type = request.args.get('asset_type')
    if asset_type:
        if asset_type not in {item.value for item in AssetType}:
            return validation_error('Invalid asset_type')
        query = query.filter_by(asset_type=asset_type)

    assets = query.order_by(Asset.asset_tag).all()
    return {'assets': [asset.to_dict() for asset in assets]}, 200


@assets_bp.post('')
@login_required
def create_asset():
    if not can_manage_assets():
        return {'error': 'Insufficient permissions'}, 403

    data = request.get_json(silent=True) or {}
    required = ('asset_type', 'brand', 'model', 'department_id')
    missing = [field for field in required if not str(data.get(field, '')).strip()]
    if missing:
        return validation_error(f'Missing required fields: {", ".join(missing)}')
    if data['asset_type'] not in {item.value for item in AssetType}:
        return validation_error('Invalid asset_type')
    status = data.get('status', AssetStatus.AVAILABLE.value)
    if status not in {item.value for item in AssetStatus}:
        return validation_error('Invalid status')
    if db.session.get(Department, data['department_id']) is None:
        return validation_error('Department does not exist')

    assignment_error = validate_assignment(status, data.get('assigned_to'))
    if assignment_error:
        return validation_error(assignment_error)
    purchase_date, error = parse_date(data.get('purchase_date'), 'purchase_date')
    if error:
        return validation_error(error)
    warranty_expiry, error = parse_date(data.get('warranty_expiry'), 'warranty_expiry')
    if error:
        return validation_error(error)

    asset = Asset(
        asset_tag=generate_asset_tag(),
        asset_type=data['asset_type'],
        brand=data['brand'].strip(),
        model=data['model'].strip(),
        serial_number=data.get('serial_number'),
        purchase_date=purchase_date,
        warranty_expiry=warranty_expiry,
        status=status,
        assigned_to=data.get('assigned_to'),
        department_id=data['department_id'],
        notes=data.get('notes'),
    )
    db.session.add(asset)
    db.session.flush()
    record_event(
        g.current_user.id,
        'asset.created',
        'asset',
        asset.id,
        {'asset_tag': asset.asset_tag, 'status': asset.status},
    )
    db.session.commit()
    return {'asset': asset.to_dict()}, 201


@assets_bp.get('/<int:asset_id>')
@login_required
def get_asset(asset_id):
    asset = db.session.get(Asset, asset_id)
    if asset is None:
        return {'error': 'Asset not found'}, 404
    if role_value(g.current_user) == UserRole.EMPLOYEE.value and asset.assigned_to != g.current_user.id:
        return {'error': 'Insufficient permissions'}, 403
    return {'asset': asset.to_dict()}, 200


@assets_bp.patch('/<int:asset_id>')
@login_required
def update_asset(asset_id):
    if not can_manage_assets():
        return {'error': 'Insufficient permissions'}, 403

    asset = db.session.get(Asset, asset_id)
    if asset is None:
        return {'error': 'Asset not found'}, 404
    data = request.get_json(silent=True) or {}

    for field in ('asset_type', 'status'):
        if field in data:
            allowed = AssetType if field == 'asset_type' else AssetStatus
            if data[field] not in {item.value for item in allowed}:
                return validation_error(f'Invalid {field}')
    if 'department_id' in data and db.session.get(Department, data['department_id']) is None:
        return validation_error('Department does not exist')

    status = data.get('status', asset.status)
    assigned_to = data.get('assigned_to', asset.assigned_to)
    assignment_error = validate_assignment(status, assigned_to)
    if assignment_error:
        return validation_error(assignment_error)

    for field in ('asset_type', 'brand', 'model', 'serial_number', 'notes', 'department_id', 'assigned_to', 'status'):
        if field in data:
            setattr(asset, field, data[field].strip() if isinstance(data[field], str) else data[field])
    for field in ('purchase_date', 'warranty_expiry'):
        if field in data:
            parsed, error = parse_date(data[field], field)
            if error:
                return validation_error(error)
            setattr(asset, field, parsed)

    record_event(
        g.current_user.id,
        'asset.updated',
        'asset',
        asset.id,
        {'status': asset.status, 'assigned_to': asset.assigned_to},
    )
    db.session.commit()
    return {'asset': asset.to_dict()}, 200
