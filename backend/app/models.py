"""
SQLAlchemy database models for ICS - IT Central Support
"""
from app import db
from datetime import datetime, timezone
from enum import Enum
from werkzeug.security import generate_password_hash, check_password_hash

# ============================================================================
# ENUMERATIONS
# ============================================================================

class UserRole(str, Enum):
    """User role enumeration"""
    EMPLOYEE = "EMPLOYEE"
    IT_SUPPORT = "IT_SUPPORT"
    IT_MANAGER = "IT_MANAGER"

class TicketCategory(str, Enum):
    """Ticket category enumeration"""
    HARDWARE = "Hardware"
    SOFTWARE = "Software"
    NETWORK = "Network"
    ACCOUNT_ACCESS = "Account & Access"
    SECURITY = "Security"
    OTHER = "Other"

class TicketPriority(str, Enum):
    """Ticket priority enumeration"""
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    CRITICAL = "Critical"

class TicketStatus(str, Enum):
    """Ticket status enumeration"""
    OPEN = "Open"
    ASSIGNED = "Assigned"
    IN_PROGRESS = "In Progress"
    RESOLVED = "Resolved"
    CLOSED = "Closed"

class AssetType(str, Enum):
    """Asset type enumeration"""
    LAPTOP = "Laptop"
    DESKTOP = "Desktop"
    MONITOR = "Monitor"
    PRINTER = "Printer"
    ROUTER = "Router"
    SWITCH = "Switch"
    MOBILE_DEVICE = "Mobile Device"
    OTHER = "Other"

class AssetStatus(str, Enum):
    """Asset status enumeration"""
    AVAILABLE = "Available"
    ASSIGNED = "Assigned"
    UNDER_REPAIR = "Under Repair"
    RETIRED = "Retired"
    LOST = "Lost"

# ============================================================================
# MODELS
# ============================================================================

class Department(db.Model):
    """Department model"""
    __tablename__ = 'department'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.now(timezone.utc))
    
    # Relationships
    users = db.relationship('User', backref='department', lazy=True, cascade='all, delete-orphan')
    assets = db.relationship('Asset', backref='department', lazy=True, cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<Department {self.name}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'created_at': self.created_at.isoformat()
        }


class User(db.Model):
    """User model"""
    __tablename__ = 'user'
    
    id = db.Column(db.Integer, primary_key=True)
    employee_id = db.Column(db.String(50), unique=True, nullable=False)
    name = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(50), default=UserRole.EMPLOYEE, nullable=False)
    department_id = db.Column(db.Integer, db.ForeignKey('department.id'), nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.now(timezone.utc))
    
    # Relationships
    created_tickets = db.relationship('Ticket', backref='creator', lazy=True, foreign_keys='Ticket.created_by', cascade='all, delete-orphan')
    assigned_tickets = db.relationship('Ticket', backref='assigned_technician', lazy=True, foreign_keys='Ticket.assigned_to')
    comments = db.relationship('TicketComment', backref='author', lazy=True, cascade='all, delete-orphan')
    assigned_assets = db.relationship('Asset', backref='assigned_user', lazy=True, foreign_keys='Asset.assigned_to')
    
    def __repr__(self):
        return f'<User {self.email}>'
    
    def set_password(self, password):
        """Set password hash"""
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        """Verify password"""
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self, include_password=False):
        data = {
            'id': self.id,
            'employee_id': self.employee_id,
            'name': self.name,
            'email': self.email,
            'role': self.role,
            'department_id': self.department_id,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat()
        }
        if include_password:
            data['password_hash'] = self.password_hash
        return data


