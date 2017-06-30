"""
App configuration
"""

from os import getenv


SQLALCHEMY_DB_URL = getenv(
    'SQLALCHEMY_DB_URL',
    'postgresql://mplanchard:this-is-the-development-password'
    '@localhost:5432/blog'
)

# This token is for development only and is overriden on deploy
DEFAULT_ADMIN_TOKEN = 'Cormo-Proplasm-Corkwood-Estramacon-Channel'

ADMIN_TOKEN = getenv('ADMIN_TOKEN', DEFAULT_ADMIN_TOKEN)

DEFAULT_LIMIT = 10

DEFAULT_OFFSET = 0
