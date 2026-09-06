"""
Utility functions for ICS - IT Central Support
"""
from app import db
from app.models import Ticket, Asset

def generate_ticket_number():
    """
    Generate next ticket number in format INC-000001
    
    Returns:
        str: Next ticket number (e.g., INC-000001)
    """
    last_ticket = Ticket.query.order_by(Ticket.id.desc()).first()
    
    if not last_ticket:
        next_number = 1
    else:
        # Extract number from existing ticket_number (INC-000001 -> 1)
        current_number = int(last_ticket.ticket_number.split('-')[1])
        next_number = current_number + 1
    
    return f"INC-{next_number:06d}"


def generate_asset_tag():
    """
    Generate next asset tag in format ASSET-000001
    
    Returns:
        str: Next asset tag (e.g., ASSET-000001)
    """
    last_asset = Asset.query.order_by(Asset.id.desc()).first()
    
    if not last_asset:
        next_number = 1
    else:
        # Extract number from existing asset_tag (ASSET-000001 -> 1)
        current_number = int(last_asset.asset_tag.split('-')[1])
        next_number = current_number + 1
    
    return f"ASSET-{next_number:06d}"