class Ticket(db.Model):
    """Ticket model"""
    __tablename__ = 'ticket'
    
    id = db.Column(db.Integer, primary_key=True)
    ticket_number = db.Column(db.String(20), unique=True, nullable=False)  # e.g., INC-000001
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(50), nullable=False)
    priority = db.Column(db.String(50), default=TicketPriority.MEDIUM, nullable=False)
    status = db.Column(db.String(50), default=TicketStatus.OPEN, nullable=False)
    created_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    assigned_to = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    asset_id = db.Column(db.Integer, db.ForeignKey('asset.id'), nullable=True)
    resolution = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=datetime.now(timezone.utc), onupdate=datetime.now(timezone.utc))
    resolved_at = db.Column(db.DateTime, nullable=True)
    
    # Relationships
    asset = db.relationship('Asset', backref='tickets', lazy=True)
    comments = db.relationship('TicketComment', backref='ticket', lazy=True, cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<Ticket {self.ticket_number}>'
    
    def to_dict(self, include_comments=False):
        data = {
            'id': self.id,
            'ticket_number': self.ticket_number,
            'title': self.title,
            'description': self.description,
            'category': self.category,
            'priority': self.priority,
            'status': self.status,
            'created_by': self.created_by,
            'assigned_to': self.assigned_to,
            'asset_id': self.asset_id,
            'resolution': self.resolution,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'resolved_at': self.resolved_at.isoformat() if self.resolved_at else None
        }
        if include_comments:
            data['comments'] = [comment.to_dict() for comment in self.comments]
        return data


class TicketComment(db.Model):
    """Ticket comment model"""
    __tablename__ = 'ticket_comment'
    
    id = db.Column(db.Integer, primary_key=True)
    ticket_id = db.Column(db.Integer, db.ForeignKey('ticket.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    comment = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.now(timezone.utc))
    
    def __repr__(self):
        return f'<TicketComment {self.id}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'ticket_id': self.ticket_id,
            'user_id': self.user_id,
            'comment': self.comment,
            'created_at': self.created_at.isoformat()
        }


class Asset(db.Model):
    """Asset model"""
    __tablename__ = 'asset'
    
    id = db.Column(db.Integer, primary_key=True)
    asset_tag = db.Column(db.String(20), unique=True, nullable=False)  # e.g., ASSET-000001
    asset_type = db.Column(db.String(50), nullable=False)
    brand = db.Column(db.String(100), nullable=False)
    model = db.Column(db.String(100), nullable=False)
    serial_number = db.Column(db.String(100), nullable=True)
    purchase_date = db.Column(db.Date, nullable=True)
    warranty_expiry = db.Column(db.Date, nullable=True)
    status = db.Column(db.String(50), default=AssetStatus.AVAILABLE, nullable=False)
    assigned_to = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    department_id = db.Column(db.Integer, db.ForeignKey('department.id'), nullable=False)
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.now(timezone.utc))
    
    def __repr__(self):
        return f'<Asset {self.asset_tag}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'asset_tag': self.asset_tag,
            'asset_type': self.asset_type,
            'brand': self.brand,
            'model': self.model,
            'serial_number': self.serial_number,
            'purchase_date': self.purchase_date.isoformat() if self.purchase_date else None,
            'warranty_expiry': self.warranty_expiry.isoformat() if self.warranty_expiry else None,
            'status': self.status,
            'assigned_to': self.assigned_to,
            'department_id': self.department_id,
            'notes': self.notes,
            'created_at': self.created_at.isoformat()
        }


class AuditLog(db.Model):
    """Immutable record of important user and operational actions."""
    __tablename__ = 'audit_log'

    id = db.Column(db.Integer, primary_key=True)
    actor_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    action = db.Column(db.String(80), nullable=False)
    entity_type = db.Column(db.String(50), nullable=False)
    entity_id = db.Column(db.Integer, nullable=False)
    details = db.Column(db.JSON, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.now(timezone.utc), nullable=False)

    actor = db.relationship('User', backref='audit_logs', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'actor_id': self.actor_id,
            'action': self.action,
            'entity_type': self.entity_type,
            'entity_id': self.entity_id,
            'details': self.details or {},
            'created_at': self.created_at.isoformat(),
        }
