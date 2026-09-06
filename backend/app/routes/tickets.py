"""Ticket management API routes."""
from datetime import datetime, timezone

from flask import Blueprint, g, request

from app import db
from app.middleware.auth_middleware import login_required
from app.services.audit_service import record_event
from app.models import (
    Asset,
    Ticket,
    TicketCategory,
    TicketComment,
    TicketPriority,
    TicketStatus,
    User,
    UserRole,
)
from app.utils.generators import generate_ticket_number


tickets_bp = Blueprint('tickets', __name__, url_prefix='/api/tickets')


def role_value(user):
    return user.role.value if hasattr(user.role, 'value') else user.role


def enum_values(enum_class):
    return {item.value for item in enum_class}


def validation_error(message):
    return {'error': message}, 400


def technician_required(user_id):
    if user_id is None:
        return None
    technician = db.session.get(User, user_id)
    if technician is None or not technician.is_active:
        return 'Assigned technician does not exist or is inactive'
    if role_value(technician) not in {UserRole.IT_SUPPORT.value, UserRole.IT_MANAGER.value}:
        return 'Tickets can only be assigned to IT support users'
    return None


def serialize_ticket(ticket, include_comments=False):
    data = ticket.to_dict(include_comments=include_comments)
    data['creator'] = ticket.creator.to_dict() if ticket.creator else None
    data['assigned_technician'] = (
        ticket.assigned_technician.to_dict() if ticket.assigned_technician else None
    )
    return data


@tickets_bp.get('')
@login_required
def list_tickets():
    query = Ticket.query
    user = g.current_user

    if role_value(user) == UserRole.EMPLOYEE.value:
        query = query.filter_by(created_by=user.id)

    filters = {
        'status': TicketStatus,
        'priority': TicketPriority,
        'category': TicketCategory,
    }
    for parameter, enum_class in filters.items():
        value = request.args.get(parameter)
        if value:
            if value not in enum_values(enum_class):
                return validation_error(f'Invalid {parameter}')
            query = query.filter(getattr(Ticket, parameter) == value)

    assigned_to = request.args.get('assigned_to', type=int)
    if request.args.get('assigned_to') and assigned_to is None:
        return validation_error('assigned_to must be an integer')
    if assigned_to is not None:
        query = query.filter_by(assigned_to=assigned_to)

    tickets = query.order_by(Ticket.created_at.desc()).all()
    return {'tickets': [serialize_ticket(ticket) for ticket in tickets]}, 200


@tickets_bp.post('')
@login_required
def create_ticket():
    data = request.get_json(silent=True) or {}
    required_fields = ('title', 'description', 'category')
    missing = [field for field in required_fields if not str(data.get(field, '')).strip()]
    if missing:
        return validation_error(f'Missing required fields: {", ".join(missing)}')

    category = data['category']
    priority = data.get('priority', TicketPriority.MEDIUM.value)
    status = data.get('status', TicketStatus.OPEN.value)
    if category not in enum_values(TicketCategory):
        return validation_error('Invalid category')
    if priority not in enum_values(TicketPriority):
        return validation_error('Invalid priority')
    if status != TicketStatus.OPEN.value:
        return validation_error('New tickets must start with Open status')

    assigned_to = data.get('assigned_to')
    assignment_error = technician_required(assigned_to)
    if assignment_error:
        return validation_error(assignment_error)
    if priority == TicketPriority.CRITICAL.value and assigned_to is None:
        return validation_error('Critical tickets require technician assignment')

    asset_id = data.get('asset_id')
    if asset_id is not None and db.session.get(Asset, asset_id) is None:
        return validation_error('Asset does not exist')

    ticket = Ticket(
        ticket_number=generate_ticket_number(),
        title=data['title'].strip(),
        description=data['description'].strip(),
        category=category,
        priority=priority,
        status=status,
        created_by=g.current_user.id,
        assigned_to=assigned_to,
        asset_id=asset_id,
    )
    db.session.add(ticket)
    db.session.flush()
    record_event(
        g.current_user.id,
        'ticket.created',
        'ticket',
        ticket.id,
        {'ticket_number': ticket.ticket_number, 'priority': ticket.priority},
    )
    db.session.commit()
    return {'ticket': serialize_ticket(ticket)}, 201


@tickets_bp.get('/<int:ticket_id>')
@login_required
def get_ticket(ticket_id):
    ticket = db.session.get(Ticket, ticket_id)
    if ticket is None:
        return {'error': 'Ticket not found'}, 404
    if role_value(g.current_user) == UserRole.EMPLOYEE.value and ticket.created_by != g.current_user.id:
        return {'error': 'Insufficient permissions'}, 403
    return {'ticket': serialize_ticket(ticket, include_comments=True)}, 200


