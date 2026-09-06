import pytest

from app import create_app, db
from app.models import Department, User, UserRole


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
        manager = User(
            employee_id='MGR-001', name='Manager', email='manager@company.com',
            role=UserRole.IT_MANAGER.value, department=department,
        )
        manager.set_password('password')
        db.session.add_all([employee, manager])
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


def test_only_managers_can_list_users(client):
    login(client, 'employee@company.com')
    assert client.get('/api/users').status_code == 403

    login(client, 'manager@company.com')
    response = client.get('/api/users')
    assert response.status_code == 200
    assert len(response.json['users']) == 2
    assert 'password_hash' not in response.json['users'][0]


def test_manager_can_deactivate_employee(client):
    login(client, 'manager@company.com')
    response = client.patch('/api/users/1', json={'is_active': False})

    assert response.status_code == 200
    assert response.json['user']['is_active'] is False


def test_manager_cannot_deactivate_self_or_last_manager(client):
    login(client, 'manager@company.com')
    self_response = client.patch('/api/users/2', json={'is_active': False})
    assert self_response.status_code == 400

    last_manager_response = client.patch('/api/users/2', json={'role': UserRole.EMPLOYEE.value})
    assert last_manager_response.status_code == 400


def test_user_updates_validate_role(client):
    login(client, 'manager@company.com')
    response = client.patch('/api/users/1', json={'role': 'UNKNOWN'})

    assert response.status_code == 400
    assert response.json['error'] == 'Invalid role'
