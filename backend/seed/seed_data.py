"""
Seed data generator for ICS - IT Central Support

This script creates realistic demo data for development and testing.
All data is fictional and for demonstration purposes only.

Usage:
    python -c "from seed.seed_data import seed_database; seed_database()"
"""
from datetime import datetime, timedelta, timezone, date
from random import choice, randint, sample
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import db, create_app
from app.models import (
    Department, User, Ticket, TicketComment, Asset,
    UserRole, TicketCategory, TicketPriority, TicketStatus,
    AssetType, AssetStatus
)
from app.utils.generators import generate_ticket_number, generate_asset_tag

# ============================================================================
# DEMO DATA
# ============================================================================

DEPARTMENT_NAMES = [
    "Finance",
    "Operations",
    "Research",
    "Human Resources",
    "Information Technology",
    "Management"
]

# Fictional user data - Bangladeshi names
EMPLOYEE_DATA = [
    ("Tahsin", "Rahman", "trahman"),
    ("Rakib", "Chowdhury", "rchowdhury"),
    ("Md. Shahidul", "Islam Prodhan", "mshahidul"),
    ("Tanvir", "Hasan", "thasan"),
    ("Farhana", "Akter", "fakter"),
    ("Sabbir", "Hossain", "shossain"),
    ("Anika", "Tabassum", "atabassum"),
    ("Nafis", "Ahmed", "nahmed"),
    ("Sadia", "Sultana", "ssultana"),
    ("Mahmudul", "Hasan", "mhasan"),
    ("Tasnim", "Jahan", "tjahan"),
    ("Ashraful", "Islam", "aislam"),
    ("Nusrat", "Sharmin", "nsharmin"),
    ("Kamrul", "Hasan", "khasan"),
    ("Mehedi", "Hasan", "mhasan2"),
    ("Ayesha", "Siddiqua", "asiddiqua"),
    ("Zubair", "Mahmood", "zmahmood"),
    ("Farhan", "Ishrak", "fishrak"),
]

TICKET_DESCRIPTIONS = [
    "Unable to access company email",
    "Laptop running very slowly",
    "Monitor not displaying properly",
    "Need VPN access",
    "Can't connect to printer",
    "Password reset needed",
    "Software license expiration",
    "Network connectivity issues",
    "Require new equipment",
    "Account locked out",
    "Video conferencing not working",
    "File sharing issues",
    "System crash - please investigate",
    "Need additional storage space",
    "Hardware malfunction detected",
    "Need admin privileges for software",
    "Internet connection drops frequently",
    "Keyboard/Mouse not working",
    "Audio issues during meetings",
    "Backup failed - restore needed",
]

ASSET_BRANDS = {
    "Laptop": ["Dell", "HP", "Lenovo", "Apple", "ASUS"],
    "Desktop": ["Dell", "HP", "Lenovo", "ASUS", "Acer"],
    "Monitor": ["Dell", "LG", "HP", "ASUS", "BenQ"],
    "Printer": ["HP", "Canon", "Brother", "Xerox", "Ricoh"],
    "Router": ["Cisco", "Netgear", "TP-Link", "Ubiquiti", "Fortinet"],
    "Switch": ["Cisco", "Netgear", "HP", "Arista", "Juniper"],
    "Mobile Device": ["Apple", "Samsung", "Google", "Microsoft", "OnePlus"],
}

ASSET_MODELS = {
    "Laptop": ["XPS 13", "Pavilion 15", "ThinkPad X1", "MacBook Pro", "VivoBook 15"],
    "Desktop": ["OptiPlex 7090", "EliteDesk 800", "IdeaCentre 5", "VivoPC", "Aspire X"],
    "Monitor": ["U2720Q", "27UP550", "E243i", "VP249HE", "EW2880U"],
    "Printer": ["LaserJet Pro M404", "imageRUNNER 2425", "HL-L8360CDW", "VersaLink C405", "MP C6502"],
    "Router": ["Catalyst 9120", "Netgear Rax80", "Archer AX12", "UniFi Pro Max", "FortiGate 100F"],
    "Switch": ["Catalyst 2960X", "Netgear GSM7328", "ProCurve 2920", "Arista DCS-7050Q", "EX4600"],
    "Mobile Device": ["iPhone 15", "Galaxy S24", "Pixel 8", "Surface Duo", "OnePlus 12"],
}

# ============================================================================
# SEED FUNCTIONS
# ============================================================================

