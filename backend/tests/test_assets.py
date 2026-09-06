import pytest

from app import create_app, db
from app.models import AssetStatus, AssetType, Department, User, UserRole


@pytest.fixture()
def app():
    app = create_app('testing')
    with app.app_context():
        db.drop_all()
        db.create_all()
        department = Department(name='Information Technology')
        employee = User(
            employee_id='EMP-001',
            name='Test Employee',
            email='employee@company.com',
            role=UserRole.EMPLOYEE.value,
            department=department,
        )
        employee.set_password('password')
        technician = User(
            employee_id='IT-001',
            name='Test Technician',
            email='tech@company.com',
            role=UserRole.IT_SUPPORT.value,
            department=department,
        )
        technician.set_password('password')
        db.session.add_all([employee, technician])
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


def asset_payload(**overrides):
    payload = {
        'asset_type': AssetType.LAPTOP.value,
        'brand': 'Lenovo',
        'model': 'ThinkPad T14',
        'department_id': 1,
    }
    payload.update(overrides)
    return payload


def test_employee_cannot_create_assets(client):
    login(client, 'employee@company.com')

    response = client.post('/api/assets', json=asset_payload())

    assert response.status_code == 403


def test_it_support_can_create_available_asset(client):
    login(client, 'tech@company.com')

    response = client.post('/api/assets', json=asset_payload())

    assert response.status_code == 201
    assert response.json['asset']['asset_tag'] == 'ASSET-000001'
    assert response.json['asset']['status'] == AssetStatus.AVAILABLE.value


def test_asset_status_assignment_rules_are_enforced(client):
    login(client, 'tech@company.com')

    assigned_without_user = client.post(
        '/api/assets',
        json=asset_payload(status=AssetStatus.ASSIGNED.value),
    )
    assert assigned_without_user.status_code == 400

    available_with_user = client.post(
        '/api/assets',
        json=asset_payload(assigned_to=1),
    )
    assert available_with_user.status_code == 400


def test_employee_sees_only_assets_assigned_to_them(client):
    login(client, 'tech@company.com')
    client.post(
        '/api/assets',
        json=asset_payload(
            status=AssetStatus.ASSIGNED.value,
            assigned_to=1,
        ),
    )
    client.post('/api/assets', json=asset_payload())

    login(client, 'employee@company.com')
    response = client.get('/api/assets')

    assert response.status_code == 200
    assert len(response.json['assets']) == 1
    assert response.json['assets'][0]['assigned_to'] == 1
