import pytest
from app import create_app, db
from app.models import Department, User, Asset, Ticket, UserRole, AssetType, AssetStatus, TicketCategory, TicketPriority, TicketStatus


@pytest.fixture()
def app():
    app = create_app('testing')
    with app.app_context():
        db.drop_all()
        db.create_all()
        dept_it = Department(name='Information Technology')
        dept_fin = Department(name='Finance')
        db.session.add_all([dept_it, dept_fin])
        db.session.commit()

        emp = User(
            employee_id='EMP-001',
            name='Alice Employee',
            email='alice@company.com',
            role=UserRole.EMPLOYEE.value,
            department=dept_fin,
        )
        emp.set_password('password123')

        support = User(
            employee_id='IT-001',
            name='Bob Support',
            email='bob@company.com',
            role=UserRole.IT_SUPPORT.value,
            department=dept_it,
        )
        support.set_password('password123')

        db.session.add_all([emp, support])
        db.session.commit()

        asset = Asset(
            asset_tag='ASSET-100001',
            asset_type=AssetType.LAPTOP.value,
            brand='Dell',
            model='Latitude 5520',
            serial_number='SN-DELL-99',
            status=AssetStatus.ASSIGNED.value,
            assigned_to=emp.id,
            department_id=dept_fin.id,
        )
        db.session.add(asset)
        db.session.commit()

        ticket = Ticket(
            ticket_number='INC-100001',
            title='Laptop display flickering',
            description='Screen blinks black randomly',
            category=TicketCategory.HARDWARE.value,
            priority=TicketPriority.HIGH.value,
            status=TicketStatus.ASSIGNED.value,
            created_by=emp.id,
            assigned_to=support.id,
            asset_id=asset.id,
        )
        db.session.add(ticket)
        db.session.commit()

    yield app
    with app.app_context():
        db.session.remove()
        db.drop_all()


@pytest.fixture()
def client(app):
    return app.test_client()


def login(client, email, password='password123'):
    return client.post('/api/auth/login', json={'email': email, 'password': password})


def test_list_departments(client):
    login(client, 'alice@company.com')
    res = client.get('/api/departments')
    assert res.status_code == 200
    depts = res.json['departments']
    assert len(depts) == 2
    names = [d['name'] for d in depts]
    assert 'Finance' in names
    assert 'Information Technology' in names


def test_ticket_search_filter(client):
    login(client, 'bob@company.com')
    # Search matches title
    res = client.get('/api/tickets?q=flickering')
    assert res.status_code == 200
    assert len(res.json['tickets']) == 1
    assert res.json['tickets'][0]['ticket_number'] == 'INC-100001'
    assert res.json['tickets'][0]['asset']['asset_tag'] == 'ASSET-100001'

    # Search matches ticket_number
    res2 = client.get('/api/tickets?q=INC-100001')
    assert res2.status_code == 200
    assert len(res2.json['tickets']) == 1

    # Search with no match
    res3 = client.get('/api/tickets?q=printer')
    assert res3.status_code == 200
    assert len(res3.json['tickets']) == 0


def test_asset_search_and_department_filter(client):
    login(client, 'bob@company.com')
    # Search by serial number
    res = client.get('/api/assets?q=DELL-99')
    assert res.status_code == 200
    assert len(res.json['assets']) == 1
    assert res.json['assets'][0]['asset_tag'] == 'ASSET-100001'
    assert res.json['assets'][0]['department_name'] == 'Finance'
    assert res.json['assets'][0]['assigned_user_name'] == 'Alice Employee'

    # Filter by department
    dept_res = client.get('/api/departments')
    fin_dept = next(d for d in dept_res.json['departments'] if d['name'] == 'Finance')
    res_dept = client.get(f"/api/assets?department_id={fin_dept['id']}")
    assert res_dept.status_code == 200
    assert len(res_dept.json['assets']) == 1


def test_asset_tickets_history(client):
    login(client, 'bob@company.com')
    asset_res = client.get('/api/assets?q=ASSET-100001')
    asset = asset_res.json['assets'][0]
    res = client.get(f"/api/assets/{asset['id']}/tickets")
    assert res.status_code == 200
    assert len(res.json['tickets']) == 1
    assert res.json['tickets'][0]['ticket_number'] == 'INC-100001'