@tickets_bp.patch('/<int:ticket_id>')
@login_required
def update_ticket(ticket_id):
    ticket = db.session.get(Ticket, ticket_id)
    if ticket is None:
        return {'error': 'Ticket not found'}, 404

    data = request.get_json(silent=True) or {}
    user = g.current_user
    is_employee = role_value(user) == UserRole.EMPLOYEE.value
    if is_employee and ticket.created_by != user.id:
        return {'error': 'Insufficient permissions'}, 403

    operational_fields = {'assigned_to', 'status', 'resolution'}
    if is_employee and operational_fields.intersection(data):
        return {'error': 'Employees cannot update operational ticket fields'}, 403

    if 'title' in data:
        if not isinstance(data['title'], str) or not data['title'].strip():
            return validation_error('Title cannot be empty')
        ticket.title = data['title'].strip()
    if 'description' in data:
        if not isinstance(data['description'], str) or not data['description'].strip():
            return validation_error('Description cannot be empty')
        ticket.description = data['description'].strip()
    if 'category' in data:
        if data['category'] not in enum_values(TicketCategory):
            return validation_error('Invalid category')
        ticket.category = data['category']
    if 'priority' in data:
        if data['priority'] not in enum_values(TicketPriority):
            return validation_error('Invalid priority')
        ticket.priority = data['priority']
    if 'asset_id' in data:
        if data['asset_id'] is not None and db.session.get(Asset, data['asset_id']) is None:
            return validation_error('Asset does not exist')
        ticket.asset_id = data['asset_id']

    if 'assigned_to' in data:
        assignment_error = technician_required(data['assigned_to'])
        if assignment_error:
            return validation_error(assignment_error)
        ticket.assigned_to = data['assigned_to']
        if ticket.status == TicketStatus.OPEN.value:
            ticket.status = TicketStatus.ASSIGNED.value

    if 'status' in data:
        if data['status'] not in enum_values(TicketStatus):
            return validation_error('Invalid status')
        if data['status'] == TicketStatus.RESOLVED.value:
            resolution = data.get('resolution', ticket.resolution)
            if not isinstance(resolution, str) or not resolution.strip():
                return validation_error('Resolved tickets require a resolution')
        if data['status'] == TicketStatus.CLOSED.value:
            if ticket.status != TicketStatus.RESOLVED.value:
                return validation_error('Only resolved tickets can be closed')
            if not ticket.resolution or not ticket.resolution.strip():
                return validation_error('Closed tickets require a resolution')
        if data['status'] == TicketStatus.IN_PROGRESS.value and ticket.assigned_to is None:
            return validation_error('In-progress tickets require technician assignment')
        ticket.status = data['status']

    if 'resolution' in data:
        resolution = data['resolution']
        if resolution is not None and not isinstance(resolution, str):
            return validation_error('Resolution must be text')
        if ticket.status in {TicketStatus.RESOLVED.value, TicketStatus.CLOSED.value}:
            if not resolution or not resolution.strip():
                return validation_error('Resolved tickets require a resolution')
        ticket.resolution = resolution.strip() if resolution else None

    if ticket.priority == TicketPriority.CRITICAL.value and ticket.assigned_to is None:
        return validation_error('Critical tickets require technician assignment')
    if ticket.status == TicketStatus.RESOLVED.value:
        if not ticket.resolution or not ticket.resolution.strip():
            return validation_error('Resolved tickets require a resolution')
        ticket.resolved_at = ticket.resolved_at or datetime.now(timezone.utc)
    elif ticket.status != TicketStatus.CLOSED.value:
        ticket.resolved_at = None

    record_event(
        user.id,
        'ticket.updated',
        'ticket',
        ticket.id,
        {'status': ticket.status, 'assigned_to': ticket.assigned_to},
    )
    db.session.commit()
    return {'ticket': serialize_ticket(ticket, include_comments=True)}, 200


@tickets_bp.post('/<int:ticket_id>/comments')
@login_required
def add_comment(ticket_id):
    ticket = db.session.get(Ticket, ticket_id)
    if ticket is None:
        return {'error': 'Ticket not found'}, 404
    if role_value(g.current_user) == UserRole.EMPLOYEE and ticket.created_by != g.current_user.id:
        return {'error': 'Insufficient permissions'}, 403

    data = request.get_json(silent=True) or {}
    comment_text = data.get('comment')
    if not isinstance(comment_text, str) or not comment_text.strip():
        return validation_error('Comment cannot be empty')

    comment = TicketComment(
        ticket_id=ticket.id,
        user_id=g.current_user.id,
        comment=comment_text.strip(),
    )
    db.session.add(comment)
    db.session.flush()
    record_event(
        g.current_user.id,
        'ticket.comment_added',
        'ticket',
        ticket.id,
        {'comment_id': comment.id},
    )
    db.session.commit()
    return {'comment': comment.to_dict()}, 201