def create_departments():
    """Create department records"""
    departments = []
    for name in DEPARTMENT_NAMES:
        dept = Department(name=name)
        departments.append(dept)
        db.session.add(dept)
    db.session.commit()
    print(f"[OK] Created {len(departments)} departments")
    return departments


def create_users(departments):
    """Create user records with realistic data"""
    users = []
    department_counters = {}
    ics_counter = 0

    def create_user(name, role, dept):
        nonlocal ics_counter
        if role in [UserRole.IT_SUPPORT, UserRole.IT_MANAGER]:
            ics_counter += 1
            user_number = ics_counter
            email = f"user_id{user_number}.ics@company.com"
        else:
            department_key = dept.name.lower().replace(' ', '-')
            department_counters[department_key] = department_counters.get(department_key, 0) + 1
            user_number = department_counters[department_key]
            email = f"user_id{user_number}.{department_key}@company.com"

        user = User(
            employee_id=f"USER{len(users) + 1:03d}",
            name=name,
            email=email,
            role=role,
            department_id=dept.id,
            is_active=True,
        )
        user.set_password(f"user_id{user_number}")
        users.append(user)
        db.session.add(user)

    create_user("Tahsin Rahman", UserRole.EMPLOYEE, departments[0])
    create_user("Rakib Chowdhury", UserRole.IT_SUPPORT, departments[4])
    create_user("Md. Shahidul Islam Prodhan", UserRole.IT_MANAGER, departments[4])

    for first, last, email_prefix in EMPLOYEE_DATA[3:]:
        dept = choice(departments)
        role = choice([UserRole.EMPLOYEE, UserRole.EMPLOYEE, UserRole.IT_SUPPORT])  # More employees
        create_user(f"{first} {last}", role, dept)
    
    db.session.commit()
    print(f"[OK] Created {len(users)} users")
    return users


def create_assets(departments, users):
    """Create asset records"""
    assets = []
    it_support_users = [u for u in users if u.role in [UserRole.IT_SUPPORT, UserRole.IT_MANAGER]]
    other_users = [u for u in users if u.role == UserRole.EMPLOYEE]
    
    asset_types_list = list(AssetType)
    
    for i in range(30):
        asset_type = choice(asset_types_list)
        brand = choice(ASSET_BRANDS.get(asset_type.value, ["Generic"]))
        model = choice(ASSET_MODELS.get(asset_type.value, ["Model X"]))
        
        # Decide status and assigned user
        status_choice = randint(1, 10)
        if status_choice <= 6:  # 60% assigned
            status = AssetStatus.ASSIGNED
            assigned_user = choice(other_users)
        elif status_choice <= 8:  # 20% available
            status = AssetStatus.AVAILABLE
            assigned_user = None
        elif status_choice <= 9:  # 10% under repair
            status = AssetStatus.UNDER_REPAIR
            assigned_user = None
        else:  # 10% retired
            status = AssetStatus.RETIRED
            assigned_user = None
        
        purchase_date = date.today() - timedelta(days=randint(365, 1825))  # 1-5 years ago
        warranty_expiry = purchase_date + timedelta(days=365*3)  # 3-year warranty
        
        asset = Asset(
            asset_tag=generate_asset_tag(),
            asset_type=asset_type.value,
            brand=brand,
            model=model,
            serial_number=f"SN-{randint(100000, 999999)}",
            purchase_date=purchase_date,
            warranty_expiry=warranty_expiry,
            status=status.value,
            assigned_to=assigned_user.id if assigned_user else None,
            department_id=assigned_user.department_id if assigned_user else choice(departments).id,
            notes=f"Asset purchased {purchase_date.year}"
        )
        assets.append(asset)
        db.session.add(asset)
    
    db.session.commit()
    print(f"[OK] Created {len(assets)} assets")
    return assets


