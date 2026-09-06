import pytest

from app import create_app, db
from app.models import (
    Department,
    Ticket,
    TicketCategory,
    TicketPriority,
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
    return client.post(
        '/api/auth/login',
        json={'email': email, 'password': 'password'},
    )


def ticket_payload(**overrides):
    payload = {
        'title': 'Cannot connect to VPN',
        'description': 'The VPN connection fails with an authentication error.',
        'category': TicketCategory.NETWORK.value,
        'priority': TicketPriority.MEDIUM.value,
    }
    payload.update(overrides)
    return payload


def test_employee_can_create_and_only_see_own_tickets(client):
    assert login(client, 'employee@company.com').status_code == 200

    response = client.post('/api/tickets', json=ticket_payload())
    assert response.status_code == 201
    assert response.json['ticket']['status'] == TicketStatus.OPEN.value

    list_response = client.get('/api/tickets')
    assert list_response.status_code == 200
    assert len(list_response.json['tickets']) == 1


def test_critical_ticket_requires_assignment(client):
    login(client, 'employee@company.com')

    response = client.post(
        '/api/tickets',
        json=ticket_payload(priority=TicketPriority.CRITICAL.value),
    )

    assert response.status_code == 400
    assert 'require technician assignment' in response.json['error']


def test_employee_cannot_update_operational_fields(client):
    login(client, 'employee@company.com')
    created = client.post('/api/tickets', json=ticket_payload())
    ticket_id = created.json['ticket']['id']

    response = client.patch(
        f'/api/tickets/{ticket_id}',
        json={'status': TicketStatus.IN_PROGRESS.value},
    )

    assert response.status_code == 403


def test_it_support_can_resolve_then_close_ticket(client):
    login(client, 'employee@company.com')
    created = client.post('/api/tickets', json=ticket_payload())
    ticket_id = created.json['ticket']['id']

    login(client, 'tech@company.com')
    assigned = client.patch(
        f'/api/tickets/{ticket_id}',
        json={'assigned_to': 2, 'status': TicketStatus.IN_PROGRESS.value},
    )
    assert assigned.status_code == 200

    resolved = client.patch(
        f'/api/tickets/{ticket_id}',
        json={
            'status': TicketStatus.RESOLVED.value,
            'resolution': 'Reset the VPN profile and confirmed connectivity.',
        },
    )
    assert resolved.status_code == 200

    closed = client.patch(
        f'/api/tickets/{ticket_id}',
        json={'status': TicketStatus.CLOSED.value},
    )
    assert closed.status_code == 200
    assert closed.json['ticket']['status'] == TicketStatus.CLOSED.value


def test_ticket_comments_require_text(client):
    login(client, 'employee@company.com')
    created = client.post('/api/tickets', json=ticket_payload())
    ticket_id = created.json['ticket']['id']

    response = client.post(f'/api/tickets/{ticket_id}/comments', json={'comment': ' '})

    assert response.status_code == 400
    assert response.json['error'] == 'Comment cannot be empty'


def test_only_it_roles_can_list_technicians(client):
    login(client, 'employee@company.com')
    employee_response = client.get('/api/users/technicians')
    assert employee_response.status_code == 403

    login(client, 'tech@company.com')
    technician_response = client.get('/api/users/technicians')
    assert technician_response.status_code == 200
    assert technician_response.json['users'][0]['role'] == UserRole.IT_SUPPORT.value


def test_ticket_changes_are_audited_and_logs_are_manager_only(client, app):
    login(client, 'employee@company.com')
    created = client.post('/api/tickets', json=ticket_payload())
    ticket_id = created.json['ticket']['id']

    employee_logs = client.get('/api/audit/logs')
    assert employee_logs.status_code == 403

    with app.app_context():
        manager = User(
            employee_id='MGR-001',
            name='Test Manager',
            email='manager@company.com',
            role=UserRole.IT_MANAGER.value,
            department_id=1,
        )
        manager.set_password('password')
        db.session.add(manager)
        db.session.commit()

    login(client, 'manager@company.com')
    manager_logs = client.get('/api/audit/logs?entity_type=ticket')
    assert manager_logs.status_code == 200
    assert manager_logs.json['logs'][0]['action'] == 'ticket.created'
    assert manager_logs.json['logs'][0]['entity_id'] == ticket_id
