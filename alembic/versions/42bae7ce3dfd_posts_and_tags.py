"""posts and tags

Revision ID: 42bae7ce3dfd
Revises: 
Create Date: 2017-06-28 19:36:45.934395

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '42bae7ce3dfd'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table('posts',
                    sa.Column('id', sa.Integer(), nullable=False),
                    sa.Column('content', sa.Text(), nullable=True),
                    sa.Column('title', sa.String(), nullable=True),
                    sa.Column('created', sa.DateTime(timezone=True),
                              server_default=sa.text('now()'), nullable=True),
                    sa.Column('updated', sa.DateTime(timezone=True),
                              nullable=True),
                    sa.PrimaryKeyConstraint('id')
                    )
    op.create_table('tags',
                    sa.Column('id', sa.Integer(), nullable=False),
                    sa.Column('name', sa.String(), nullable=True),
                    sa.PrimaryKeyConstraint('id')
                    )
    op.create_table('posttaglinks',
                    sa.Column('tag_id', sa.Integer(), nullable=True),
                    sa.Column('post_id', sa.Integer(), nullable=True),
                    sa.ForeignKeyConstraint(['post_id'], ['posts.id'], ),
                    sa.ForeignKeyConstraint(['tag_id'], ['tags.id'], )
                    )


def downgrade():
    op.drop_table('posttaglinks')
    op.drop_table('tags')
    op.drop_table('posts')