def create_tickets(users, assets):
    """Create ticket records with realistic data"""
    tickets = []
    
    employees = [u for u in users if u.role == UserRole.EMPLOYEE]
    it_staff = [u for u in users if u.role in [UserRole.IT_SUPPORT, UserRole.IT_MANAGER]]
    
    categories = list(TicketCategory)
    priorities = list(TicketPriority)
    statuses = list(TicketStatus)
    
    for i in range(50):
        creator = choice(employees)
        assigned = choice(it_staff) if randint(1, 10) > 3 else None  # 70% assigned
        
        category = choice(categories)
        priority = choice(priorities)
        
        # Status distribution
        status_choice = randint(1, 100)
        if status_choice <= 20:
            status = TicketStatus.OPEN
        elif status_choice <= 40:
            status = TicketStatus.ASSIGNED
        elif status_choice <= 60:
            status = TicketStatus.IN_PROGRESS
        elif status_choice <= 90:
            status = TicketStatus.RESOLVED
        else:
            status = TicketStatus.CLOSED
        
        # Critical tickets should be assigned
        if priority == TicketPriority.CRITICAL:
            assigned = choice(it_staff)
            status = choice([TicketStatus.ASSIGNED, TicketStatus.IN_PROGRESS])
        
        # Resolved/closed tickets must have resolution
        resolution = None
        resolved_at = None
        if status in [TicketStatus.RESOLVED, TicketStatus.CLOSED]:
            resolution = "Issue has been resolved. Please verify and close if satisfied."
            resolved_at = datetime.now(timezone.utc) - timedelta(days=randint(1, 30))
        
        asset = choice(assets) if randint(1, 3) > 1 else None  # 67% have related asset
        
        ticket = Ticket(
            ticket_number=generate_ticket_number(),
            title=choice(TICKET_DESCRIPTIONS),
            description=choice(TICKET_DESCRIPTIONS) + " - Please investigate and provide assistance.",
            category=category.value,
            priority=priority.value,
            status=status.value,
            created_by=creator.id,
            assigned_to=assigned.id if assigned else None,
            asset_id=asset.id if asset else None,
            resolution=resolution,
            resolved_at=resolved_at
        )
        tickets.append(ticket)
        db.session.add(ticket)
    
    db.session.commit()
    print(f"[OK] Created {len(tickets)} tickets")
    return tickets


def create_comments(tickets, users):
    """Create ticket comments"""
    comments = []
    
    it_staff = [u for u in users if u.role in ["IT_SUPPORT", "IT_MANAGER"]]
    
    for ticket in tickets:
        # 60% of tickets have comments
        if randint(1, 100) <= 60:
            num_comments = randint(1, 3)
            for j in range(num_comments):
                commenter = choice(it_staff) if randint(1, 2) > 1 else ticket.creator
                
                comment_texts = [
                    "Investigating the issue.",
                    "Awaiting additional information from user.",
                    "Found the root cause - applying fix.",
                    "Installed latest drivers.",
                    "Escalated to vendor support.",
                    "User has confirmed issue is resolved.",
                    "Checking system logs for errors.",
                    "Scheduled maintenance window.",
                ]
                
                comment = TicketComment(
                    ticket_id=ticket.id,
                    user_id=commenter.id,
                    comment=choice(comment_texts)
                )
                comments.append(comment)
                db.session.add(comment)
    
    db.session.commit()
    print(f"[OK] Created {len(comments)} ticket comments")
    return comments


def seed_database():
    """Main function to seed the entire database"""
    print("\n" + "="*60)
    print("Seeding ICS - IT Central Support Database")
    print("="*60 + "\n")
    
    try:
        # Create all tables
        db.create_all()
        print("[OK] Database tables created\n")
        
        # Check if data already exists
        if Department.query.first():
            print("[!] Database already seeded. Skipping...")
            return
        
        # Seed data
        departments = create_departments()
        users = create_users(departments)
        assets = create_assets(departments, users)
        tickets = create_tickets(users, assets)
        comments = create_comments(tickets, users)
        
        print("\n" + "="*60)
        print("[OK] Database seeding completed successfully!")
        print("="*60)
        print("\nDemo Credentials:")
        print("  Email: user_id1.finance@company.com | Password: user_id1 (EMPLOYEE)")
        print("  Email: user_id1.ics@company.com | Password: user_id1 (IT_SUPPORT)")
        print("  Email: user_id2.ics@company.com | Password: user_id2 (IT_MANAGER)")
        print("\nStatistics:")
        print(f"  * Departments: {len(departments)}")
        print(f"  * Users: {len(users)}")
        print(f"  * Assets: {len(assets)}")
        print(f"  * Tickets: {len(tickets)}")
        print(f"  * Comments: {len(comments)}")
        print("="*60 + "\n")
        
    except Exception as e:
        print(f"\n[ERROR] Error seeding database: {e}")
        db.session.rollback()
        raise


if __name__ == '__main__':
    # Create app and seed database
    app = create_app('development')
    with app.app_context():
        seed_database()
