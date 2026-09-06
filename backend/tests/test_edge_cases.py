import pytest

from app import create_app, db
from app.models import (
    AssetStatus,
    AssetType,
    Department,
    TicketCategory,
    TicketStatus,
    User,
    UserRole,
)


@pytest.fixture()
def app():
    app = create_app('testing')
    with app.app_context():
        db.drop_all()
        db.create_all()
        department = Department(name='Information Technology')
        employee = User(
            employee_id='EMP-001', name='Employee', email='employee@company.com',
            role=UserRole.EMPLOYEE.value, department=department,
        )
        employee.set_password('password')
        technician = User(
            employee_id='IT-001', name='Technician', email='tech@company.com',
            role=UserRole.IT_SUPPORT.value, department=department,
        )
        technician.set_password('password')
        manager = User(
            employee_id='MGR-001', name='Manager', email='manager@company.com',
            role=UserRole.IT_MANAGER.value, department=department,
        )
        manager.set_password('password')
        db.session.add_all([employee, technician, manager])
        db.session.commit()
    yield app
    with app.app_context():
        db.session.remove()
        db.drop_all()


@pytest.fixture()
def client(app):
    return app.test_client()


def login(client, email):
    return client.post('/api/auth/login', json={'email': email, 'password': 'password'})


def ticket_payload():
    return {
        'title': 'VPN issue',
        'description': 'VPN is unavailable.',
        'category': TicketCategory.NETWORK.value,
    }


def asset_payload(**overrides):
    payload = {
        'asset_type': AssetType.LAPTOP.value,
        'brand': 'Lenovo',
        'model': 'T14',
        'department_id': 1,
    }
    payload.update(overrides)
    return payload


def test_inactive_users_cannot_login(client, app):
    with app.app_context():
        user = db.session.get(User, 1)
        user.is_active = False
        db.session.commit()

    response = login(client, 'employee@company.com')

    assert response.status_code == 401


def test_malformed_requests_return_json_errors(client):
    assert client.post('/api/auth/login', data='not-json', content_type='text/plain').status_code == 400

    login(client, 'employee@company.com')
    response = client.post('/api/tickets', json={})
    assert response.status_code == 400
    assert 'Missing required fields' in response.json['error']


def test_employee_dashboard_is_scoped_to_owned_records(client):
    login(client, 'employee@company.com')
    client.post('/api/tickets', json=ticket_payload())
    login(client, 'tech@company.com')
    client.post('/api/tickets', json=ticket_payload())

    login(client, 'employee@company.com')
    response = client.get('/api/dashboard/summary')

    assert response.status_code == 200
    assert response.json['tickets']['total'] == 1


def test_asset_update_enforces_assignment_and_dates(client):
    login(client, 'tech@company.com')
    created = client.post('/api/assets', json=asset_payload())
    asset_id = created.json['asset']['id']

    invalid_assignment = client.patch(
        f'/api/assets/{asset_id}',
        json={'status': AssetStatus.ASSIGNED.value},
    )
    assert invalid_assignment.status_code == 400

    invalid_date = client.patch(
        f'/api/assets/{asset_id}',
        json={'purchase_date': 'tomorrow'},
    )
    assert invalid_date.status_code == 400

    valid_update = client.patch(
        f'/api/assets/{asset_id}',
        json={'status': AssetStatus.ASSIGNED.value, 'assigned_to': 1},
    )
    assert valid_update.status_code == 200


def test_missing_resources_and_audit_limit_are_handled(client):
    login(client, 'manager@company.com')
    assert client.get('/api/tickets/999').status_code == 404
    assert client.get('/api/assets/999').status_code == 404

    response = client.get('/api/audit/logs?limit=101')
    assert response.status_code == 400
    assert 'between 1 and 100' in response.json['error']
