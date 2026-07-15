"""fix_timeline_doctor_id_fkey

Revision ID: 9085e0f700ff
Revises: 28c9055c8f79
Create Date: 2026-07-15 11:13:19.522646

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '9085e0f700ff'
down_revision: Union[str, None] = '28c9055c8f79'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_constraint('timeline_events_doctor_id_fkey', 'timeline_events', type_='foreignkey')
    op.create_foreign_key('timeline_events_doctor_id_fkey', 'timeline_events', 'doctors', ['doctor_id'], ['id'])


def downgrade() -> None:
    op.drop_constraint('timeline_events_doctor_id_fkey', 'timeline_events', type_='foreignkey')
    op.create_foreign_key('timeline_events_doctor_id_fkey', 'timeline_events', 'users', ['doctor_id'], ['id'])
