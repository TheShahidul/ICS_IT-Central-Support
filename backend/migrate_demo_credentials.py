"""Update an existing local demo database to role-oriented credentials."""
import re

from app import create_app, db
from app.models import User, UserRole


app = create_app('development')

with app.app_context():
    department_counters = {}
    ics_counter = 0
    users = User.query.order_by(User.id).all()

    for user in users:
        is_ics_staff = user.role in {
            UserRole.IT_SUPPORT.value,
            UserRole.IT_MANAGER.value,
            UserRole.IT_SUPPORT,
            UserRole.IT_MANAGER,
        }
        if is_ics_staff:
            ics_counter += 1
            number = ics_counter
            email = f'user_id{number}.ics@company.com'
        else:
            department_key = re.sub(r'[^a-z0-9]+', '-', user.department.name.lower()).strip('-')
            department_counters[department_key] = department_counters.get(department_key, 0) + 1
            number = department_counters[department_key]
            email = f'user_id{number}.{department_key}@company.com'

        user.email = email
        user.set_password(f'user_id{number}')

    db.session.commit()
    print(f'Updated {len(users)} local demo users')
