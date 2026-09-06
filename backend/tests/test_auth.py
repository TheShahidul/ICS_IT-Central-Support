import pytest

from app import create_app, db
from app.middleware.auth_middleware import login_required, role_required
from app.models import Department, User, UserRole


@pytest.fixture()
def app():
    app = create_app('testing')
    with app.app_context():
        db.drop_all()
        db.create_all()
        department = Department(name='Information Technology')
        user = User(
            employee_id='EMP-001',
            name='Test Employee',
            email='test@company.com',
            role=UserRole.EMPLOYEE.value,
            department=department,
        )
        user.set_password('correct-password')
        db.session.add(user)
        db.session.commit()
    yield app
    with app.app_context():
        db.session.remove()
        db.drop_all()


@pytest.fixture()
def client(app):
    return app.test_client()


def test_login_returns_user_without_password_hash(client):
    response = client.post(
        '/api/auth/login',
        json={'email': 'test@company.com', 'password': 'correct-password'},
    )

    assert response.status_code == 200
    assert response.json['user']['email'] == 'test@company.com'
    assert 'password_hash' not in response.json['user']


def test_login_rejects_invalid_credentials(client):
    response = client.post(
        '/api/auth/login',
        json={'email': 'test@company.com', 'password': 'wrong-password'},
    )

    assert response.status_code == 401
    assert response.json['error'] == 'Invalid email or password'


def test_login_requires_email_and_password(client):
    response = client.post('/api/auth/login', json={'email': 'test@company.com'})

    assert response.status_code == 400
    assert response.json['error'] == 'Email and password are required'


def test_me_requires_authentication_and_logout_clears_session(client):
    assert client.get('/api/auth/me').status_code == 401

    client.post(
        '/api/auth/login',
        json={'email': 'test@company.com', 'password': 'correct-password'},
    )
    assert client.get('/api/auth/me').status_code == 200

    client.post('/api/auth/logout')
    assert client.get('/api/auth/me').status_code == 401


def test_login_required_and_role_required_decorators(client):
    @client.application.get('/api/test-protected')
    @login_required
    def protected():
        return {'ok': True}

    @client.application.get('/api/test-it-only')
    @role_required(UserRole.IT_SUPPORT, UserRole.IT_MANAGER)
    def it_only():
        return {'ok': True}

    assert client.get('/api/test-protected').status_code == 401
    assert client.get('/api/test-it-only').status_code == 401

    client.post(
        '/api/auth/login',
        json={'email': 'test@company.com', 'password': 'correct-password'},
    )
    assert client.get('/api/test-protected').status_code == 200
    assert client.get('/api/test-it-only').status_code == 403
