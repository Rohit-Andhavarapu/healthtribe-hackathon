"""add_meet_link_to_appointments

Revision ID: 28c9055c8f79
Revises: fa8da720e45c
Create Date: 2026-07-15 10:33:53.978805

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '28c9055c8f79'
down_revision: Union[str, None] = 'fa8da720e45c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('appointments', sa.Column('meet_link', sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column('appointments', 'meet_link')
