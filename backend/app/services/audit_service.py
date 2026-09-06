"""Helpers for recording and querying operational audit events."""
from app import db
from app.models import AuditLog


def record_event(actor_id, action, entity_type, entity_id, details=None):
    """Add an audit event to the current transaction."""
    event = AuditLog(
        actor_id=actor_id,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        details=details or {},
    )
    db.session.add(event)
    return event