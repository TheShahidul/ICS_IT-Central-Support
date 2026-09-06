"""Operational dashboard API routes."""
from collections import Counter

from flask import Blueprint, g

from app import db
from app.middleware.auth_middleware import login_required
from app.models import Asset, Ticket, UserRole


dashboard_bp = Blueprint('dashboard', __name__, url_prefix='/api/dashboard')


def role_value(user):
    return user.role.value if hasattr(user.role, 'value') else user.role


@dashboard_bp.get('/summary')
@login_required
def summary():
    user = g.current_user
    ticket_query = Ticket.query
    asset_query = Asset.query
    if role_value(user) == UserRole.EMPLOYEE.value:
        ticket_query = ticket_query.filter_by(created_by=user.id)
        asset_query = asset_query.filter_by(assigned_to=user.id)

    tickets = ticket_query.all()
    assets = asset_query.all()
    return {
        'tickets': {
            'total': len(tickets),
            'by_status': dict(Counter(ticket.status for ticket in tickets)),
            'by_priority': dict(Counter(ticket.priority for ticket in tickets)),
        },
        'assets': {
            'total': len(assets),
            'by_status': dict(Counter(asset.status for asset in assets)),
        },
    }, 200
